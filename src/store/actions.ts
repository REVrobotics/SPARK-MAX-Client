import {ActionCreator} from "redux";
import {
  ISetConnectedDevice,
  ISetIsConnecting, ISetParameters,
  IUpdateConnectionStatus, SET_CONNECTED_DEVICE,
  SET_CONNECTING,
  SET_CONNECTION_STATUS, SET_PARAMETERS
} from "./types";

export const updateConnectionStatus: ActionCreator<IUpdateConnectionStatus> = (isConnected: boolean, connectionStatus: string) => ({
  payload: {
    connectionStatus,
    isConnected
  },
  type: SET_CONNECTION_STATUS
});

export const setIsConnecting: ActionCreator<ISetIsConnecting> = (isConnecting: boolean) => ({
  payload: {
    isConnecting
  },
  type: SET_CONNECTING
});

export const setConnectedDevice: ActionCreator<ISetConnectedDevice> = (connectedDevice: string) => ({
  payload: {
    connectedDevice
  },
  type: SET_CONNECTED_DEVICE
});

export const setParameters: ActionCreator<ISetParameters> = (parameters: number[]) => ({
  payload: {
    parameters
  },
  type: SET_PARAMETERS
});