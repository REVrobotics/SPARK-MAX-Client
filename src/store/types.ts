import {Action} from "redux";
import MotorConfiguration from "../models/MotorConfiguration";
import {IServerResponse} from "../managers/SparkManager";
import {ThunkAction, ThunkDispatch} from "redux-thunk";

export enum ActionType {
  SET_GLOBAL_PROCESS_STATUS = "SET_GLOBAL_PROCESS_STATUS",
  SET_GLOBAL_PROCESSING = "SET_GLOBAL_PROCESSING",
  SET_DEVICE_PROCESS_STATUS = "SET_DEVICE_PROCESS_STATUS",
  SET_DEVICE_PROCESSING = "SET_DEVICE_PROCESSING",
  SET_CONNECTED_DEVICE = "SET_CONNECTED_DEVICE",
  ADD_DEVICES = "ADD_DEVICES",
  SET_PARAMETERS = "SET_PARAMETERS",
  SET_CURRENT_MOTOR_CONFIG = "SET_MOTOR_CONFIG",
  SET_BURNED_MOTOR_CONFIG = "SET_BURNED_MOTOR_CONFIG",
  SET_SERVER_PARAM_RESPONSE = "SET_SERVER_PARAM_RESPONSE",
  ADD_LOG = "ADD_LOG",
  SET_UPDATE_AVAILABLE = "SET_UPDATE_AVAILABLE",
  SELECT_DEVICE = "SELECT_DEVICE",
}

export type DeviceId = number;

export interface IApplicationState {
  orderedDevices: DeviceId[];
  devices: { [deviceId: number]: IDeviceState };
  selectedDeviceId?: number;
  isProcessing: boolean;
  processStatus: string;
  logs: string[],
}

export interface IDeviceInfo {
  driverName: string;
  deviceName: string;
  updateable: boolean;
}

export interface IDeviceState {
  deviceId: DeviceId;
  info: IDeviceInfo;
  masterDeviceId?: number;
  isConnected: boolean;
  processStatus: string,
  isProcessing: boolean,
  parameters: number[],
  currentConfig: MotorConfiguration,
  burnedConfig: MotorConfiguration,
  paramResponses: IServerResponse[]
}

export interface IUpdateGlobalProcessStatus extends Action {
  type: ActionType.SET_GLOBAL_PROCESS_STATUS,
  payload: {
    isConnected: boolean,
    processStatus: string
  }
}

export interface ISetGlobalProcessing extends Action {
  type: ActionType.SET_GLOBAL_PROCESSING,
  payload: {
    isProcessing: boolean
  }
}


export interface IDeviceAwareAction extends Action {
  payload: {
    deviceId: DeviceId;
  }
}

export interface IUpdateDeviceProcessStatus extends IDeviceAwareAction {
  type: ActionType.SET_DEVICE_PROCESS_STATUS,
  payload: {
    deviceId: DeviceId,
    isConnected: boolean,
    processStatus: string
  }
}

export interface ISetDeviceProcessing extends IDeviceAwareAction {
  type: ActionType.SET_DEVICE_PROCESSING,
  payload: {
    deviceId: DeviceId,
    isProcessing: boolean
  }
}

export interface IAddDevices extends Action {
  type: ActionType.ADD_DEVICES,
  payload: {
    devices: IDeviceState[],
  }
}

export interface ISetParameters extends IDeviceAwareAction {
  type: ActionType.SET_PARAMETERS,
  payload: {
    deviceId: DeviceId,
    parameters: number[]
  }
}

export interface ISetMotorConfig extends IDeviceAwareAction {
  type: ActionType.SET_CURRENT_MOTOR_CONFIG,
  payload: {
    deviceId: DeviceId,
    config: MotorConfiguration
  }
}

export interface ISetBurnedMotorConfig extends IDeviceAwareAction {
  type: ActionType.SET_BURNED_MOTOR_CONFIG,
  payload: {
    deviceId: DeviceId,
    config: MotorConfiguration
  }
}

export interface ISetParamResponses extends IDeviceAwareAction {
  type: ActionType.SET_SERVER_PARAM_RESPONSE,
  payload: {
    deviceId: DeviceId,
    paramResponses: IServerResponse[]
  }
}

export interface IAddLog extends Action {
  type: ActionType.ADD_LOG,
  payload: {
    log: string
  }
}

export interface ISetUpdateAvailable extends Action {
  type: ActionType.SET_UPDATE_AVAILABLE,
  payload: {
    updateAvailable: boolean
  }
}

export interface ISelectDevice extends IDeviceAwareAction {
  type: ActionType.SELECT_DEVICE,
  payload: {
    deviceId: DeviceId
  }
}

export type SparkAction<R> = ThunkAction<R, IApplicationState, void, ApplicationActions>;
export type SparkDispatch = ThunkDispatch<IApplicationState, void, ApplicationActions>;

export type ApplicationActions = IUpdateDeviceProcessStatus | ISetDeviceProcessing | IAddDevices | ISelectDevice
  | ISetParameters | ISetMotorConfig | ISetBurnedMotorConfig | ISetParamResponses | IAddLog | ISetUpdateAvailable
  | IUpdateGlobalProcessStatus | ISetGlobalProcessing;
