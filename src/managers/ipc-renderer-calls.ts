import {uniqueId} from "lodash";

const ipcRenderer = (window as any).require("electron").ipcRenderer;

interface ITwoWayRequest {
  name: string;

  resolve(value: any): void;

  reject(reason: any): void;
}

const pendingTwoWayRequests: {[reqId: string]: ITwoWayRequest} = {};

ipcRenderer.on("two-way:response", (event: any, reqId: string, err: any, response: any) => {
  const request = pendingTwoWayRequests[reqId];
  if (request == null) {
    throw new Error(`Cannot find handlers for two-way request: ${reqId}`);
  }

  delete pendingTwoWayRequests[reqId];

  if (err) {
    request.reject(err);
  } else {
    request.resolve(response);
  }
});

export const sendOneWay = (name: string, ...args: any[]) => ipcRenderer.send(`one-way:${name}`, ...args);

export const sendTwoWay = <T>(name: string, ...args: any[]) => new Promise<T>((resolve, reject) => {
  const reqId = uniqueId("req:");
  ipcRenderer.send(`two-way:${name}`, reqId, ...args);
  pendingTwoWayRequests[reqId] = {name, resolve, reject};
});

export const onCallback = (name: string, cb: (...args: any[]) => void) => {
  const eventName = `callback:${name}`;
  const listener = (event: any, ...args: any[]) => cb(...args);
  ipcRenderer.on(eventName, listener);
  return () => ipcRenderer.removeListener(eventName, listener);
};
