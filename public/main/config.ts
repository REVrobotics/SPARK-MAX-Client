import {app, ipcMain} from "electron";
import * as fs from "fs";
import * as path from "path";

const appDataPath = app.getPath("appData") + path.sep + "REV SPARK MAX Client";
const configPath = path.join(appDataPath, "config.json");

fs.mkdir(appDataPath, {recursive: true}, (dirError: any) => {
  if (!dirError) {
    fs.access(configPath, fs.constants.F_OK, (error: any) => {
      if (error) {
        fs.writeFile(configPath, "{}", (writeErr: any) => {
          if (writeErr) {
            console.log("Error creating configuration file: " + writeErr);
          }
        });
      }
    });
  } else {
    console.log("Error creating directory: " + dirError);
  }
});

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

ipcMain.on("config-get-all", (event: any) => {
  const filePath = path.join(appDataPath, "config.json");
  fs.readFile(filePath, (readErr, data) => {
    if (readErr) {
      event.sender.send("config-get-all-response", readErr, null);
    } else {
      const storeJSON = JSON.parse(data.toString());
      event.sender.send("config-get-all-response", null, storeJSON);
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
        storeJSON[pathName] = "";
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

ipcMain.on("config-set-all", (event: any, value: any) => {
  const filePath = path.join(appDataPath, "config.json");
  fs.writeFile(filePath, JSON.stringify(value), (writeErr) => {
    if (writeErr) {
      event.sender.send("config-set-all-response", writeErr, null);
    } else {
      event.sender.send("config-set-all-response", null, value);
    }
  });
});