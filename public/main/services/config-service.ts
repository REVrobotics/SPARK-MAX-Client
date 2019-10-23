/**
 * Facade for application configuration management
 */

import * as fs from "fs";
import {onTwoWayCall} from "./ipc-main-calls";
import {appDataPath, configPath} from "../config";

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
  fs.readFile(configPath, (readErr, data) => {
    if (readErr) {
      cb(readErr);
    } else {
      const storeJSON = JSON.parse(data.toString());
      cb(null, storeJSON[pathName]);
    }
  });
});

onTwoWayCall("config-get-all", (cb) => {
  fs.readFile(configPath, (readErr, data) => {
    if (readErr) {
      cb(readErr);
    } else {
      const storeJSON = JSON.parse(data.toString());
      cb(null, storeJSON);
    }
  });
});

onTwoWayCall("config-set", (cb, pathName, value) => {
  fs.readFile(configPath, (readErr, data) => {
    if (readErr) {
      cb(readErr);
    } else {
      const storeJSON = JSON.parse(data.toString());
      if (typeof storeJSON[pathName] === "undefined") {
        storeJSON[pathName] = "";
      }
      storeJSON[pathName] = value;
      fs.writeFile(configPath, JSON.stringify(storeJSON, null, 4), (writeErr) => {
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
  fs.writeFile(configPath, JSON.stringify(value), (writeErr) => {
    if (writeErr) {
      cb(writeErr);
    } else {
      cb(null, value);
    }
  });
});
