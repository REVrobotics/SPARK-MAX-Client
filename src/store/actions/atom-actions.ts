/**
 * This file defines the simplest actions (atom actions).
 * These actions should not rely on some middleware and use only redux out-of-the box capabilities.
 */

import {ActionCreator} from "redux";
import {
  ActionType,
  IAddDevices,
  IAddLog, IConsoleOutput, ISetLastFirmwareLoadingMessage, IRecalculateDeviceId, IReplaceDevices,
  ISetConnectedDevice, ISetConsoleOutput,
  ISetDeviceLoaded,
  ISetDeviceParameter,
  ISetDeviceParameterResponse,
  ISetDeviceProcessing, ISetFirmwareDownloaded, ISetFirmwareDownloadError, ISetFirmwareDownloading, ISetFirmwareLoading,
  ISetGlobalProcessing, ISetNetworkDevices, ISetNetworkScanInProgress,
  ISetParameters, ISetSelectedDevice,
  ISetUpdateAvailable,
  IUpdateDeviceProcessStatus, IUpdateFirmwareLoadingProgress,
  IUpdateGlobalProcessStatus, IUpdateNetworkDevice, ISetSelectedTab,
} from "./action-types";
import {IServerResponse} from "../../managers/SparkManager";
import {forSelectedDevice} from "./action-creators";
import {DeviceId, IDeviceState, INetworkDevice, ProcessType, TabId, VirtualDeviceId} from "../state";
import {ConfigParam} from "../../models/ConfigParam";

export const updateGlobalProcessStatus: ActionCreator<IUpdateGlobalProcessStatus> = (processStatus: string) => ({
  payload: {
    processStatus,
  },
  type: ActionType.SET_GLOBAL_PROCESS_STATUS
});

export const updateGlobalIsProcessing: ActionCreator<ISetGlobalProcessing> = (isProcessing: boolean) => ({
  payload: {
    isProcessing
  },
  type: ActionType.SET_GLOBAL_PROCESSING
});

export const updateDeviceProcessStatus: ActionCreator<IUpdateDeviceProcessStatus> = (virtualDeviceId: VirtualDeviceId,
                                                                                     processStatus: string) => ({
  payload: {
    virtualDeviceId,
    processStatus,
  },
  type: ActionType.SET_DEVICE_PROCESS_STATUS
});

export const setConnectedDevice: ActionCreator<ISetConnectedDevice> = (virtualDeviceId: VirtualDeviceId,
                                                                       connected: boolean) => ({
  payload: {
    virtualDeviceId,
    connected
  },
  type: ActionType.SET_CONNECTED_DEVICE
});

export const setDeviceLoaded: ActionCreator<ISetDeviceLoaded> = (virtualDeviceId: VirtualDeviceId,
                                                                 loaded: boolean) => ({
  payload: {
    virtualDeviceId,
    loaded
  },
  type: ActionType.SET_DEVICE_LOADED
});

export const updateDeviceIsProcessing: ActionCreator<ISetDeviceProcessing> = (virtualDeviceId: VirtualDeviceId,
                                                                              isProcessing: boolean,
                                                                              processType?: ProcessType) => ({
  payload: {
    virtualDeviceId,
    isProcessing,
    processType
  },
  type: ActionType.SET_DEVICE_PROCESSING
});

export const addDevices: ActionCreator<IAddDevices> = (devices: IDeviceState[]) => ({
  payload: {
    devices,
  },
  type: ActionType.ADD_DEVICES
});

export const replaceDevices: ActionCreator<IReplaceDevices> = (device: IDeviceState,
                                                               replaceIds: VirtualDeviceId[]) => ({
  payload: {
    device,
    replaceIds,
  },
  type: ActionType.REPLACE_DEVICES
});

export const setParameters: ActionCreator<ISetParameters> = (virtualDeviceId: VirtualDeviceId,
                                                             parameters: number[]) => ({
  payload: {
    virtualDeviceId,
    parameters
  },
  type: ActionType.SET_PARAMETERS
});

export const setDeviceParameter: ActionCreator<ISetDeviceParameter> = (virtualDeviceId: VirtualDeviceId,
                                                                       parameter: ConfigParam,
                                                                       value: number) => ({
  payload: {
    virtualDeviceId,
    parameter,
    value
  },
  type: ActionType.SET_DEVICE_PARAMETER,
});

export const setDeviceParameterResponse: ActionCreator<ISetDeviceParameterResponse> = (virtualDeviceId: VirtualDeviceId,
                                                                                       parameter: ConfigParam,
                                                                                       response: IServerResponse,
                                                                                       updateValue: boolean) => ({
  payload: {
    virtualDeviceId,
    parameter,
    response,
    updateValue,
  },
  type: ActionType.SET_DEVICE_PARAMETER_RESPONSE,
});

export const recalculateDeviceId: ActionCreator<IRecalculateDeviceId> = (virtualDeviceId: VirtualDeviceId) => ({
  payload: {
    virtualDeviceId,
  },
  type: ActionType.RECALCULATE_DEVICE_ID,
});

export const setSelectedDevice: ActionCreator<ISetSelectedDevice> = (virtualDeviceId: VirtualDeviceId) => ({
  payload: {
    virtualDeviceId,
  },
  type: ActionType.SET_SELECTED_DEVICE,
});

export const addLog: ActionCreator<IAddLog> = (log: string) => ({
  payload: {
    log
  },
  type: ActionType.ADD_LOG
});

export const setNetworkDevices: ActionCreator<ISetNetworkDevices> = (devices: INetworkDevice[]) => ({
  payload: {
    devices,
  },
  type: ActionType.SET_NETWORK_DEVICES,
});

export const updateNetworkDevice: ActionCreator<IUpdateNetworkDevice> = (deviceId: DeviceId,
                                                                         update: Partial<INetworkDevice>) => ({
  payload: {
    deviceId,
    update,
  },
  type: ActionType.UPDATE_NETWORK_DEVICE,
});

export const setNetworkScanInProgress: ActionCreator<ISetNetworkScanInProgress> = (scanInProgress: boolean) => ({
  payload: {
    scanInProgress,
  },
  type: ActionType.SET_NETWORK_SCAN_IN_PROGRESS,
});

export const setFirmwareDownloading: ActionCreator<ISetFirmwareDownloading> = () => ({
  payload: {},
  type: ActionType.SET_FIRMWARE_DOWNLOADING,
});

export const setFirmwareDownloaded: ActionCreator<ISetFirmwareDownloaded> = (config: any) => ({
  payload: {config},
  type: ActionType.SET_FIRMWARE_DOWNLOADED,
});

export const setFirmwareDownloadError: ActionCreator<ISetFirmwareDownloadError> = () => ({
  payload: {},
  type: ActionType.SET_FIRMWARE_DOWNLOAD_ERROR,
});

export const setFirmwareLoading: ActionCreator<ISetFirmwareLoading> = (loading: boolean) => ({
  payload: {loading},
  type: ActionType.SET_FIRMWARE_LOADING,
});

export const consoleOutput: ActionCreator<IConsoleOutput> = (text: string) => ({
  payload: {text},
  type: ActionType.CONSOLE_OUTPUT,
});

export const setConsoleOutput: ActionCreator<ISetConsoleOutput> = (text: string[]) => ({
  payload: {text},
  type: ActionType.SET_CONSOLE_OUTPUT,
});

export const updateFirmwareLoadingProgress: ActionCreator<IUpdateFirmwareLoadingProgress> = (progress: number,
                                                                                             text: string) => ({
  payload: {progress, text},
  type: ActionType.UPDATE_FIRMWARE_LOADING_PROGRESS,
});

export const setLastFirmwareLoadingMessage: ActionCreator<ISetLastFirmwareLoadingMessage> = (message: string) => ({
  payload: {message},
  type: ActionType.SET_LAST_FIRMWARE_LOADING_MESSAGE,
});

export const setUpdateAvailable: ActionCreator<ISetUpdateAvailable> = (updateAvailable: boolean) => ({
  payload: {
    updateAvailable
  },
  type: ActionType.SET_UPDATE_AVAILABLE
});

export const setSelectedTab = (tab: TabId): ISetSelectedTab => ({
  payload: { tab },
  type: ActionType.SET_SELECTED_TAB,
});

export const updateSelectedDeviceIsProcessing = forSelectedDevice(updateDeviceIsProcessing);
export const updateSelectedDeviceProcessStatus = forSelectedDevice(updateDeviceProcessStatus);
export const setSelectedDeviceParameters = forSelectedDevice(setParameters);
export const setSelectedDeviceParameterResponse = forSelectedDevice(setDeviceParameterResponse);
