/**
 * This file defines types of all application actions
 */

import {Action} from "redux";
import {IServerResponse} from "../../managers/SparkManager";
import {ThunkAction, ThunkDispatch} from "redux-thunk";
import {ConfigParam} from "../../models/ConfigParam";
import {
  ConfirmationAnswer, DeviceId,
  IApplicationState,
  IConfirmationDialogConfig,
  IDeviceState, IDeviceTransientState, INetworkDevice,
  ProcessType, TabId, VirtualDeviceId
} from "../state";

/**
 * Each action (atom action) should have its own unique ActionType
 */
export enum ActionType {
  SET_GLOBAL_PROCESS_STATUS = "SET_GLOBAL_PROCESS_STATUS",
  SET_GLOBAL_PROCESSING = "SET_GLOBAL_PROCESSING",
  SET_DEVICE_PROCESS_STATUS = "SET_DEVICE_PROCESS_STATUS",
  SET_DEVICE_PROCESSING = "SET_DEVICE_PROCESSING",
  SET_CONNECTED_DEVICE = "SET_CONNECTED_DEVICE",
  SET_DEVICE_LOADED = "SET_DEVICE_LOADED",
  ADD_DEVICES = "ADD_DEVICES",
  REPLACE_DEVICES = "REPLACE_DEVICES",
  SET_PARAMETERS = "SET_PARAMETERS",
  SET_MOTOR_CONFIG = "SET_MOTOR_CONFIG",
  SET_MOTOR_CONFIG_PARAMETER = "SET_MOTOR_CONFIG_PARAMETER",
  SET_BURNED_MOTOR_CONFIG = "SET_BURNED_MOTOR_CONFIG",
  SET_SERVER_PARAM_RESPONSE = "SET_SERVER_PARAM_RESPONSE",
  SAVE_CONFIRMATION = "SAVE_CONFIRMATION",
  BURN_CONFIRMATION = "BURN_CONFIRMATION",
  ADD_LOG = "ADD_LOG",
  SET_UPDATE_AVAILABLE = "SET_UPDATE_AVAILABLE",
  SET_SELECTED_DEVICE = "SELECT_DEVICE",
  SET_SELECTED_TAB = "SET_SELECTED_TAB",
  OPEN_CONFIRMATION = "OPEN_CONFIRMATION",
  ANSWER_CONFIRMATION = "ANSWER_CONFIRMATION",
  SET_DEVICE_PARAMETER = "SET_DEVICE_PARAMETER",
  SET_DEVICE_PARAMETER_RESPONSE = "SET_DEVICE_PARAMETER_RESPONSE",
  SET_TRANSIENT_PARAMETER = "SET_TRANSIENT_PARAMETER",
  RECALCULATE_DEVICE_ID = "RECALCULATE_DEVICE_ID",
  SET_NETWORK_DEVICES = "SET_NETWORK_DEVICES",
  UPDATE_NETWORK_DEVICE = "UPDATE_NETWORK_DEVICE",
  SET_NETWORK_SCAN_IN_PROGRESS = "SET_NETWORK_SCAN_IN_PROGRESS",
  SET_FIRMWARE_LOADING = "SET_FIRMWARE_LOADING",
  CONSOLE_OUTPUT = "CONSOLE_OUTPUT",
  SET_CONSOLE_OUTPUT = "SET_CONSOLE_OUTPUT",
  UPDATE_FIRMWARE_LOADING_PROGRESS = "UPDATE_FIRMWARE_LOADING_PROGRESS",
  SET_LAST_FIRMWARE_LOADING_MESSAGE = "SET_LAST_FIRMWARE_LOADING_MESSAGE",
  SET_FIRMWARE_DOWNLOADING = "SET_FIRMWARE_DOWNLOADING",
  SET_FIRMWARE_DOWNLOAD_ERROR = "SET_FIRMWARE_DOWNLOAD_ERROR",
  SET_FIRMWARE_DOWNLOADED = "SET_FIRMWARE_DOWNLOADED",
}

export interface IUpdateGlobalProcessStatus extends Action {
  type: ActionType.SET_GLOBAL_PROCESS_STATUS,
  payload: {
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
    virtualDeviceId: VirtualDeviceId
  }
}

export interface IUpdateDeviceProcessStatus extends IDeviceAwareAction {
  type: ActionType.SET_DEVICE_PROCESS_STATUS,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    processStatus: string
  }
}

export interface ISetConnectedDevice extends IDeviceAwareAction {
  type: ActionType.SET_CONNECTED_DEVICE,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    connected: boolean
  }
}

export interface ISetDeviceLoaded extends IDeviceAwareAction {
  type: ActionType.SET_DEVICE_LOADED,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    loaded: boolean
  }
}

export interface ISetDeviceProcessing extends IDeviceAwareAction {
  type: ActionType.SET_DEVICE_PROCESSING,
  payload: {
    virtualDeviceId: VirtualDeviceId,
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

export interface IReplaceDevices extends Action {
  type: ActionType.REPLACE_DEVICES,
  payload: {
    device: IDeviceState,
    replaceIds: VirtualDeviceId[],
  }
}

export interface ISetParameters extends IDeviceAwareAction {
  type: ActionType.SET_PARAMETERS,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    parameters: number[]
  }
}

export interface ISetDeviceParameter extends IDeviceAwareAction {
  type: ActionType.SET_DEVICE_PARAMETER,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    parameter: ConfigParam,
    value: number,
  }
}

export interface ISetDeviceParameterResponse extends IDeviceAwareAction {
  type: ActionType.SET_DEVICE_PARAMETER_RESPONSE,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    parameter: ConfigParam,
    response: IServerResponse,
    updateValue: boolean,
  }
}

export interface IRecalculateDeviceId extends IDeviceAwareAction {
  type: ActionType.RECALCULATE_DEVICE_ID,
  payload: {
    virtualDeviceId: VirtualDeviceId,
  }
}

export interface ISetSelectedDevice extends IDeviceAwareAction {
  type: ActionType.SET_SELECTED_DEVICE,
  payload: {
    virtualDeviceId: VirtualDeviceId,
  }
}

export interface ISetTransientParameter extends IDeviceAwareAction {
  type: ActionType.SET_TRANSIENT_PARAMETER,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    field: keyof IDeviceTransientState,
    value: any,
  }
}

export interface ISaveConfirmation extends IDeviceAwareAction {
  type: ActionType.SAVE_CONFIRMATION,
  payload: {
    virtualDeviceId: VirtualDeviceId
  }
}

export interface IBurnConfirmation extends IDeviceAwareAction {
  type: ActionType.BURN_CONFIRMATION,
  payload: {
    virtualDeviceId: VirtualDeviceId
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
  type: ActionType.SET_SELECTED_DEVICE,
  payload: {
    virtualDeviceId: VirtualDeviceId
  }
}

export interface ISetSelectedTab extends Action {
  type: ActionType.SET_SELECTED_TAB,
  payload: {
    tab: TabId
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

export interface ISetNetworkDevices extends Action {
  type: ActionType.SET_NETWORK_DEVICES,
  payload: {
    devices: INetworkDevice[]
  }
}

export interface IUpdateNetworkDevice extends Action {
  type: ActionType.UPDATE_NETWORK_DEVICE,
  payload: {
    deviceId: DeviceId,
    update: Partial<INetworkDevice>
  }
}

export interface ISetNetworkScanInProgress extends Action {
  type: ActionType.SET_NETWORK_SCAN_IN_PROGRESS,
  payload: {
    scanInProgress: boolean
  }
}

export interface ISetFirmwareLoading extends Action {
  type: ActionType.SET_FIRMWARE_LOADING,
  payload: {
    loading: boolean
  },
}

export interface IConsoleOutput extends Action {
  type: ActionType.CONSOLE_OUTPUT,
  payload: {
    text: string
  }
}

export interface ISetConsoleOutput extends Action {
  type: ActionType.SET_CONSOLE_OUTPUT,
  payload: {
    text: string[]
  }
}

export interface IUpdateFirmwareLoadingProgress {
  type: ActionType.UPDATE_FIRMWARE_LOADING_PROGRESS,
  payload: {
    progress: number,
    text: string
  }
}

export interface ISetLastFirmwareLoadingMessage {
  type: ActionType.SET_LAST_FIRMWARE_LOADING_MESSAGE,
  payload: {
    message: string
  }
}

export interface ISetFirmwareDownloading extends Action {
  type: ActionType.SET_FIRMWARE_DOWNLOADING,
  payload: {}
}

export interface ISetFirmwareDownloaded extends Action {
  type: ActionType.SET_FIRMWARE_DOWNLOADED,
  payload: {
    config: any
  }
}

export interface ISetFirmwareDownloadError extends Action {
  type: ActionType.SET_FIRMWARE_DOWNLOAD_ERROR,
  payload: {}
}

export type SparkAction<R> = ThunkAction<R, IApplicationState, void, ApplicationActions>;
export type SparkDispatch = ThunkDispatch<IApplicationState, void, ApplicationActions>;

export type ApplicationActions = IUpdateDeviceProcessStatus | ISetDeviceProcessing | ISelectDevice

  | ISetParameters | ISetConnectedDevice | ISetDeviceLoaded | ISetSelectedDevice
  | ISetDeviceParameter | ISetDeviceParameterResponse | ISetTransientParameter | IRecalculateDeviceId
  | IUpdateGlobalProcessStatus | ISetGlobalProcessing
  | ISetNetworkDevices | IUpdateNetworkDevice | ISetNetworkScanInProgress | IConsoleOutput | ISetConsoleOutput
  | IUpdateFirmwareLoadingProgress | ISetLastFirmwareLoadingMessage | ISetFirmwareLoading
  | ISetFirmwareDownloading | ISetFirmwareDownloaded | ISetFirmwareDownloadError
  | IAddDevices | IReplaceDevices
  | ISetSelectedTab | IOpenConfirmation | IAnswerConfirmation
  | ISaveConfirmation | IBurnConfirmation
  | IAddLog;
