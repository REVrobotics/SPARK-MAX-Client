import {app} from "electron";
import * as path from "path";

export const appDataPath = app.getPath("appData") + path.sep + "REV SPARK MAX Client";
export const configPath = path.join(appDataPath, "config.json");
export const logPath = path.join(appDataPath, "logs");

export const getAppDataPath = (...paths: string[]) =>
  paths.reduce((previous, current) => path.join(previous, current), appDataPath);

export const getLogPath = (...paths: string[]) =>
  paths.reduce((previous, current) => path.join(previous, current), logPath);
