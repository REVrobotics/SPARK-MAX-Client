import {ChildProcess, execFile} from "child_process";
import {app, BrowserWindow, dialog, DownloadItem, ipcMain} from "electron";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";

import SparkServer from "./sparkmax-server";
import {HOST, PORT, USE_GRPC} from "../program-args";
import {ListRequestDto} from "../proto-gen";
import {getTargetWindow, notifyCallback, onOneWayCall, onTwoWayCall} from "./ipc-main-calls";
import {SparkmaxContext} from "./context/SparkmaxContext";
import {timerResourceFactory} from "./context/TimerResource";
import {ConfigParam} from "../proto-gen/SPARK-MAX-Types_dto_pb";

// Only temporary, hopefully... this is because electron-dl has no type definition file.
const {download} = require('electron-dl');
const opn = require("opn");

const appDataPath = app.getPath("appData") + path.sep + "REV SPARK MAX Client";
const isWin: boolean = process.platform === "win32";
const server: SparkServer = new SparkServer(HOST, PORT, USE_GRPC);

let usbProc: ChildProcess|null = null;
let setpoint: number = 0;
let firmwareID: any = null;

const getDeviceIdWithNewCanId = (device: string, canId: number) => {
  const deviceId = parseInt(device, 16);
  // tslint:disable-next-line:no-bitwise
  return ((deviceId & 0xffff00) | (canId & 0xff)).toString(16);
};

const pingResourceFactory = timerResourceFactory((device) =>
    new Promise((resolve) => {
      server.ping({}, (pingErr: any, pingResponse: any) => {
        let doDisconnect = false;
        if (pingErr) {
          console.error(pingErr);
          doDisconnect = true;
        } else {
          if (!pingResponse.connected && firmwareID === null) {
            console.log("Detected device disconnect");
            doDisconnect = true;
          }
        }
        if (doDisconnect) {
          context.disconnectHubDevice();

          server.disconnect({device, keepalive: false}, (disconnectErr: any, disconnectResponse: any) => {
            console.log("Disconnected " + device + " from the SPARK server");
            notifyCallback(getTargetWindow(), "disconnect", disconnectErr, device);
            resolve();
          });
        } else {
          resolve();
        }
      });
    }),
  1000);

const context = new SparkmaxContext([pingResourceFactory]);

// all URLs should be relative ./build directory
const dllFolder = process.env.NODE_ENV === "production" ? "../../../" : "../bin/";

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

onTwoWayCall("connect", (cb, device: string) => {
  console.log("Attempting to connect on " + device + "...");
  server.connect({device}, (err: any, response: any) => {
    if (err) {
      cb(err);
    } else {
      context.connectHubDevice(device);
      cb(null, response);
    }
  });
});

onTwoWayCall("disconnect", (cb, device: string) => {
  console.log("Disconnecting on " + device + "...");

  // Wait until all current processing is finished
  context.pause()
    .then(() => {
      server.disconnect({device}, (err: any, response: any) => {
        if (err) {
          // When disconnect is failed, we suppose that we are still connected
          context.resume();
          cb(err);
        } else {
          context.disconnectHubDevice();
          cb(null, device);
        }
      });
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
    afterSetParam = setParameter();
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

onTwoWayCall("restore-defaults", (cb, device: string) => {
  server.factoryReset({root: {device}, fullWipe: true, burnAfterWrite: true}, (err: any, response: any) => {
    if (err) {
      cb(err);
      return;
    }

    setTimeout(() => cb(null, response), 1000);
  });
});

onOneWayCall("enable-heartbeat", (interval) => {
  if (!context.isResourceExist("heartbeat")) {
    console.log("Enabling heartbeat for every " + interval + "ms");
    context.newDeviceResource("heartbeat", timerResourceFactory(
      () => new Promise((resolve) =>
        server.setpoint({enable: true, setpoint}, (err: any, response: any) => {
          notifyCallback(getTargetWindow(), "heartbeat", response);
          resolve(response);
        })),
      interval));
  }
});

onOneWayCall("disable-heartbeat", () => {
  if (context.isResourceExist("heartbeat")) {
    console.log("Disabling heartbeat");
    context.releaseDeviceResource("heartbeat");
  }
  setpoint = 0.0;
});

onOneWayCall("set-setpoint", (newSetpoint: number) => {
  setpoint = newSetpoint;
});

ipcMain.on("load-firmware", (event: any, filename: string) => {
  if (!fs.existsSync(filename)) {
    event.sender.send("load-firmware-response", "Error loading firmware. Firmware file was not found on the file system.", undefined);
  } else {
    if (firmwareID === null) {
      firmwareID = global.setInterval(() => {
        server.firmware({}, (error: any, response: any) => {
          if (response.isUpdating && !response.updateComplete) {
            event.sender.send("load-firmware-response", error, response);
          } else {
            setTimeout(() => {
              event.sender.send("load-firmware-finish", error, response);
            }, 3000);
            global.clearInterval(firmwareID);
            firmwareID = null;
          }
        });
      }, 50);
      console.log("Starting firmware update...");
      server.firmware({filename}, (error: any, response: any) => {
        if (response.updateStarted && response.updateStarted === true) {
          console.log("Disconnecting on " + context.currentDevice);
          context.disconnectHubDevice();
          server.disconnect({device: context.currentDevice});
        }
        event.sender.send("load-firmware-response", error, response);
      });
    }
  }
});

ipcMain.on("request-firmware", (event: any) => {
  const firmwareDir = path.join(appDataPath, "firmware");
  dialog.showOpenDialog(BrowserWindow.getFocusedWindow() as BrowserWindow, {
    filters: [{name: "Firmware Files (*.dfu)", extensions: ["dfu"]}],
    properties: ["openFile"],
    title: "Firmware Loading",
    defaultPath: firmwareDir
  }, (filePaths) => {
    if (filePaths && filePaths.length > 0) {
      event.sender.send("request-firmware-response", filePaths);
    }
  });
});

ipcMain.on("get-firmware", (event: any) => {
  server.firmware({}, (error: any, response: any) => {
    event.sender.send("get-firmware-response", error, response);
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

ipcMain.on("download", (event: any, url: string) => {
  const firmwareDir = path.join(appDataPath, "firmware");
  const parsedUrl = url.split("/");
  const fileName = parsedUrl[parsedUrl.length - 1];
  console.log(`Received download request from ${url}`);
  fs.mkdir(firmwareDir, {recursive: true}, (dirError: any) => {
    if (fs.existsSync(path.join(firmwareDir, fileName))) {
      console.log("Firmware already exists. Not downloading.");
    } else {
      console.log(`Download started from ${url}`);
      download(BrowserWindow.getFocusedWindow() as BrowserWindow, url, {directory: firmwareDir}).then((saved: DownloadItem) => {
        console.log(`Download finished. Located in ${saved.getSavePath()}`);
      }).catch((error: any) => {
        console.error(error);
      });
    }
  });
});

ipcMain.on("open-url", (event: any, url: string) => {
  opn(url);
});
