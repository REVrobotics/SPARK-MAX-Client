import {Action} from "redux";

export const SET_CONNECTION_STATUS = "SET_CONNECTED";
export type SET_CONNECTION_STATUS = typeof SET_CONNECTION_STATUS;

export const SET_CONNECTING = "SET_CONNECTING";
export type SET_CONNECTING = typeof SET_CONNECTING;

export interface IApplicationState {
  isConnected: boolean,
  connectionStatus: string,
  isConnecting: boolean
}

export interface IUpdateConnectionStatus extends Action {
  type: SET_CONNECTION_STATUS,
  payload: {
    isConnected: boolean,
    connectionStatus: string
  }
}

export interface ISetIsConnecting extends Action {
  type: SET_CONNECTING,
  payload: {
    isConnecting: boolean
  }
}

export type ApplicationActions = IUpdateConnectionStatus | ISetIsConnecting;