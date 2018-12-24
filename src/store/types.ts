import {Action} from "redux";
import MotorConfiguration from "../models/MotorConfiguration";

export const SET_CONNECTION_STATUS = "SET_CONNECTED";
export type SET_CONNECTION_STATUS = typeof SET_CONNECTION_STATUS;

export const SET_CONNECTING = "SET_CONNECTING";
export type SET_CONNECTING = typeof SET_CONNECTING;

export const SET_CONNECTED_DEVICE = "SET_CONNECTED_DEVICE";
export type SET_CONNECTED_DEVICE = typeof SET_CONNECTED_DEVICE;

export const SET_PARAMETERS = "SET_PARAMETERS";
export type SET_PARAMETERS = typeof SET_PARAMETERS;

export const SET_MOTOR_CONFIG = "SET_MOTOR_CONFIG";
export type SET_MOTOR_CONFIG = typeof SET_MOTOR_CONFIG;

export const ADD_LOG = "ADD_LOG";
export type ADD_LOG = typeof ADD_LOG;

export interface IApplicationState {
  isConnected: boolean,
  connectionStatus: string,
  isConnecting: boolean,
  connectedDevice: string,
  parameters: number[],
  currentConfig: MotorConfiguration,
  logs: string[]
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

export interface ISetConnectedDevice extends Action {
  type: SET_CONNECTED_DEVICE,
  payload: {
    connectedDevice: string
  }
}

export interface ISetParameters extends Action {
  type: SET_PARAMETERS,
  payload: {
    parameters: number[]
  }
}

export interface ISetMotorConfig extends Action {
  type: SET_MOTOR_CONFIG,
  payload: {
    config: MotorConfiguration
  }
}

export interface IAddLog extends Action {
  type: ADD_LOG,
  payload: {
    log: string
  }
}

export type ApplicationActions = IUpdateConnectionStatus | ISetIsConnecting | ISetConnectedDevice | ISetParameters
  | ISetMotorConfig | IAddLog;