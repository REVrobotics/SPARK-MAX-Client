import {Action} from "redux";
import MotorConfiguration from "../models/MotorConfiguration";
import {IServerResponse} from "../managers/SparkManager";
import {ThunkAction, ThunkDispatch} from "redux-thunk";
import {Intent} from "@blueprintjs/core";

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
  SAVE_CONFIRMATION = "SAVE_CONFIRMATION",
  BURN_CONFIRMATION = "BURN_CONFIRMATION",
  ADD_LOG = "ADD_LOG",
  SET_UPDATE_AVAILABLE = "SET_UPDATE_AVAILABLE",
  SELECT_DEVICE = "SELECT_DEVICE",
  OPEN_CONFIRMATION = "OPEN_CONFIRMATION",
  ANSWER_CONFIRMATION = "ANSWER_CONFIRMATION",
}

export enum ProcessType {
  Save = "Save",
  Reset = "Process"
}

export type DeviceId = number;

export interface IApplicationState {
  orderedDevices: DeviceId[],
  devices: { [deviceId: number]: IDeviceState },
  selectedDeviceId?: number,
  isProcessing: boolean,
  processStatus: string,
  logs: string[],
  ui: IUiState;
}

export interface IDeviceInfo {
  driverName: string;
  deviceName: string;
  updateable: boolean;
}

export interface IUiState {
  confirmation?: IConfirmationDialogConfig;
  confirmationOpened: boolean;
}

export interface IDeviceState {
  deviceId: DeviceId;
  info: IDeviceInfo;
  masterDeviceId?: number;
  isConnected: boolean;
  processStatus: string,
  isProcessing: boolean,
  processType?: ProcessType,
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
    isProcessing: boolean,
    processType?: ProcessType
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

export interface ISaveConfirmation extends IDeviceAwareAction {
  type: ActionType.SAVE_CONFIRMATION,
  payload: {
    deviceId: DeviceId
  }
}

export interface IBurnConfirmation extends IDeviceAwareAction {
  type: ActionType.BURN_CONFIRMATION,
  payload: {
    deviceId: DeviceId
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

export interface IOpenConfirmation extends Action {
  type: ActionType.OPEN_CONFIRMATION,
  payload: IConfirmationDialogConfig
}

export interface IAnswerConfirmation extends Action {
  type: ActionType.ANSWER_CONFIRMATION,
  payload: ConfirmationAnswer
}

export interface IConfirmationDialogConfig {
  intent: Intent;
  text: string;
  yesLabel: string;
  cancelLabel: string;
}

export enum ConfirmationAnswer {
  Yes = "Yes",
  Cancel = "Cancel"
}

export type SparkAction<R> = ThunkAction<R, IApplicationState, void, ApplicationActions>;
export type SparkDispatch = ThunkDispatch<IApplicationState, void, ApplicationActions>;

export type ApplicationActions = IUpdateDeviceProcessStatus | ISetDeviceProcessing | IAddDevices | ISelectDevice
  | ISetParameters | ISetMotorConfig | ISetBurnedMotorConfig | ISetParamResponses | IAddLog | ISetUpdateAvailable
  | IUpdateGlobalProcessStatus | ISetGlobalProcessing
  | IOpenConfirmation | IAnswerConfirmation
  | ISaveConfirmation | IBurnConfirmation;
