/**
 * This file supports separation of calls (look in ipc-renderer-calls.ts) in the main process.
 */

import {ipcMain} from "electron";
import WebContents = Electron.WebContents;

export function onOneWayCall(name: string, cb: (...args: any[]) => void): void {
  ipcMain.on(`one-way:${name}`, (event: any, ...args: any[]) => cb(...args));
}

export function onTwoWayCall(name: string, handler: (cb: (err?: any, response?: any) => void, ...args: any[]) => void): void {
  ipcMain.on(`two-way:${name}`, (event: any, reqId: string, ...args: any[]) => {
    handler((err, response) => {
      if (err) {
        event.sender.send(`two-way:response`, reqId, err);
      } else {
        event.sender.send(`two-way:response`, reqId, null, response);
      }
    }, ...args);
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
