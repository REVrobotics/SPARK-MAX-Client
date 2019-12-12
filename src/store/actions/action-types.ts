/**
 * This file defines types of all application actions
 */

import {Action} from "redux";
import {IServerResponse} from "../../managers/SparkManager";
import {ThunkAction, ThunkDispatch} from "redux-thunk";
import {ConfigParam, ConfigParamGroupId} from "../../models/ConfigParam";
import {
  ConfirmationAnswer,
  DeviceId,
  IAlertDialogConfig,
  IApplicationState,
  IConfirmationDialogConfig,
  IDeviceConfiguration,
  IDeviceState,
  IDeviceTransientState,
  DisplaySettings,
  IMessageQueueConfig,
  INetworkDevice,
  ISignalInstanceState,
  PanelName,
  PathDescriptor,
  ProcessType,
  SignalId,
  TabId,
  VirtualDeviceId, IDisplayState, QuickPanelName, IDestination, IDfuDevice
} from "../state";
import {ControlType} from "../../models/proto-gen/SPARK-MAX-Types_dto_pb";

/**
 * Each action (atom action) should have its own unique ActionType
 */
export enum ActionType {
  SET_GLOBAL_PROCESS_STATUS = "SET_GLOBAL_PROCESS_STATUS",
  SET_GLOBAL_PROCESSING = "SET_GLOBAL_PROCESSING",
  SET_DEVICE_PROCESS_STATUS = "SET_DEVICE_PROCESS_STATUS",
  SET_DEVICE_PROCESSING = "SET_DEVICE_PROCESSING",
  SET_PROCESS_STATUS_BY_DESCRIPTOR = "SET_PROCESS_STATUS_BY_DESCRIPTOR",
  SET_PROCESSING_BY_DESCRIPTOR = "SET_PROCESSING_BY_DESCRIPTOR",
  SET_CONNECTED_DESCRIPTOR = "SET_CONNECTED_DESCRIPTOR",
  SET_DEVICE_LOADED = "SET_DEVICE_LOADED",
  SET_DEVICE_FIRMWARE_VERSION = "SET_DEVICE_FIRMWARE_VERSION",
  ADD_DEVICES = "ADD_DEVICES",
  REPLACE_DEVICES = "REPLACE_DEVICES",
  SET_PARAMETERS = "SET_PARAMETERS",
  SAVE_CONFIRMATION = "SAVE_CONFIRMATION",
  BURN_CONFIRMATION = "BURN_CONFIRMATION",
  ADD_LOG = "ADD_LOG",
  SET_UPDATE_AVAILABLE = "SET_UPDATE_AVAILABLE",
  SET_SELECTED_DEVICE = "SELECT_DEVICE",
  SET_SELECTED_TAB = "SET_SELECTED_TAB",
  OPEN_CONFIRMATION = "OPEN_CONFIRMATION",
  ANSWER_CONFIRMATION = "ANSWER_CONFIRMATION",
  OPEN_ALERT = "OPEN_ALERT",
  CLOSE_ALERT = "CLOSE_ALERT",
  SET_DEVICE_PARAMETER = "SET_DEVICE_PARAMETER",
  SET_DEVICE_PARAMETER_RESPONSE = "SET_DEVICE_PARAMETER_RESPONSE",
  SET_TRANSIENT_PARAMETER = "SET_TRANSIENT_PARAMETER",
  RESET_TRANSIENT_STATE = "RESET_TRANSIENT_STATE",
  RECALCULATE_DEVICE_ID = "RECALCULATE_DEVICE_ID",
  SET_NETWORK_DEVICES = "SET_NETWORK_DEVICES",
  UPDATE_NETWORK_DEVICE = "UPDATE_NETWORK_DEVICE",
  SELECT_DFU_DEVICE = "SELECT_DFU_DEVICE",
  SELECT_ALL_DFU_DEVICES = "SELECT_ALL_DFU_DEVICES",
  SET_NETWORK_SCAN_IN_PROGRESS = "SET_NETWORK_SCAN_IN_PROGRESS",
  SET_FIRMWARE_LOADING = "SET_FIRMWARE_LOADING",
  CONSOLE_OUTPUT = "CONSOLE_OUTPUT",
  SET_CONSOLE_OUTPUT = "SET_CONSOLE_OUTPUT",
  UPDATE_FIRMWARE_LOADING_PROGRESS = "UPDATE_FIRMWARE_LOADING_PROGRESS",
  SET_LAST_FIRMWARE_LOADING_MESSAGE = "SET_LAST_FIRMWARE_LOADING_MESSAGE",
  SET_FIRMWARE_DOWNLOADING = "SET_FIRMWARE_DOWNLOADING",
  SET_FIRMWARE_DOWNLOAD_ERROR = "SET_FIRMWARE_DOWNLOAD_ERROR",
  SET_FIRMWARE_DOWNLOADED = "SET_FIRMWARE_DOWNLOADED",

  SET_CONFIGURATIONS = "SET_CONFIGURATIONS",
  ADD_CONFIGURATION = "ADD_CONFIGURATION",
  UPDATE_CONFIGURATION = "UPDATE_CONFIGURATION",
  REMOVE_CONFIGURATION = "REMOVE_CONFIGURATION",

  INIT_MESSAGE_QUEUE = "INIT_MESSAGE_QUEUE",
  RESET_MESSAGE_QUEUE = "RESET_MESSAGE_QUEUE",
  ADD_TO_MESSAGE_QUEUE = "ADD_TO_MESSAGE_QUEUE",

  SET_DISPLAY_SELECTED_QUICK_PANEL = "SET_DISPLAY_SELECTED_QUICK_PANEL",
  SET_DISPLAY_SELECTED_PANEL = "SET_DISPLAY_SELECTED_PANEL",
  SET_DISPLAY_SETTING = "SET_DISPLAY_SETTING",
  SET_SELECTED_SIGNAL = "SET_SELECTED_SIGNAL",
  SET_DISPLAY_SELECTED_PID_PROFILE = "SET_DISPLAY_SELECTED_PID_PROFILE",

  ADD_SIGNAL_INSTANCE = "ADD_SIGNAL_INSTANCE",
  REMOVE_SIGNAL_INSTANCE = "REMOVE_SIGNAL_INSTANCE",
  SET_SIGNAL_INSTANCE_FIELD = "SET_SIGNAL_INSTANCE_FIELD",

  SET_DISPLAY_SELECTED_PARAM_GROUP = "SET_DISPLAY_SELECTED_PARAM_GROUP",
  SET_DISPLAY_QUICK_PARAM = "SET_DISPLAY_QUICK_PARAM",
  SET_DISPLAY = "SET_DISPLAY",
  SET_CONTROL_VALUE = "SET_CONTROL_VALUE",
  SET_CONTROL_RANGE_VALUE = "SET_CONTROL_RANGE_VALUE",
  SET_RUNNING_STATUS = "SET_RUNNING_STATUS",
  SET_LAST_SYNCED_CONSUMERS = "SET_LAST_SYNCED_CONSUMERS",
  SET_LAST_RUNNING_DEVICE_IDS = "SET_LAST_RUNNING_DEVICE_IDS",

  SET_ADVANCED_SEARCH_STRING = "SET_ADVANCED_SEARCH_STRING",
  SET_ADVANCED_FIRST_VISIBLE_ROW = "SET_ADVANCED_FIRST_VISIBLE_ROW",
  SET_ADVANCED_FOCUSED_CELL = "SET_ADVANCED_FOCUSED_CELL",
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

export interface IDescriptorAwareAction extends Action {
  payload: {
    descriptor: PathDescriptor
  }
}

export interface IUpdateDeviceProcessStatus extends IDeviceAwareAction {
  type: ActionType.SET_DEVICE_PROCESS_STATUS,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    processStatus: string
  }
}

export interface IUpdateProcessStatusByDescriptor extends IDescriptorAwareAction {
  type: ActionType.SET_PROCESS_STATUS_BY_DESCRIPTOR,
  payload: {
    descriptor: PathDescriptor,
    processStatus: string
  }
}

export interface ISetConnectedDescriptor {
  type: ActionType.SET_CONNECTED_DESCRIPTOR,
  payload: {
    descriptor?: PathDescriptor
  }
}

export interface ISetDeviceLoaded extends IDeviceAwareAction {
  type: ActionType.SET_DEVICE_LOADED,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    loaded: boolean
  }
}

export interface ISetDeviceFirmwareVersion extends IDeviceAwareAction {
  type: ActionType.SET_DEVICE_FIRMWARE_VERSION,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    firmwareVersion?: string,
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

export interface ISetProcessingByDescriptor extends IDescriptorAwareAction {
  type: ActionType.SET_PROCESSING_BY_DESCRIPTOR,
  payload: {
    descriptor: PathDescriptor,
    isProcessing: boolean,
    processType?: ProcessType
  }
}

export interface IAddDevices extends Action {
  type: ActionType.ADD_DEVICES,
  payload: {
    devices: IDeviceState[],
    descriptors?: PathDescriptor[],
  }
}

export interface IReplaceDevices extends Action {
  type: ActionType.REPLACE_DEVICES,
  payload: {
    devices: IDeviceState[],
    descriptors?: PathDescriptor[],
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

export interface IResetTransientState extends IDeviceAwareAction {
  type: ActionType.RESET_TRANSIENT_STATE,
  payload: {
    virtualDeviceId: VirtualDeviceId,
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

export interface IOpenAlert extends Action {
  type: ActionType.OPEN_ALERT,
  payload: IAlertDialogConfig
}

export interface ICloseAlert extends Action {
  type: ActionType.CLOSE_ALERT,
}

export interface ISetNetworkDevices extends Action {
  type: ActionType.SET_NETWORK_DEVICES,
  payload: {
    devices: INetworkDevice[],
    dfuDevices: IDfuDevice[]
  }
}

export interface IUpdateNetworkDevice extends Action {
  type: ActionType.UPDATE_NETWORK_DEVICE,
  payload: {
    id: string,
    update: Partial<INetworkDevice>
  }
}

export interface ISelectDfuDevice extends Action {
  type: ActionType.SELECT_DFU_DEVICE,
  payload: {
    id: string,
    selected: boolean
  }
}

export interface ISelectAllDfuDevices extends Action {
  type: ActionType.SELECT_ALL_DFU_DEVICES,
  payload: {
    selected: boolean
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

export interface ISetConfigurations extends Action {
  type: ActionType.SET_CONFIGURATIONS,
  payload: {
    configurations: IDeviceConfiguration[],
  },
}

export interface IAddConfiguration extends Action {
  type: ActionType.ADD_CONFIGURATION,
  payload: {
    configuration: IDeviceConfiguration,
  },
}

export interface IUpdateConfiguration extends Action {
  type: ActionType.UPDATE_CONFIGURATION,
  payload: {
    id: string,
    configuration: Partial<IDeviceConfiguration>,
  },
}

export interface IRemoveConfiguration extends Action {
  type: ActionType.REMOVE_CONFIGURATION,
  payload: {
    id: string,
  },
}

export interface IInitMessageQueue extends Action {
  type: ActionType.INIT_MESSAGE_QUEUE,
  payload: IMessageQueueConfig,
}

export interface IResetMessageQueue extends Action {
  type: ActionType.RESET_MESSAGE_QUEUE,
}

export interface IAddToMessageQueue extends Action {
  type: ActionType.ADD_TO_MESSAGE_QUEUE,
  payload: {
    messages: string[],
  },
}

export interface ISetDisplaySelectedQuickPanel {
  type: ActionType.SET_DISPLAY_SELECTED_QUICK_PANEL,
  payload: {
    panel: QuickPanelName,
  },
}

export interface ISetDisplaySelectedPidProfile extends IDeviceAwareAction {
  type: ActionType.SET_DISPLAY_SELECTED_PID_PROFILE,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    profile: number;
  },
}

export interface ISetDisplaySelectedPanel {
  type: ActionType.SET_DISPLAY_SELECTED_PANEL,
  payload: {
    panel: PanelName,
  },
}

export interface ISetDisplaySetting {
  type: ActionType.SET_DISPLAY_SETTING,
  payload: {
    key: keyof DisplaySettings,
    value: any,
  },
}

export interface ISetSelectedSignal extends IDeviceAwareAction {
  type: ActionType.SET_SELECTED_SIGNAL,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    signalId: SignalId,
  }
}

export interface IAddSignalInstance extends IDeviceAwareAction {
  type: ActionType.ADD_SIGNAL_INSTANCE,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    instance: ISignalInstanceState,
  }
}

export interface IRemoveSignalInstance extends IDeviceAwareAction {
  type: ActionType.REMOVE_SIGNAL_INSTANCE,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    signalId: SignalId,
  }
}

export interface ISetSignalInstanceField extends IDeviceAwareAction {
  type: ActionType.SET_SIGNAL_INSTANCE_FIELD,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    signalId: SignalId,
    key: keyof ISignalInstanceState,
    value: any,
  }
}

export interface ISetDisplaySelectedParamGroup extends IDeviceAwareAction {
  type: ActionType.SET_DISPLAY_SELECTED_PARAM_GROUP,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    paramGroupId: ConfigParamGroupId,
  },
}

export interface ISetDisplayQuickParam extends IDeviceAwareAction {
  type: ActionType.SET_DISPLAY_QUICK_PARAM,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    param: ConfigParam,
    quick: boolean,
  },
}

export interface ISetDisplay {
  type: ActionType.SET_DISPLAY,
  payload: {
    display: IDisplayState,
  },
}

export interface ISetControlValue extends IDeviceAwareAction {
  type: ActionType.SET_CONTROL_VALUE,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    value: any,
  },
}

export interface ISetControlRangeValue extends IDeviceAwareAction {
  type: ActionType.SET_CONTROL_RANGE_VALUE,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    mode: ControlType,
    field: "min" | "max",
    value: any,
  },
}

export interface ISetDeviceRunningStatus extends IDeviceAwareAction {
  type: ActionType.SET_RUNNING_STATUS,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    running: boolean;
  }
}

export interface ISetLastSyncedConsumers extends Action {
  type: ActionType.SET_LAST_SYNCED_CONSUMERS,
  payload: {
    destinations: IDestination[],
  },
}

export interface ISetLastRunningDeviceIds extends Action {
  type: ActionType.SET_LAST_RUNNING_DEVICE_IDS,
  payload: {
    deviceIds: DeviceId[],
  },
}

export interface ISetAdvancedSearchString extends IDeviceAwareAction {
  type: ActionType.SET_ADVANCED_SEARCH_STRING,
  payload: {
    virtualDeviceId: VirtualDeviceId,
    search: string,
  }
}

export type SparkAction<R> = ThunkAction<R, IApplicationState, void, ApplicationActions>;
export type SparkDispatch = ThunkDispatch<IApplicationState, void, ApplicationActions>;

export type ApplicationActions = IUpdateDeviceProcessStatus | ISetDeviceProcessing | ISelectDevice
  | IUpdateProcessStatusByDescriptor | ISetProcessingByDescriptor
  | ISetParameters | ISetConnectedDescriptor | ISetDeviceLoaded | ISetDeviceFirmwareVersion | ISetSelectedDevice
  | ISetDeviceParameter | ISetDeviceParameterResponse | IRecalculateDeviceId
  | ISetTransientParameter | IResetTransientState
  | IUpdateGlobalProcessStatus | ISetGlobalProcessing
  | ISetNetworkDevices | IUpdateNetworkDevice | ISetNetworkScanInProgress | IConsoleOutput | ISetConsoleOutput
  | ISelectDfuDevice | ISelectAllDfuDevices
  | IUpdateFirmwareLoadingProgress | ISetLastFirmwareLoadingMessage | ISetFirmwareLoading
  | ISetFirmwareDownloading | ISetFirmwareDownloaded | ISetFirmwareDownloadError
  | ISetConfigurations | IAddConfiguration | IRemoveConfiguration | IUpdateConfiguration
  | IAddDevices | IReplaceDevices
  | IInitMessageQueue | IResetMessageQueue | IAddToMessageQueue
  | ISetSelectedTab | IOpenAlert | ICloseAlert | IOpenConfirmation | IAnswerConfirmation
  | ISaveConfirmation | IBurnConfirmation
  | ISetDisplaySelectedPanel | ISetDisplaySetting | ISetSelectedSignal | ISetDisplaySelectedQuickPanel
  | ISetDisplaySelectedPidProfile | ISetDeviceRunningStatus
  | IAddSignalInstance | IRemoveSignalInstance | ISetSignalInstanceField
  | ISetDisplaySelectedParamGroup | ISetDisplayQuickParam | ISetDisplay | ISetControlValue | ISetControlRangeValue
  | ISetLastSyncedConsumers | ISetLastRunningDeviceIds
  | ISetAdvancedSearchString
  | IAddLog;
