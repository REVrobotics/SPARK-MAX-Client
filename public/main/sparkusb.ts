import {ChildProcess, execFile} from "child_process";
import {BrowserWindow, dialog, ipcMain} from "electron";
import * as fs from "fs";
import * as path from "path";
import SparkServer from "./sparkusb-server";

const isWin: boolean = process.platform === "win32";
const server: SparkServer = new SparkServer("127.0.0.1", 8001);

let usbProc: ChildProcess | null = null;
let heartbeatID: any = null;
let connCheckID: any = null;
let setpoint: number = 0;

ipcMain.on("start-server", (event: any) => {
  const relPath = "../../bin/sparkmax" + (isWin ? ".exe" : "");
  const exePath = path.join(__dirname, relPath);
  if (fs.existsSync(exePath)) {
    try {
      usbProc = execFile(exePath, ["-r"], (error: any, stdout: any) => {
        event.sender.send("start-server-response", error);
      });
      event.sender.send("start-server-response");
    } catch (e) {
      event.sender.send("start-server-response", e);
    }
  } else {
    event.sender.send("start-server-response", "The sparkusb executable was not found for your operating system. (" + exePath + ")");
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
      event.sender.send("connect-response", err, response);
    }
    if (connCheckID === null) {
      // TODO - Connection stuff.
    }
  });
});

ipcMain.on("disconnect", (event: any, device: string) => {
  console.log("Disconnecting on " + device + "...");
  server.disconnect({device, keepalive: true}, (err: any, response: any) => {
    if (connCheckID !== null) {
      clearInterval(connCheckID);
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
    console.log(parameter, response);
    event.sender.send("get-param-" + parameter + "-response", err, response);
  });
});

ipcMain.on("list-device", (event: any) => {
  server.list({all: true}, (err: any, response: any) => {
    event.sender.send("list-device-response", err, response);
  });
});

ipcMain.on("enable-heartbeat", (event: any, interval: number) => {
  if (heartbeatID === null) {
    console.log("Enabling heartbeat for every " + interval + "ms");
    heartbeatID = global.setInterval(() => {
      server.heartbeat({enable: true}, (err: any, response: any) => {
        event.sender.send("enable-heartbeat-response", err, response);
      });
      server.setpoint({setpoint});
    }, interval);
  }
});

ipcMain.on("disable-heartbeat", (event: any) => {
  if (heartbeatID !== -1) {
    console.log("Disabling heartbeat");
    clearInterval(heartbeatID);
    server.heartbeat({enable: false}, (err: any, response: any) => {
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

ipcMain.on("request-firmware", (event: any) => {
  dialog.showOpenDialog(BrowserWindow.getFocusedWindow() as BrowserWindow, {
    filters: [{name: "Firmware Files (*.bin)", extensions: ["bin"]}],
    properties: ["openFile"],
    title: "Firmware Loading"
  }, (filePaths) => {
    if (filePaths && filePaths[0]) {
      event.sender.send("request-firmware-response", filePaths[0]);
    }
  });
});