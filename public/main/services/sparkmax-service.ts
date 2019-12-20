/**
 * Facade for sparkmax-server communications
 */

import {ChildProcess, execFile} from "child_process";
import {BrowserWindow, dialog, DownloadItem, ipcMain} from "electron";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";

import SparkServer from "../server/sparkmax-server";
import {HOST, PORT} from "../../program-args";
import {ListRequestDto} from "../../proto-gen";
import {getTargetWindow, notifyCallback, onOneWayCall, onTwoWayCall, onTwoWayCallPromise} from "./ipc-main-calls";
import {SparkmaxContext} from "../server/SparkmaxContext";
import {timerResourceFactory} from "../server/TimerResource";
import {ConfigParam} from "../../proto-gen/SPARK-MAX-Types_dto_pb";
import {getAppDataPath} from "../config";
import {logger} from "../loggers";
import {TelemetryResource, telemetryResourceFactory} from "../server/TelemetryResource";

// Only temporary, hopefully... this is because electron-dl has no type definition file.
const {download} = require('electron-dl');
const opn = require("opn");

const isWin: boolean = process.platform === "win32";
const server: SparkServer = new SparkServer(HOST, PORT);

let usbProc: ChildProcess | null = null;
let firmwareID: any = null;

const getDeviceIdWithNewCanId = (device: string, newCanId: number) => {
  const deviceId = Number(device);
  const oldCanId = deviceId % 100;
  return ((deviceId - oldCanId) + newCanId).toString();
};

const pingResourceFactory = timerResourceFactory((device) =>
    new Promise((resolve) => {
      server.ping({}, (pingErr: any, pingResponse: any) => {
        let doDisconnect = false;
        if (pingErr) {
          logger.error("Error during ping call", pingErr);
          doDisconnect = true;
        } else {
          if (!pingResponse.connected && firmwareID === null) {
            console.log("Detected device disconnect");
            doDisconnect = true;
          }
        }
        if (doDisconnect) {
          context.disconnectDevice();

          server.disconnect({device}, (disconnectErr: any) => {
            console.log("Disconnected " + device + " from the SPARK server");
            notifyCallback(getTargetWindow(), "disconnect", disconnectErr, device);
            resolve();
          });
        } else if (pingResponse.updateRequired) {
          notifyCallback(getTargetWindow(), "resync");
        } else {
          resolve();
        }
      });
    }),
  1000);

/**
 * Heartbeat processor is used by `heartbeat` {@link IResource} to send the latest setpoint value
 */
const heartbeatProcessor = (_: string, attributes: { [name: string]: any }) =>
  new Promise<void>((resolve, reject) => {
    console.log(`[TELEMETRY] PID_SLOT = ${attributes.pidSlot}, SP = ${attributes.setpoint}`);
    const telemetryResource = tryTelemetryResource();
    if (telemetryResource) {
      telemetryResource.emitData(attributes.device);
    }
    server.setpoint(
      {root: {device: attributes.device}, enable: true, setpoint: attributes.setpoint, pidSlot: attributes.pidSlot},
      (err: any, response: any) => {
        if (err) {
          reject(err);
          return;
        }

        notifyCallback(getTargetWindow(), "heartbeat", attributes.device, response);
        resolve(response);
      });
  });

const context = new SparkmaxContext([pingResourceFactory]);

// all URLs should be relative ./build directory
const dllFolder = process.env.NODE_ENV === "production" ? "../../../" : "../bin/";

/**
 * Return unique name of heartbeat resource for each device
 * @param device
 */
const getHeartbeatResourceName = (device: string) => `heartbeat:${device}`;

/**
 * Returns `TelemetryResource` if it exists
 */
const tryTelemetryResource = () => context.getResource("telemetry") as TelemetryResource | undefined;
/**
 * Returns `TelemetryResource` if it exists, otherwise throws an error
 */
const getTelemetryResource = () => {
  const resource = tryTelemetryResource();
  if (resource == null) {
    throw new Error("TelemetryResource does not exist");
  }
  return resource;
};

onTwoWayCall("start-server", (cb, port: any) => {
  if (!port) {
    port = 8001;
  }
  const relPath = dllFolder + "sparkmax" + (isWin ? ".exe" : "");
  const exePath = path.join(__dirname, relPath);
  if (fs.existsSync(exePath)) {
    try {
      usbProc = execFile(exePath, ["-r", "-p", port], (error: any, stdout: any) => {
        console.log("Successfully started the SPARK server. PID is " + (usbProc as ChildProcess).pid);
        cb(error);
      });
      console.log("Successfully started the SPARK server.");
      cb();
    } catch (e) {
      console.log("There was an error starting the SPARK server. " + e);
      cb(e);
    }
  } else {
    console.log("The SPARK server executable was not found for your operating system. (" + exePath + ")");
    cb("The SPARK server executable was not found for your operating system. (" + exePath + ")");
  }
});

ipcMain.on("kill-server", () => {
  if (usbProc !== null) {
    console.log("Killing " + usbProc.pid);
    (usbProc as ChildProcess).kill();
  }
});

onTwoWayCall("connect", (cb, device: string, descriptor?: string) => {
  console.log("Attempting to connect on " + device + "...");
  // If device is already connected, just return it
  server.connect({device, path: descriptor}, (err: any, response: any) => {
    if (err) {
      cb(err);
    } else {
      context.connectDevice(device);
      cb(null, response);
    }
  });
});

onTwoWayCall("disconnect", (cb, device?: string) => {
  console.log("Disconnecting on " + (device ? device : "the current device") + "...");

  // Wait until all current processing is finished
  context.pause()
    .then(() => {
      server.disconnect({device}, (err: any, response: any) => {
        if (err) {
          // When disconnect is failed, we suppose that we are still connected
          context.resume();
          cb(err);
        } else {
          context.disconnectDevice();
          cb(null, device);
        }
      });
    });
});

onTwoWayCall("identify", (cb, canId: number, uniqueId: number) => {
  server.identify({canId, uniqueId}, (err: any, response: string) => {
    if (err) {
      cb(err);
      return;
    }

    cb(null, response);
  });
});

onTwoWayCall("set-param", (cb, device: string, parameter: number, value: any) => {
  let afterSetParam: Promise<any>;

  const setParameter = util.promisify(server.setParameter).bind(server);

  if (parameter === ConfigParam.kCanID) {
    // If we set CanId field we have to pause all background activities,
    // and resume them later with the new CanId
    afterSetParam = context.pause()
      .then(() => setParameter({root: {device}, value, parameter}))
      .then((response) =>
        context.changeDeviceId(getDeviceIdWithNewCanId(device, value))
          .then(() => response))
      .finally(() => context.resume());
  } else {
    afterSetParam = setParameter({root: {device}, value, parameter});
  }

  afterSetParam
    .then((response) => cb(null, response))
    .catch((reason) => cb(reason));
});

onTwoWayCall("id-assignment", (cb, canId: number, uniqueId: number) => {
  const idAssignment = util.promisify(server.idAssignment).bind(server);

  const afterIdAssignment = context.pause()
    .then(() => idAssignment({uniqueId, canId}))
    .then((response) =>
      context.changeDeviceId(getDeviceIdWithNewCanId(context.currentDevice!, canId))
        .then(() => response))
    .finally(() => context.resume());

  afterIdAssignment
    .then((response) => cb(null, response))
    .catch((reason) => cb(reason));
});

onTwoWayCall("get-param", (cb, device: string, parameter: any) => {
  server.getParameter({root: {device}, parameter}, (err: any, response: string) => {
    if (err) {
      cb(err);
      return;
    }

    setTimeout(() => cb(null, response));
  });
});

onTwoWayCall("get-param-list", (cb, device: string) => {
  server.getParameterList({root: {device}}, (err: any, response: any[]) => {
    if (err) {
      cb(err);
      return;
    }

    setTimeout(() => cb(null, response));
  });
});

onTwoWayCall("list-device", (cb, request: ListRequestDto) => {
  server.list(request, (err: any, response: any) => {
    if (err) {
      cb(err);
    } else {
      cb(null, response);
    }
  });
});

onTwoWayCall("burn-flash", (cb, device: string) => {
  server.burnFlash({root: {device}}, (err: any, response: any) => {
    if (err) {
      cb(err);
      return;
    }

    cb(null, response);
  });
});

onTwoWayCall("restore-defaults", (cb, device: string, fullWipe: boolean) => {
  server.factoryReset({root: {device}, fullWipe, burnAfterWrite: true}, (err: any, response: any) => {
    if (err) {
      cb(err);
      return;
    }

    setTimeout(() => cb(null, response), 1000);
  });
});

onOneWayCall("enable-heartbeat", (device, pidSlot, setpoint, interval) => {
  if (!context.isResourceExist(getHeartbeatResourceName(device))) {
    console.log(`Enabling heartbeat for '${device}' for every ${interval} ms`);
    // Create and start heartbeat resource
    context.newDeviceResource(
      getHeartbeatResourceName(device),
      timerResourceFactory(heartbeatProcessor, interval, {device, pidSlot, setpoint}));
  }
});

onOneWayCall("disable-heartbeat", (device: string) => {
  if (context.isResourceExist(getHeartbeatResourceName(device))) {
    console.log(`Disabling heartbeat for '${device}'`);
    // Stop heartbeat resource
    context.releaseDeviceResource(getHeartbeatResourceName(device))
      .then(() => {
        server.setpoint({root: {device}, enable: false, setpoint: 0}, (err: any, response: any) => {
          notifyCallback(getTargetWindow(), "heartbeat", device, response);
        })
      });
  }
});

onOneWayCall("set-setpoint", (device: string, pidSlot: number, newSetpoint: number) => {
  if (context.isResourceExist(getHeartbeatResourceName(device))) {
    // Use given setpoint for the specified device
    const resource = context.getResource(getHeartbeatResourceName(device));
    resource.setAttribute("pidSlot", pidSlot);
    resource.setAttribute("setpoint", newSetpoint);
  }
});

onTwoWayCall("telemetry-list", (cb, device: string) => {
  server.telemetryList({root: {device}}, (error: any, response: any) => {
    if (error) {
      cb(error);
      return;
    }

    cb(null, response);
  });
});

onOneWayCall("telemetry-start", () => {
  // Create and start "telemetry" resource
  context.newDeviceResource(
    "telemetry",
    () =>
      telemetryResourceFactory(
        server.telemetryStream(),
        (event) => notifyCallback(getTargetWindow(), "telemetry-event", event)));
});

onOneWayCall("telemetry-stop", () => {
  context.releaseDeviceResource("telemetry");
});

onOneWayCall("telemetry-signal-add", (deviceId: string, signalId: number) => {
  const resource = getTelemetryResource();
  resource.addSignal(deviceId, signalId);
});

onOneWayCall("telemetry-signal-remove", (deviceId: string, signalId: number) => {
  const resource = getTelemetryResource();
  resource.removeSignal(deviceId, signalId);
});

onTwoWayCall("telemetry-running-signals", (cb) => {
  const resource = tryTelemetryResource();
  cb(null, resource ? resource.getSignals() : []);
});

onTwoWayCallPromise("load-firmware", (recover: boolean, filename: string, devicesToUpdate: string[]) => {
  if (!fs.existsSync(filename)) {
    return Promise.reject("Error loading firmware. Firmware file was not found on the file system.");
  } else {
    if (firmwareID === null) {
      let onResolve: (response: any) => void;
      let onReject: (error: any) => void;

      const askForProgress = () => server.firmwareLoadOrRecover(recover, {}, (error: any, response: any) => {
        if (error) {
          notifyCallback(getTargetWindow(), "load-firmware-progress", error, recover);
          onReject(error);
          return;
        }

        if (response.isUpdating && !response.updateComplete) {
          notifyCallback(getTargetWindow(), "load-firmware-progress", error, recover, response);
          scheduleFirmwareProgress();
        } else {
          setTimeout(() => onResolve(response), 3000);
        }
      });

      const scheduleFirmwareProgress = () => {
        firmwareID = global.setTimeout(askForProgress, 500);
      };

      return context.pause()
        .then(() => new Promise((resolve, reject) => {
            onResolve = resolve;
            onReject = reject;

            server.firmwareLoadOrRecover(recover, {filename, devicesToUpdate}, (error: any) => {
              if (error) {
                onReject(error);
                return;
              }

              scheduleFirmwareProgress();
            })
          })
        )
        .finally(() => {
          context.resume();
          firmwareID = null;
        });
    } else {
      return Promise.resolve();
    }
  }
});

onTwoWayCall("request-firmware", (cb) => {
  const firmwareDir = getAppDataPath("firmware");
  dialog.showOpenDialog(BrowserWindow.getFocusedWindow() as BrowserWindow, {
    filters: [{name: "Firmware Files (*.dfu)", extensions: ["dfu"]}],
    properties: ["openFile"],
    title: "Firmware Loading",
    defaultPath: firmwareDir
  }, (filePaths) => {
    if (filePaths && filePaths.length > 0) {
      cb(null, filePaths);
    }
  });
});

onTwoWayCall("get-firmware", (cb, device) => {
  server.firmware({root: {device}}, (error: any, response: any) => {
    if (error) {
      cb(error);
      return;
    }

    cb(null, response);
  });
});

onOneWayCall("show-info", (title: any, message: any) => {
  dialog.showMessageBox(BrowserWindow.getFocusedWindow() as BrowserWindow, {
    detail: message,
    message: "",
    title: title as string,
    type: "info",
  });
});

onTwoWayCall("download", (cb, url: string) => {
  const firmwareDir = getAppDataPath("firmware");
  const parsedUrl = url.split("/");
  const fileName = parsedUrl[parsedUrl.length - 1];
  console.log(`Received download request from ${url}`);
  fs.mkdir(firmwareDir, {recursive: true}, (dirError: any) => {
    if (fs.existsSync(path.join(firmwareDir, fileName))) {
      const msg = "Firmware already exists. Not downloading.";
      console.log(msg);
      cb(null, msg);
    } else {
      console.log(`Download started from ${url}`);
      download(BrowserWindow.getFocusedWindow() as BrowserWindow, url, {directory: firmwareDir})
        .then((saved: DownloadItem) => {
          const msg = `Download finished. Located in ${saved.getSavePath()}`;
          console.log(msg);
          cb(null, msg);
        }).catch((error: any) => {
        console.error(error);
        cb(error);
      });
    }
  });
});

ipcMain.on("open-url", (event: any, url: string) => {
  opn(url);
});
