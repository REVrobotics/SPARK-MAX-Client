/**
 * This file defines implementation of typical IPC calls wrapped in easy to use interface.
 * This allows to reduce boilerplate in IPC communications.
 *
 * Generally all communications can be separated on three groups:
 * - one way communication. We call server and do not wait for an answer
 * - two way communication. We call server and wait for a single answer
 * - callback (subscribe) communication. Server notifies when it has something for us.
 *
 * **Note** The case when we push server one time and get stream of events can be expressed like
 * 1. One way communication to push server start emitting of events
 * 2. Register callback to get server notification (callback communication)
 */

import {uniqueId} from "lodash";
import {decorateCallback, decorateOneWay, decorateTwoWay} from "./mock-renderer-calls";

const ipcRenderer = (window as any).require("electron").ipcRenderer;

interface ITwoWayRequest {
  name: string;

  resolve(value: any): void;

  reject(reason: any): void;
}

const pendingTwoWayRequests: {[reqId: string]: ITwoWayRequest} = {};

ipcRenderer.on("two-way:response", (event: any, reqId: string, err: any, response: any) => {
  // When we get response for two-way request,
  // we try to find pending request in set of pending request by corresponding request ID.
  const request = pendingTwoWayRequests[reqId];
  if (request == null) {
    throw new Error(`Cannot find handlers for two-way request: ${reqId}`);
  }

  delete pendingTwoWayRequests[reqId];

  // Resolve or reject found request
  if (err) {
    request.reject(err);
  } else {
    request.resolve(response);
  }
});

/**
 * Sends one-way request
 */
export const sendOneWay = decorateOneWay((name: string, ...args: any[]) => ipcRenderer.send(`one-way:${name}`, ...args));

/**
 * Sends two-way request and returns {@link Promise} which resolved/rejected as soon as we get feedback.
 */
export const sendTwoWay = decorateTwoWay((name: string, ...args: any[]) => new Promise((resolve, reject) => {
  // Each two way request has unique id to make possible associate response with this one request
  const reqId = uniqueId("req:");
  ipcRenderer.send(`two-way:${name}`, reqId, ...args);
  // Add request to set of pending requests
  pendingTwoWayRequests[reqId] = {name, resolve, reject};
}));

/**
 * Registers callback to be called as soon as server send notification.
 *
 * @return returns function. When this function is called we stop to listen for server notification.
 */
export const onCallback = decorateCallback((name: string, cb: (...args: any[]) => void) => {
  const eventName = `callback:${name}`;
  const listener = (event: any, ...args: any[]) => cb(...args);
  ipcRenderer.on(eventName, listener);
  return () => ipcRenderer.removeListener(eventName, listener);
});
