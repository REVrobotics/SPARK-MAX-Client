/**
 * Facade for application configuration management
 */

import {stubTrue, stubFalse} from "lodash";
import * as fs from "fs";
import * as util from "util";
import {onTwoWayCall} from "./ipc-main-calls";
import {appDataPath, configPath} from "../config";
import {logger} from "../loggers";

const fsAccess = util.promisify(fs.access);
const fsMkDir = util.promisify(fs.mkdir);
const fsExists = (pathToTest: string) => fsAccess(pathToTest, fs.constants.R_OK).then(stubTrue).catch(stubFalse);
const fsWriteFile = util.promisify(fs.writeFile);
const fsReadFile = util.promisify(fs.readFile);

const onError = (str: string) => (err: Error) => {
  console.error(`${str}: `, err);
  return Promise.reject(err);
};

const readConfigJson = () => {
  return fsReadFile(configPath)
    .then((buffer) => {
      try {
        return JSON.parse(buffer.toString());
      } catch(err) {
        return {};
      }
    })
    .catch((err) => {
      logger.error("Error during reading config file: ", err);
      return {};
    });
};

fsExists(appDataPath)
  .then((exists) => exists ?
    undefined
    : fsMkDir(appDataPath, {recursive: true}).catch(onError("Error creating directory")))
  .then(() => fsExists(configPath))
  .then((exists) => exists ?
    undefined
    : fsWriteFile(configPath, "{}").catch(onError("Error creating configuration file")));

onTwoWayCall("config-get", (cb, pathName) => {
  readConfigJson().then((json) => cb(null, json[pathName])).catch(cb);
});

onTwoWayCall("config-get-all", (cb) => {
  readConfigJson().then((json) => cb(null, json)).catch(cb);
});

onTwoWayCall("config-set", (cb, pathName, value) => {
  readConfigJson()
    .then((storeJSON) => {
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
    })
    .catch(cb);
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
