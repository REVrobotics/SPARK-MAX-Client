import {Action} from "redux";
import {IServerResponse} from "../../managers/SparkManager";
import {ThunkAction, ThunkDispatch} from "redux-thunk";
import {ConfigParam} from "../../models/ConfigParam";
import {
  ConfirmationAnswer,
  IApplicationState,
  IConfirmationDialogConfig,
  IDeviceState, IDeviceTransientState,
  ProcessType, VirtualDeviceId
} from "../state";

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
  OPEN_CONFIRMATION = "OPEN_CONFIRMATION",
  ANSWER_CONFIRMATION = "ANSWER_CONFIRMATION",
  SET_DEVICE_PARAMETER = "SET_DEVICE_PARAMETER",
  SET_DEVICE_PARAMETER_RESPONSE = "SET_DEVICE_PARAMETER_RESPONSE",
  SET_TRANSIENT_PARAMETER = "SET_TRANSIENT_PARAMETER",
  RECALCULATE_DEVICE_ID = "RECALCULATE_DEVICE_ID"
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

export interface IOpenConfirmation extends Action {
  type: ActionType.OPEN_CONFIRMATION,
  payload: IConfirmationDialogConfig
}

export interface IAnswerConfirmation extends Action {
  type: ActionType.ANSWER_CONFIRMATION,
  payload: ConfirmationAnswer
}

export type SparkAction<R> = ThunkAction<R, IApplicationState, void, ApplicationActions>;
export type SparkDispatch = ThunkDispatch<IApplicationState, void, ApplicationActions>;

export type ApplicationActions = IUpdateDeviceProcessStatus | ISetDeviceProcessing | ISelectDevice

  | ISetParameters | ISetConnectedDevice | ISetDeviceLoaded | ISetSelectedDevice
  | ISetDeviceParameter | ISetDeviceParameterResponse | ISetTransientParameter | IRecalculateDeviceId
  | IUpdateGlobalProcessStatus | ISetGlobalProcessing
  | IAddDevices | IReplaceDevices
  | IOpenConfirmation | IAnswerConfirmation
  | ISaveConfirmation | IBurnConfirmation
  | IAddLog;
