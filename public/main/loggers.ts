/**
 * This file defines all loggers used in the application
 */

import * as winston from "winston";
import { format } from "winston";
import {getAppDataPath} from "./config";

const logPath = getAppDataPath("logs");

const customFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  format.json());

/**
 * This logger should be used to log activities of main process
 */
export const logger = winston.createLogger({
  level: "error",
  format: customFormat,
  transports: [
    new winston.transports.File({
      dirname: logPath,
      filename: "main-errors.log",
      level: "error",
    }),
    new winston.transports.File({
      dirname: logPath,
      filename: "main-combined.log",
      level: "info",
    }),
  ],
});

/**
 * This logger should be used to log activities of renderer process
 */
export const rendererLogger = winston.createLogger({
  level: "error",
  format: customFormat,
  transports: [
    new winston.transports.File({
      dirname: logPath,
      filename: "renderer-errors.log",
    }),
  ],
});

/**
 * In the development environment log all activities of main process into console
 */
if (process.env.NODE_ENV === "development") {
  const consoleFormat = format.printf(({ level, message, stack }) => {
    return `[${level.toUpperCase()}] ${message} ${stack ? `\n${stack}` : ""}`;
  });

  const console = new winston.transports.Console({
    format: consoleFormat,
  });
  logger.add(console);
}
