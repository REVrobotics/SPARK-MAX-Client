import {ActionCreator} from "redux";
import MotorConfiguration from "../models/MotorConfiguration";
import {
  ADD_LOG,
  IAddLog,
  ISetBurnedMotorConfig,
  ISetConnectedDevice,
  ISetIsConnecting,
  ISetMotorConfig,
  ISetParameters,
  ISetParamResponses,
  ISetUpdateAvailable,
  ISetUsbDevices,
  IUpdateConnectionStatus,
  SET_BURNED_MOTOR_CONFIG,
  SET_CONNECTED_DEVICE,
  SET_CONNECTING,
  SET_CONNECTION_STATUS,
  SET_CURRENT_MOTOR_CONFIG,
  SET_PARAMETERS,
  SET_SERVER_PARAM_RESPONSE,
  SET_UPDATE_AVAILABLE,
  SET_USB_DEVICES
} from "./types";
import {IServerResponse} from "../managers/SparkManager";

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

export const setUsbDevices: ActionCreator<ISetUsbDevices> = (usbDevices: string[]) => ({
  payload: {
    usbDevices
  },
  type: SET_USB_DEVICES
});

export const setParameters: ActionCreator<ISetParameters> = (parameters: number[]) => ({
  payload: {
    parameters
  },
  type: SET_PARAMETERS
});

export const setMotorConfig: ActionCreator<ISetMotorConfig> = (config: MotorConfiguration) => ({
  payload: {
    config
  },
  type: SET_CURRENT_MOTOR_CONFIG
});

export const setBurnedMotorConfig: ActionCreator<ISetBurnedMotorConfig> = (config: MotorConfiguration) => ({
  payload: {
    config
  },
  type: SET_BURNED_MOTOR_CONFIG
});

export const setParamResponses: ActionCreator<ISetParamResponses> = (paramResponses: IServerResponse[]) => ({
  payload: {
    paramResponses
  },
  type: SET_SERVER_PARAM_RESPONSE
});

export const addLog: ActionCreator<IAddLog> = (log: string) => ({
  payload: {
    log
  },
  type: ADD_LOG
});

export const setUpdateAvailable: ActionCreator<ISetUpdateAvailable> = (updateAvailable: boolean) => ({
  payload: {
    updateAvailable
  },
  type: SET_UPDATE_AVAILABLE
});