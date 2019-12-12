/**
 * This file defines the simplest actions (atom actions).
 * These actions should not rely on some middleware and use only redux out-of-the box capabilities.
 */

import {
  ActionType,
  IAddConfiguration,
  IAddDevices,
  IAddLog,
  IAddSignalInstance,
  IAddToMessageQueue,
  IConsoleOutput,
  IInitMessageQueue,
  IRecalculateDeviceId,
  IRemoveConfiguration,
  IRemoveSignalInstance,
  IReplaceDevices,
  IResetMessageQueue,
  IResetTransientState, ISelectAllDfuDevices, ISelectDfuDevice,
  ISetAdvancedSearchString,
  ISetConfigurations,
  ISetConnectedDescriptor,
  ISetConsoleOutput,
  ISetControlValue,
  ISetDeviceLoaded,
  ISetDeviceParameter,
  ISetDeviceParameterResponse,
  ISetDeviceProcessing,
  ISetDeviceRunningStatus,
  ISetDisplay,
  ISetDisplayQuickParam,
  ISetDisplaySelectedPanel,
  ISetDisplaySelectedParamGroup,
  ISetDisplaySelectedPidProfile,
  ISetDisplaySelectedQuickPanel,
  ISetDisplaySetting,
  ISetFirmwareDownloaded,
  ISetFirmwareDownloadError,
  ISetFirmwareDownloading,
  ISetFirmwareLoading,
  ISetGlobalProcessing,
  ISetLastFirmwareLoadingMessage,
  ISetLastSyncedConsumers, ISetLastRunningDeviceIds,
  ISetNetworkDevices,
  ISetNetworkScanInProgress,
  ISetParameters,
  ISetProcessingByDescriptor,
  ISetSelectedDevice,
  ISetSelectedSignal,
  ISetSelectedTab,
  ISetSignalInstanceField,
  ISetTransientParameter,
  ISetUpdateAvailable,
  IUpdateConfiguration,
  IUpdateDeviceProcessStatus,
  IUpdateFirmwareLoadingProgress,
  IUpdateGlobalProcessStatus,
  IUpdateNetworkDevice,
  IUpdateProcessStatusByDescriptor, ISetControlRangeValue,
} from "./action-types";
import {IServerResponse} from "../../managers/SparkManager";
import {forSelectedDevice} from "./action-creators";
import {
  DeviceId,
  DisplaySettings,
  IDestination,
  IDeviceConfiguration,
  IDeviceState,
  IDeviceTransientState, IDfuDevice,
  IDisplayState,
  IMessageQueueConfig,
  INetworkDevice,
  ISignalInstanceState,
  PanelName,
  PathDescriptor,
  ProcessType,
  QuickPanelName,
  SignalId,
  TabId,
  VirtualDeviceId
} from "../state";
import {ConfigParam, ConfigParamGroupId} from "../../models/ConfigParam";
import {ControlType} from "../../models/proto-gen/SPARK-MAX-Types_dto_pb";

export const updateGlobalProcessStatus = (processStatus: string): IUpdateGlobalProcessStatus => ({
  payload: {
    processStatus,
  },
  type: ActionType.SET_GLOBAL_PROCESS_STATUS
});

export const updateGlobalIsProcessing = (isProcessing: boolean): ISetGlobalProcessing => ({
  payload: {
    isProcessing
  },
  type: ActionType.SET_GLOBAL_PROCESSING
});

export const updateDeviceProcessStatus = (virtualDeviceId: VirtualDeviceId,
                                          processStatus: string): IUpdateDeviceProcessStatus => ({
  payload: {
    virtualDeviceId,
    processStatus,
  },
  type: ActionType.SET_DEVICE_PROCESS_STATUS
});

export const updateProcessStatusByDescriptor = (descriptor: PathDescriptor,
                                                processStatus: string): IUpdateProcessStatusByDescriptor => ({
  payload: {
    descriptor,
    processStatus,
  },
  type: ActionType.SET_PROCESS_STATUS_BY_DESCRIPTOR
});

export const setConnectedDescriptor = (descriptor?: PathDescriptor): ISetConnectedDescriptor => ({
  payload: {
    descriptor,
  },
  type: ActionType.SET_CONNECTED_DESCRIPTOR
});

export const setDeviceLoaded = (virtualDeviceId: VirtualDeviceId,
                                loaded: boolean): ISetDeviceLoaded => ({
  payload: {
    virtualDeviceId,
    loaded
  },
  type: ActionType.SET_DEVICE_LOADED
});

export const updateDeviceIsProcessing = (virtualDeviceId: VirtualDeviceId,
                                         isProcessing: boolean,
                                         processType?: ProcessType): ISetDeviceProcessing => ({
  payload: {
    virtualDeviceId,
    isProcessing,
    processType
  },
  type: ActionType.SET_DEVICE_PROCESSING
});

export const updateIsProcessingByDescriptor = (descriptor: PathDescriptor,
                                               isProcessing: boolean,
                                               processType?: ProcessType): ISetProcessingByDescriptor => ({
  payload: {
    descriptor,
    isProcessing,
    processType
  },
  type: ActionType.SET_PROCESSING_BY_DESCRIPTOR
});

export const addDevices = (devices: IDeviceState[], descriptors?: PathDescriptor[]): IAddDevices => ({
  payload: {
    devices,
    descriptors,
  },
  type: ActionType.ADD_DEVICES
});

export const replaceDevices = (devices: IDeviceState[], descriptors?: PathDescriptor[]): IReplaceDevices => ({
  payload: {
    devices,
    descriptors,
  },
  type: ActionType.REPLACE_DEVICES
});

export const setParameters = (virtualDeviceId: VirtualDeviceId,
                              parameters: number[]): ISetParameters => ({
  payload: {
    virtualDeviceId,
    parameters
  },
  type: ActionType.SET_PARAMETERS
});

export const setDeviceParameter = (virtualDeviceId: VirtualDeviceId,
                                   parameter: ConfigParam,
                                   value: number): ISetDeviceParameter => ({
  payload: {
    virtualDeviceId,
    parameter,
    value
  },
  type: ActionType.SET_DEVICE_PARAMETER,
});

export const setOnlyTransientParameter = (virtualDeviceId: VirtualDeviceId,
                                          field: keyof IDeviceTransientState,
                                          value: any): ISetTransientParameter => ({
  payload: {
    virtualDeviceId,
    field,
    value
  },
  type: ActionType.SET_TRANSIENT_PARAMETER,
});

export const resetTransientState = (virtualDeviceId: VirtualDeviceId): IResetTransientState => ({
  payload: {
    virtualDeviceId,
  },
  type: ActionType.RESET_TRANSIENT_STATE,
});

export const setDeviceParameterResponse = (virtualDeviceId: VirtualDeviceId,
                                           parameter: ConfigParam,
                                           response: IServerResponse,
                                           updateValue: boolean): ISetDeviceParameterResponse => ({
  payload: {
    virtualDeviceId,
    parameter,
    response,
    updateValue,
  },
  type: ActionType.SET_DEVICE_PARAMETER_RESPONSE,
});

export const recalculateDeviceId = (virtualDeviceId: VirtualDeviceId): IRecalculateDeviceId => ({
  payload: {
    virtualDeviceId,
  },
  type: ActionType.RECALCULATE_DEVICE_ID,
});

export const setSelectedDevice = (virtualDeviceId: VirtualDeviceId): ISetSelectedDevice => ({
  payload: {
    virtualDeviceId,
  },
  type: ActionType.SET_SELECTED_DEVICE,
});

export const addLog = (log: string): IAddLog => ({
  payload: {
    log
  },
  type: ActionType.ADD_LOG
});

export const setNetworkDevices = (devices: INetworkDevice[], dfuDevices: IDfuDevice[]): ISetNetworkDevices => ({
  payload: {
    devices,
    dfuDevices,
  },
  type: ActionType.SET_NETWORK_DEVICES,
});

export const updateNetworkDevice = (id: string,
                                    update: Partial<INetworkDevice>): IUpdateNetworkDevice => ({
  payload: {
    id,
    update,
  },
  type: ActionType.UPDATE_NETWORK_DEVICE,
});

export const selectDfuDevice = (id: string, selected: boolean): ISelectDfuDevice => ({
  payload: {id, selected},
  type: ActionType.SELECT_DFU_DEVICE,
});

export const selectAllDfuDevices = (selected: boolean): ISelectAllDfuDevices => ({
  payload: {selected},
  type: ActionType.SELECT_ALL_DFU_DEVICES,
});

export const setNetworkScanInProgress = (scanInProgress: boolean): ISetNetworkScanInProgress => ({
  payload: {
    scanInProgress,
  },
  type: ActionType.SET_NETWORK_SCAN_IN_PROGRESS,
});

export const setFirmwareDownloading = (): ISetFirmwareDownloading => ({
  payload: {},
  type: ActionType.SET_FIRMWARE_DOWNLOADING,
});

export const setFirmwareDownloaded = (config: any): ISetFirmwareDownloaded => ({
  payload: {config},
  type: ActionType.SET_FIRMWARE_DOWNLOADED,
});

export const setFirmwareDownloadError = (): ISetFirmwareDownloadError => ({
  payload: {},
  type: ActionType.SET_FIRMWARE_DOWNLOAD_ERROR,
});

export const setFirmwareLoading = (loading: boolean): ISetFirmwareLoading => ({
  payload: {loading},
  type: ActionType.SET_FIRMWARE_LOADING,
});

export const consoleOutput = (text: string): IConsoleOutput => ({
  payload: {text},
  type: ActionType.CONSOLE_OUTPUT,
});

export const setConsoleOutput = (text: string[]): ISetConsoleOutput => ({
  payload: {text},
  type: ActionType.SET_CONSOLE_OUTPUT,
});

export const updateFirmwareLoadingProgress = (progress: number,
                                              text: string): IUpdateFirmwareLoadingProgress => ({
  payload: {progress, text},
  type: ActionType.UPDATE_FIRMWARE_LOADING_PROGRESS,
});

export const setLastFirmwareLoadingMessage = (message: string): ISetLastFirmwareLoadingMessage => ({
  payload: {message},
  type: ActionType.SET_LAST_FIRMWARE_LOADING_MESSAGE,
});

export const setUpdateAvailable = (updateAvailable: boolean): ISetUpdateAvailable => ({
  payload: {
    updateAvailable
  },
  type: ActionType.SET_UPDATE_AVAILABLE
});

export const setSelectedTab = (tab: TabId): ISetSelectedTab => ({
  payload: {tab},
  type: ActionType.SET_SELECTED_TAB,
});

export const setConfigurations = (configurations: IDeviceConfiguration[]): ISetConfigurations => ({
  payload: {
    configurations,
  },
  type: ActionType.SET_CONFIGURATIONS
});

export const addConfiguration = (configuration: IDeviceConfiguration): IAddConfiguration => ({
  payload: {
    configuration,
  },
  type: ActionType.ADD_CONFIGURATION
});

export const updateConfiguration = (id: string,
                                    configuration: Partial<IDeviceConfiguration>): IUpdateConfiguration => ({
  payload: {
    id,
    configuration,
  },
  type: ActionType.UPDATE_CONFIGURATION
});

export const removeConfiguration = (id: string): IRemoveConfiguration => ({
  payload: {
    id,
  },
  type: ActionType.REMOVE_CONFIGURATION
});

export const initMessageQueue = (config: IMessageQueueConfig): IInitMessageQueue => ({
  payload: config,
  type: ActionType.INIT_MESSAGE_QUEUE,
});

export const resetMessageQueue = (): IResetMessageQueue => ({
  type: ActionType.RESET_MESSAGE_QUEUE,
});

export const addToMessageQueue = (messages: string[]): IAddToMessageQueue => ({
  payload: {
    messages
  },
  type: ActionType.ADD_TO_MESSAGE_QUEUE,
});

export const setDisplaySelectedPanel = (panel: PanelName): ISetDisplaySelectedPanel => ({
  payload: {panel},
  type: ActionType.SET_DISPLAY_SELECTED_PANEL,
});

export const setDisplaySelectedQuickPanel = (panel: QuickPanelName): ISetDisplaySelectedQuickPanel => ({
  payload: {panel},
  type: ActionType.SET_DISPLAY_SELECTED_QUICK_PANEL,
});

export const setDisplaySelectedPidProfile = (virtualDeviceId: VirtualDeviceId,
                                             profile: number): ISetDisplaySelectedPidProfile => ({
  payload: {virtualDeviceId, profile},
  type: ActionType.SET_DISPLAY_SELECTED_PID_PROFILE,
});

export const setDisplaySetting = (key: keyof DisplaySettings, value: any): ISetDisplaySetting => ({
  payload: {key, value},
  type: ActionType.SET_DISPLAY_SETTING,
});

export const setSelectedSignal = (virtualDeviceId: VirtualDeviceId, signalId: SignalId): ISetSelectedSignal => ({
  type: ActionType.SET_SELECTED_SIGNAL,
  payload: {virtualDeviceId, signalId},
});

export const addSignalInstance = (instance: ISignalInstanceState): IAddSignalInstance => ({
  type: ActionType.ADD_SIGNAL_INSTANCE,
  payload: {virtualDeviceId: instance.virtualDeviceId, instance},
});

export const removeSignalInstance = (virtualDeviceId: VirtualDeviceId, signalId: SignalId): IRemoveSignalInstance => ({
  type: ActionType.REMOVE_SIGNAL_INSTANCE,
  payload: {virtualDeviceId, signalId},
});

export const setSignalInstanceField = (virtualDeviceId: VirtualDeviceId,
                                       signalId: SignalId,
                                       key: keyof ISignalInstanceState,
                                       value: any): ISetSignalInstanceField => ({
  type: ActionType.SET_SIGNAL_INSTANCE_FIELD,
  payload: {virtualDeviceId, signalId, key, value},
});

export const setDisplaySelectedParamGroupId = (virtualDeviceId: VirtualDeviceId,
                                               paramGroupId: ConfigParamGroupId): ISetDisplaySelectedParamGroup => ({
  type: ActionType.SET_DISPLAY_SELECTED_PARAM_GROUP,
  payload: {virtualDeviceId, paramGroupId},
});

export const setDisplayQuickParam = (virtualDeviceId: VirtualDeviceId,
                                     param: ConfigParam,
                                     quick: boolean): ISetDisplayQuickParam => ({
  type: ActionType.SET_DISPLAY_QUICK_PARAM,
  payload: {virtualDeviceId, param, quick},
});

export const setDisplay = (display: IDisplayState): ISetDisplay => ({
  type: ActionType.SET_DISPLAY,
  payload: {display},
});

export const setControlValue = (virtualDeviceId: VirtualDeviceId, value: any): ISetControlValue => ({
  type: ActionType.SET_CONTROL_VALUE,
  payload: {virtualDeviceId, value},
});

export const setControlRangeValue = (virtualDeviceId: VirtualDeviceId,
                                     mode: ControlType,
                                     field: "min" | "max",
                                     value: any): ISetControlRangeValue => ({
  type: ActionType.SET_CONTROL_RANGE_VALUE,
  payload: {virtualDeviceId, mode, field, value},
});

export const setDeviceRunning = (virtualDeviceId: VirtualDeviceId) => setDeviceRunningStatus(virtualDeviceId, true);
export const setDeviceStopped = (virtualDeviceId: VirtualDeviceId) => setDeviceRunningStatus(virtualDeviceId, false);

const setDeviceRunningStatus = (virtualDeviceId: VirtualDeviceId, running: boolean): ISetDeviceRunningStatus => ({
  type: ActionType.SET_RUNNING_STATUS,
  payload: {virtualDeviceId, running},
});

export const setLastSyncedConsumers = (destinations: IDestination[]): ISetLastSyncedConsumers => ({
  type: ActionType.SET_LAST_SYNCED_CONSUMERS,
  payload: {destinations},
});

export const setLastRunningDeviceIds = (deviceIds: DeviceId[]): ISetLastRunningDeviceIds => ({
  type: ActionType.SET_LAST_RUNNING_DEVICE_IDS,
  payload: {deviceIds},
});

export const setAdvancedSearchString = (virtualDeviceId: VirtualDeviceId,
                                        search: string): ISetAdvancedSearchString => ({
  type: ActionType.SET_ADVANCED_SEARCH_STRING,
  payload: {virtualDeviceId, search},
});

export const updateSelectedDeviceIsProcessing = forSelectedDevice(updateDeviceIsProcessing);
export const updateSelectedDeviceProcessStatus = forSelectedDevice(updateDeviceProcessStatus);
export const setSelectedDeviceParameters = forSelectedDevice(setParameters);
export const setSelectedDeviceParameterResponse = forSelectedDevice(setDeviceParameterResponse);
export const setSelectedDeviceSignal = forSelectedDevice(setSelectedSignal);
export const setSelectedDeviceDisplayParamGroup = forSelectedDevice(setDisplaySelectedParamGroupId);
export const setSelectedDeviceDisplayPidProfile = forSelectedDevice(setDisplaySelectedPidProfile);
export const setSelectedDeviceAdvancedSearchString = forSelectedDevice(setAdvancedSearchString);
