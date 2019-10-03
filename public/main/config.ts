import {app} from "electron";
import * as fs from "fs";
import * as path from "path";
import {onTwoWayCall} from "./ipc-main-calls";

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

onTwoWayCall("config-get", (cb, pathName) => {
  const filePath = path.join(appDataPath, "config.json");
  fs.readFile(filePath, (readErr, data) => {
    if (readErr) {
      cb(readErr);
    } else {
      const storeJSON = JSON.parse(data.toString());
      cb(null, storeJSON[pathName]);
    }
  });
});

onTwoWayCall("config-get-all", (cb) => {
  const filePath = path.join(appDataPath, "config.json");
  fs.readFile(filePath, (readErr, data) => {
    if (readErr) {
      cb(readErr);
    } else {
      const storeJSON = JSON.parse(data.toString());
      cb(null, storeJSON);
    }
  });
});

onTwoWayCall("config-set", (cb, pathName, value) => {
  const filePath = path.join(appDataPath, "config.json");
  fs.readFile(filePath, (readErr, data) => {
    if (readErr) {
      cb(readErr);
    } else {
      const storeJSON = JSON.parse(data.toString());
      if (typeof storeJSON[pathName] === "undefined") {
        storeJSON[pathName] = "";
      }
      storeJSON[pathName] = value;
      fs.writeFile(filePath, JSON.stringify(storeJSON), (writeErr) => {
        if (writeErr) {
          cb(writeErr);
        } else {
          cb(null, storeJSON);
        }
      });
    }
  });
});

onTwoWayCall("config-set-all", (cb, value) => {
  const filePath = path.join(appDataPath, "config.json");
  fs.writeFile(filePath, JSON.stringify(value), (writeErr) => {
    if (writeErr) {
      cb(writeErr);
    } else {
      cb(null, value);
    }
  });
});