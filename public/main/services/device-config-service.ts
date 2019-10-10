import * as util from "util";
import * as fs from "fs";
import * as path from "path";
import {deburr, omit, stubFalse, stubTrue} from "lodash";

const fsReadFile = util.promisify(fs.readFile);
const fsWriteFile = util.promisify(fs.writeFile);
const fsAccess = util.promisify(fs.access);
const fsReaddir = util.promisify(fs.readdir);
const fsUnlink = util.promisify(fs.unlink);
const fsMkdir = util.promisify(fs.mkdir);

import {onTwoWayCallPromise} from "./ipc-main-calls";
import {getAppDataPath} from "../config";

const deviceConfigPath = getAppDataPath("device-configurations");

const getDeviceConfigPath = (name: string) => path.join(deviceConfigPath, name);

const getFileNameFromPath = (filePath: string) => path.basename(filePath);

const deviceConfigToJson = (config: any) => JSON.stringify(omit(config, "filePath", "fileName", "error"), null, 2);

const nameToFsName = (name: string) => deburr(name).toLowerCase().replace(/\s+/g, "-");

const jsonToDeviceConfig = (filePath: string, json: string) => {
  const fileName = getFileNameFromPath(filePath);
  try {
    const parsedContent = JSON.parse(json.toString());
    return {
      filePath,
      fileName,
      ...parsedContent,
    };
  } catch (error) {
    return createDeviceConfigError(filePath, error);
  }

};

onTwoWayCallPromise("device-config:load", () => {
  return existsDeviceConfigDir()
    .then((exists) => exists ? readDeviceConfigs() : []);
});

onTwoWayCallPromise("device-config:create", (config) => {
  return ensureDeviceConfigDir()
    .then(() => generateUniqueFileName(config.name))
    .then((fileName) => {
      const filePath = getDeviceConfigPath(fileName);
      const configWithFileName = {
        ...config,
        fileName,
        filePath,
      };
      return fsWriteFile(filePath, deviceConfigToJson(configWithFileName)).then(() => configWithFileName);
    });
});

onTwoWayCallPromise("device-config:save", (config) => {
  return ensureDeviceConfigDir()
    .then(() => fsWriteFile(getDeviceConfigPath(config.fileName), deviceConfigToJson(config)))
    .then(() => config);
});

onTwoWayCallPromise("device-config:remove", (fileName) => {
  const configPath = getDeviceConfigPath(fileName);
  return ensureDeviceConfigDir()
    .then(() => existsFsEntry(configPath))
    .then((exists) => {
      if (exists) {
        return fsUnlink(configPath);
      }
      return;
    });
});

function generateUniqueFileName(name: string) {
  const fsName = nameToFsName(name);

  const tryName = (index: number): Promise<string> => {
    const nameToFind = index ? `${fsName}-${index}.json` : `${fsName}.json`;
    return existsFsEntry(getDeviceConfigPath(nameToFind))
      .then((exists) => exists ? tryName(index + 1) : nameToFind);
  };

  return tryName(0);
}

function readDeviceConfigs(): Promise<any[]> {
  const deviceConfigPaths = fsReaddir(deviceConfigPath);

  return deviceConfigPaths
    .then((fileNames) => Promise.all(fileNames.map(readDeviceConfig)));
}

function readDeviceConfig(fileName: string) {
  const filePath = getDeviceConfigPath(fileName);
  return fsReadFile(filePath)
    .then((content) => jsonToDeviceConfig(filePath, content.toString()))
    .catch((error) => createDeviceConfigError(filePath, error));
}

function createDeviceConfigError(filePath: string, error: Error) {
  const fileName = getFileNameFromPath(filePath);
  return {
    name: fileName,
    filePath,
    fileName,
    parameters: [] as any[],
    error: error.message,
  }
}

function existsFsEntry(pathToTest: string) {
  return fsAccess(pathToTest, fs.constants.R_OK).then(stubTrue).catch(stubFalse);
}

function existsDeviceConfigDir(): Promise<boolean> {
  return existsFsEntry(deviceConfigPath);
}

function ensureDeviceConfigDir() {
  return existsDeviceConfigDir().then((exists) => exists ? undefined : fsMkdir(deviceConfigPath));
}
