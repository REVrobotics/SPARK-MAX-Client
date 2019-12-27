/**
 * This file supports separation of calls (look in ipc-renderer-calls.ts) in the main process.
 */

import {BrowserWindow, ipcMain, WebContents} from "electron";
import {logger} from "../loggers";

// Converts error into serializable form
const serializeSystemError = (error: any) => {
  let serialized: any;

  try {
    // Ensure that we can serialize error
    serialized = JSON.parse(JSON.stringify(error));
  } catch(err) {
    if (error instanceof Error) {
      serialized = error.message;
    } else {
      serialized = "Unknown Error";
    }
  }

  // It was found that stack and message are not attached to a serialized error.
  // Do it manually.
  if (error instanceof Error) {
    serialized.message = error.message;
    serialized.stack = error.stack;
  }

  return serialized;
};

export const isPromise = (value: any): value is Promise<any> => {
  return !!value && typeof value.then === "function";
};

export function onOneWayCall(name: string, cb: (...args: any[]) => void): void {
  ipcMain.on(`one-way:${name}`, (event: any, ...args: any[]) => {
    try {
      cb(...args);
    } catch(err) {
      logger.error(`Error during one-way call: ${name}(${args.join(", ")}) `, err);
    }
  });
}

export function onTwoWayCall(name: string, handler: (cb: (err?: any, response?: any) => void, ...args: any[]) => void): void {
  ipcMain.on(`two-way:${name}`, (event: any, reqId: string, ...args: any[]) => {
    const handleResult = (err?: any, response?: any) => {
      if (isDestroyed(event.sender)) {
        return;
      }

      if (err) {
        logger.error(`Error during two-way call: ${name}(${args.join(", ")}) `, err);
        event.sender.send(`two-way:response`, reqId, serializeSystemError(err));
      } else {
        event.sender.send(`two-way:response`, reqId, null, response);
      }
    };

    try {
      handler(handleResult, ...args);
    } catch (err) {
      handleResult(err);
    }
  });
}

export function onTwoWayCallPromise(name: string, handler: (...args: any[]) => Promise<any>): void {
  onTwoWayCall(name, (cb, ...args) => {
    const result = handler(...args);
    const promiseResult = isPromise(result) ? result : Promise.resolve(result);
    promiseResult
      .then((response) => cb(null, response))
      .catch((reason) => cb(reason));
  });
}

export function notifyCallback(sendTo: WebContents, name: string, ...args: any[]): void {
  if (!isDestroyed(sendTo)) {
    sendTo.send(`callback:${name}`, ...args);
  }
}

let targetWindow: WebContents;

export function setTargetWindow(webContents: WebContents): void {
  targetWindow = webContents;
}

export function getTargetWindow(): WebContents {
  return targetWindow;
}

function isDestroyed(contents: WebContents): boolean {
  const window = BrowserWindow.fromWebContents(contents);
  return window == null || window.isDestroyed();
}
