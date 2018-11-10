import {app, ipcMain} from "electron";
import * as fs from "fs";
import * as path from "path";

const appDataPath = app.getPath("appData") + path.sep + app.getName();

ipcMain.on("config-get", (event: any, pathName: string) => {
  const filePath = path.join(appDataPath, "config.json");
  fs.readFile(filePath, (readErr, data) => {
    if (readErr) {
      event.sender.send("config-get-response", readErr, null);
    } else {
      const storeJSON = JSON.parse(data.toString());
      event.sender.send("config-get-response", null, storeJSON[pathName]);
    }
  });
});

ipcMain.on("config-set", (event: any, pathName: string, value: any) => {
  const filePath = path.join(appDataPath, "config.json");
  fs.readFile(filePath, (readErr, data) => {
    if (readErr) {
      event.sender.send("config-set-response", readErr, null);
    } else {
      const storeJSON = JSON.parse(data.toString());
      if (typeof storeJSON[pathName] === "undefined") {
        storeJSON[pathName] = {};
      }
      storeJSON[pathName] = value;
      fs.writeFile(filePath, JSON.stringify(storeJSON), (writeErr) => {
        if (writeErr) {
          event.sender.send("config-set-response", writeErr, null);
        } else {
          event.sender.send("config-set-response", null, storeJSON);
        }
      });
    }
  });
});