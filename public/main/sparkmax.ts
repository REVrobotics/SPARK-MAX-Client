import {ChildProcess, execFile} from "child_process";
import {BrowserWindow, dialog, ipcMain} from "electron";
import * as fs from "fs";
import * as path from "path";
import SparkServer from "./sparkmax-server";

const isProd = true;
const isWin: boolean = process.platform === "win32";
const server: SparkServer = new SparkServer("127.0.0.1", 8001);

let usbProc: ChildProcess | null = null;
let heartbeatID: any = null;
let connCheckID: any = null;
let setpoint: number = 0;
let currentDevice: string = "";

const dllFolder = isProd ? "../../../../" : "../../bin/";

ipcMain.on("start-server", (event: any, port: any) => {
  if (!port) {
    port = 8001;
  }
  const relPath = dllFolder + "sparkmax" + (isWin ? ".exe" : "");
  const exePath = path.join(__dirname, relPath);
  if (fs.existsSync(exePath)) {
    try {
      usbProc = execFile(exePath, ["-r", "-p", port], (error: any, stdout: any) => {
        console.log("Successfully started the SPARK server.");
        event.sender.send("start-server-response", error);
      });
      console.log("Successfully started the SPARK server.");
      event.sender.send("start-server-response");
    } catch (e) {
      console.log("There was an error starting the SPARK server. " + e);
      event.sender.send("start-server-response", e);
    }
  } else {
    console.log("The SPARK server executable was not found for your operating system. (" + exePath + ")");
    event.sender.send("start-server-response", "The SPARK server executable was not found for your operating system. (" + exePath + ")");
  }
});

ipcMain.on("kill-server", () => {
  if (usbProc !== null) {
    process.kill(usbProc.pid);
  }
});

ipcMain.on("connect", (event: any, device: string) => {
  console.log("Attempting to connect on " + device + "...");
  server.connect({device}, (err: any, response: any) => {
    if (err) {
      event.sender.send("connect-response", err, response);
    } else {
      currentDevice = device;
      if (connCheckID === null) {
        connCheckID = global.setInterval(() => {
          server.ping({}, (pingErr: any, pingResponse: any) => {
            if (pingErr) {
              console.error(err);
            } else {
              if (!pingResponse.connected) {
                global.clearInterval(connCheckID);
                server.disconnect({device: currentDevice, keepalive: true}, (disconnectErr: any, disconnectResponse: any) => {
                  event.sender.send("disconnect-response", err, response);
                });
              }
            }
          });
        }, 500);
      }
      event.sender.send("connect-response", err, response);
    }
  });
});

ipcMain.on("disconnect", (event: any, device: string) => {
  console.log("Disconnecting on " + device + "...");
  server.disconnect({device, keepalive: true}, (err: any, response: any) => {
    if (connCheckID !== null) {
      global.clearInterval(connCheckID);
      connCheckID = null;
    }
    event.sender.send("disconnect-response", err, response);
  });
});

ipcMain.on("set-param", (event: any, parameter: number, value: any) => {
  server.setParameter({value, parameter}, (err: any, response: any) => {
    setTimeout(() => {
      event.sender.send("set-param-" + parameter + "-response", err, response);
    });
  });
});

ipcMain.on("get-param", (event: any, parameter: any) => {
  server.getParameter({parameter}, (err: any, response: string) => {
    setTimeout(() => {
      event.sender.send("get-param-" + parameter + "-response", err, response);
    });
  });
});

ipcMain.on("list-device", (event: any) => {
  server.list({all: true}, (err: any, response: any) => {
    event.sender.send("list-device-response", err, response);
  });
});

ipcMain.on("burn-flash", (event: any) => {
  server.burnFlash({}, (err: any, response: any) => {
    event.sender.send("burn-flash-response", err, response);
  });
});

ipcMain.on("enable-heartbeat", (event: any, interval: number) => {
  if (heartbeatID === null) {
    console.log("Enabling heartbeat for every " + interval + "ms");
    heartbeatID = global.setInterval(() => {
      server.setpoint({enable: true, setpoint}, (err: any, response: any) => {
        event.sender.send("enable-heartbeat-response", err, response);
      });
    }, interval);
  }
});

ipcMain.on("disable-heartbeat", (event: any) => {
  if (heartbeatID !== -1) {
    console.log("Disabling heartbeat");
    global.clearInterval(heartbeatID);
    server.setpoint({enable: false, setpoint: 0.0}, (err: any, response: any) => {
      heartbeatID = null;
      event.sender.send("disable-heartbeat-response", err, response);
    });
  }
});

ipcMain.on("set-setpoint", (event: any, newSetpoint: number) => {
  setpoint = newSetpoint;
});

ipcMain.on("save-config", (event: any, device: string) => {
  console.log("Saving configuration to " + device + "...");
  server.burnFlash({device}, (error: any, response: any) => {
    setTimeout(() => {
      event.sender.send("save-config-response", error, response);
    });
  });
});

ipcMain.on("load-firmware", (event: any, filename: string) => {
  if (!fs.existsSync(filename)) {
    event.sender.send("load-firmware-response", "Error loading firmware. Firmware file was not found on the file system.", undefined);
  } else {
    console.log("Loading firmware...");
    server.loadFirmware({filename}, (error: any, response: any) => {
      console.log("Firmware command has exited. Sending response");
      event.sender.send("load-firmware-response", error, response);
    });
  }
});

ipcMain.on("request-firmware", (event: any) => {
  dialog.showOpenDialog(BrowserWindow.getFocusedWindow() as BrowserWindow, {
    filters: [{name: "Firmware Files (*.dfu)", extensions: ["dfu"]}],
    properties: ["openFile"],
    title: "Firmware Loading"
  }, (filePaths) => {
    event.sender.send("request-firmware-response", filePaths);
  });
});

ipcMain.on("get-firmware", (event: any) => {
  server.loadFirmware({}, (error: any, response: any) => {
    event.sender.send("get-firmware-response", error, response);
  });
});