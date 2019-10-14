/**
 * Facade for device configuration management
 */

import * as util from "util";
import * as fs from "fs";
import * as path from "path";
import {deburr, omit, stubFalse, stubTrue} from "lodash";

// promisified fs methods
const fsReadFile = util.promisify(fs.readFile);
const fsWriteFile = util.promisify(fs.writeFile);
const fsAccess = util.promisify(fs.access);
const fsReaddir = util.promisify(fs.readdir);
const fsUnlink = util.promisify(fs.unlink);
const fsMkdir = util.promisify(fs.mkdir);

import {onTwoWayCallPromise} from "./ipc-main-calls";
import {getAppDataPath} from "../config";

// Root path for device configurations
const deviceConfigPath = getAppDataPath("device-configurations");

/**
 * Returns path for specific device configuration
 * @param name
 */
const getDeviceConfigPath = (name: string) => path.join(deviceConfigPath, name);

const getFileNameFromPath = (filePath: string) => path.basename(filePath);

/**
 * Converts device configuration to JSON representation
 */
const deviceConfigToJson = (config: any) => JSON.stringify(omit(config, "filePath", "fileName", "error"), null, 2);

/**
 * Normalizes name to be used as file name
 * @param name
 */
const nameToFsName = (name: string) => deburr(name).toLowerCase().replace(/\s+/g, "-");

/**
 * Converts JSON representation to device configuration
 */
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

/**
 * Loads all device configurations
 */
onTwoWayCallPromise("device-config:load", () => {
  return existsDeviceConfigDir()
    .then((exists) => exists ? readDeviceConfigs() : []);
});

/**
 * Creates new device configuration
 */
onTwoWayCallPromise("device-config:create", (config) => {
  // Ensure that root device configuration directory exists
  return ensureDeviceConfigDir()
    // Generates unique file name in device-configurations directory
    .then(() => generateUniqueFileName(config.name))
    .then((fileName) => {
      // Write device-configuration to file system
      const filePath = getDeviceConfigPath(fileName);
      const configWithFileName = {
        ...config,
        fileName,
        filePath,
      };
      return fsWriteFile(filePath, deviceConfigToJson(configWithFileName)).then(() => configWithFileName);
    });
});

// Overwrite specific device configuration
onTwoWayCallPromise("device-config:overwrite", (config) => {
  // Ensure that root device configuration directory exists
  return ensureDeviceConfigDir()
    // Write device-configuration to file system
    .then(() => fsWriteFile(getDeviceConfigPath(config.fileName), deviceConfigToJson(config)))
    .then(() => config);
});

/**
 * Remove specific device configuration
 */
onTwoWayCallPromise("device-config:remove", (fileName) => {
  const configPath = getDeviceConfigPath(fileName);
  // Check if root device configuration directory exists
  return existsDeviceConfigDir()
    // Check if given configuration exists
    .then((exists) => exists ? existsFsEntry(configPath) : false)
    // Remove device configuration
    .then((exists) => exists ? fsUnlink(configPath) : undefined);
});

/**
 * Generates unique file name
 */
function generateUniqueFileName(name: string) {
  const fsName = nameToFsName(name);

  const tryName = (index: number): Promise<string> => {
    const nameToFind = index ? `${fsName}-${index}.json` : `${fsName}.json`;
    return existsFsEntry(getDeviceConfigPath(nameToFind))
      .then((exists) => exists ? tryName(index + 1) : nameToFind);
  };

  return tryName(0);
}

/**
 * Read all device configurations
 */
function readDeviceConfigs(): Promise<any[]> {
  const deviceConfigPaths = fsReaddir(deviceConfigPath);

  return deviceConfigPaths
    .then((fileNames) => Promise.all(fileNames.map(readDeviceConfig)));
}

/**
 * Read single device configuration
 */
function readDeviceConfig(fileName: string) {
  const filePath = getDeviceConfigPath(fileName);
  return fsReadFile(filePath)
    .then((content) => jsonToDeviceConfig(filePath, content.toString()))
    .catch((error) => createDeviceConfigError(filePath, error));
}

/**
 * Creates device configuration error
 */
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
