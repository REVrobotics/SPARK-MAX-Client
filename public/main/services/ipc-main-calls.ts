/**
 * This file supports separation of calls (look in ipc-renderer-calls.ts) in the main process.
 */

import {ipcMain} from "electron";
import WebContents = Electron.WebContents;

const stringifyError = (error: any) => {
  if (error instanceof Error) {
    // TODO: return technical error
    return error.message;
  } else {
    return error;
  }
}

export const isPromise = (value: any): value is Promise<any> => {
  return !!value && typeof value.then === "function";
};

export function onOneWayCall(name: string, cb: (...args: any[]) => void): void {
  ipcMain.on(`one-way:${name}`, (event: any, ...args: any[]) => cb(...args));
}

export function onTwoWayCall(name: string, handler: (cb: (err?: any, response?: any) => void, ...args: any[]) => void): void {
  ipcMain.on(`two-way:${name}`, (event: any, reqId: string, ...args: any[]) => {
    const cb = (err?: any, response?: any) => {
      if (err) {
        if (err instanceof Error) {
          if (process.env.NODE_ENV === "development") {
            console.error(err);
          }
        }
        event.sender.send(`two-way:response`, reqId, stringifyError(err));
      } else {
        event.sender.send(`two-way:response`, reqId, null, response);
      }
    };

    try {
      handler(cb, ...args);
    } catch (err) {
      cb(err);
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
  sendTo.send(`callback:${name}`, ...args);
}

let targetWindow: WebContents;

export function setTargetWindow(webContents: WebContents): void {
  targetWindow = webContents;
}

export function getTargetWindow(): WebContents {
  return targetWindow;
}
