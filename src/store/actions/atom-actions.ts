/**
 * This file defines the simplest actions (atom actions).
 * These actions should not rely on some middleware and use only redux out-of-the box capabilities.
 */

import {
  ActionType,
  IAddConfiguration,
  IAddDevices,
  IAddLog,
  IAddToMessageQueue,
  IConsoleOutput,
  IInitMessageQueue,
  IRecalculateDeviceId,
  IRemoveConfiguration,
  IReplaceDevices,
  IResetMessageQueue,
  IResetTransientState,
  ISetConfigurations,
  ISetConnectedDescriptor,
  ISetConsoleOutput,
  ISetDeviceLoaded,
  ISetDeviceParameter,
  ISetDeviceParameterResponse,
  ISetDeviceProcessing,
  ISetFirmwareDownloaded,
  ISetFirmwareDownloadError,
  ISetFirmwareDownloading,
  ISetFirmwareLoading,
  ISetGlobalProcessing,
  ISetLastFirmwareLoadingMessage,
  ISetNetworkDevices,
  ISetNetworkScanInProgress,
  ISetParameters,
  ISetProcessingByDescriptor,
  ISetSelectedDevice,
  ISetSelectedTab,
  ISetTransientParameter,
  ISetUpdateAvailable,
  IUpdateConfiguration,
  IUpdateDeviceProcessStatus,
  IUpdateFirmwareLoadingProgress,
  IUpdateGlobalProcessStatus,
  IUpdateNetworkDevice,
  IUpdateProcessStatusByDescriptor,
} from "./action-types";
import {IServerResponse} from "../../managers/SparkManager";
import {forSelectedDevice} from "./action-creators";
import {
  DeviceId,
  IDeviceConfiguration,
  IDeviceState,
  IDeviceTransientState,
  IMessageQueueConfig,
  INetworkDevice,
  PathDescriptor,
  ProcessType,
  TabId,
  VirtualDeviceId
} from "../state";
import {ConfigParam} from "../../models/ConfigParam";

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

export const addDevices = (devices: IDeviceState[]): IAddDevices => ({
  payload: {
    devices,
  },
  type: ActionType.ADD_DEVICES
});

export const replaceDevices = (descriptor: PathDescriptor, devices: IDeviceState[]): IReplaceDevices => ({
  payload: {
    descriptor,
    devices,
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

export const setNetworkDevices = (devices: INetworkDevice[]): ISetNetworkDevices => ({
  payload: {
    devices,
  },
  type: ActionType.SET_NETWORK_DEVICES,
});

export const updateNetworkDevice = (deviceId: DeviceId,
                                    update: Partial<INetworkDevice>): IUpdateNetworkDevice => ({
  payload: {
    deviceId,
    update,
  },
  type: ActionType.UPDATE_NETWORK_DEVICE,
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

export const updateSelectedDeviceIsProcessing = forSelectedDevice(updateDeviceIsProcessing);
export const updateSelectedDeviceProcessStatus = forSelectedDevice(updateDeviceProcessStatus);
export const setSelectedDeviceParameters = forSelectedDevice(setParameters);
export const setSelectedDeviceParameterResponse = forSelectedDevice(setDeviceParameterResponse);
