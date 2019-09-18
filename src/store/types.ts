import {Action} from "redux";
import MotorConfiguration from "../models/MotorConfiguration";
import {IServerResponse} from "../managers/SparkManager";
import {ThunkAction, ThunkDispatch} from "redux-thunk";

export const SET_CONNECTION_STATUS = "SET_CONNECTED";
export type SET_CONNECTION_STATUS = typeof SET_CONNECTION_STATUS;

export const SET_CONNECTING = "SET_CONNECTING";
export type SET_CONNECTING = typeof SET_CONNECTING;

export const SET_CONNECTED_DEVICE = "SET_CONNECTED_DEVICE";
export type SET_CONNECTED_DEVICE = typeof SET_CONNECTED_DEVICE;

export const SET_USB_DEVICES = "SET_USB_DEVICES";
export type SET_USB_DEVICES = typeof SET_USB_DEVICES;

export const SET_PARAMETERS = "SET_PARAMETERS";
export type SET_PARAMETERS = typeof SET_PARAMETERS;

export const SET_CURRENT_MOTOR_CONFIG = "SET_MOTOR_CONFIG";
export type SET_CURRENT_MOTOR_CONFIG = typeof SET_CURRENT_MOTOR_CONFIG;

export const SET_BURNED_MOTOR_CONFIG = "SET_BURNED_MOTOR_CONFIG";
export type SET_BURNED_MOTOR_CONFIG = typeof SET_BURNED_MOTOR_CONFIG;

export const SET_SERVER_PARAM_RESPONSE = "SET_SERVER_PARAM_RESPONSE";
export type SET_SERVER_PARAM_RESPONSE = typeof SET_SERVER_PARAM_RESPONSE;

export const ADD_LOG = "ADD_LOG";
export type ADD_LOG = typeof ADD_LOG;

export const SET_UPDATE_AVAILABLE = "SET_UPDATE_AVAILABLE";
export type SET_UPDATE_AVAILABLE = typeof SET_UPDATE_AVAILABLE;

export interface IApplicationState {
  usbDevices: string[],
  isConnected: boolean,
  connectionStatus: string,
  isConnecting: boolean,
  connectedDevice: string,
  parameters: number[],
  currentConfig: MotorConfiguration,
  burnedConfig: MotorConfiguration,
  logs: string[],
  updateAvailable: boolean,
  paramResponses: IServerResponse[]
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

export interface ISetUsbDevices extends Action {
  type: SET_USB_DEVICES,
  payload: {
    usbDevices: string[]
  }
}

export interface ISetParameters extends Action {
  type: SET_PARAMETERS,
  payload: {
    parameters: number[]
  }
}

export interface ISetMotorConfig extends Action {
  type: SET_CURRENT_MOTOR_CONFIG,
  payload: {
    config: MotorConfiguration
  }
}

export interface ISetBurnedMotorConfig extends Action {
  type: SET_BURNED_MOTOR_CONFIG,
  payload: {
    config: MotorConfiguration
  }
}

export interface ISetParamResponses extends Action {
  type: SET_SERVER_PARAM_RESPONSE,
  payload: {
    paramResponses: IServerResponse[]
  }
}

export interface IAddLog extends Action {
  type: ADD_LOG,
  payload: {
    log: string
  }
}

export interface ISetUpdateAvailable extends Action {
  type: SET_UPDATE_AVAILABLE,
  payload: {
    updateAvailable: boolean
  }
}

export type SparkAction<R> = ThunkAction<R, IApplicationState, void, ApplicationActions>;
export type SparkDispatch = ThunkDispatch<IApplicationState, void, ApplicationActions>;

export type ApplicationActions = IUpdateConnectionStatus | ISetIsConnecting | ISetConnectedDevice | ISetUsbDevices
  | ISetParameters | ISetMotorConfig | ISetBurnedMotorConfig | ISetParamResponses | IAddLog | ISetUpdateAvailable;