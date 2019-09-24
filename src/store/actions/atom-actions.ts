import {ActionCreator} from "redux";
import {
  ActionType,
  IAddDevices,
  IAddLog,
  ISetConnectedDevice,
  ISetDeviceLoaded,
  ISetDeviceParameter,
  ISetDeviceParameterResponse,
  ISetDeviceProcessing,
  ISetGlobalProcessing,
  ISetParameters,
  ISetUpdateAvailable,
  IUpdateDeviceProcessStatus,
  IUpdateGlobalProcessStatus,
} from "./action-types";
import {IServerResponse} from "../../managers/SparkManager";
import {forSelectedDevice} from "./action-creators";
import {IDeviceState, ProcessType, VirtualDeviceId} from "../state";
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
    devices
  },
  type: ActionType.ADD_DEVICES
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
                                                                                       response: IServerResponse) => ({
  payload: {
    virtualDeviceId,
    parameter,
    response
  },
  type: ActionType.SET_DEVICE_PARAMETER_RESPONSE,
});

export const addLog: ActionCreator<IAddLog> = (log: string) => ({
  payload: {
    log
  },
  type: ActionType.ADD_LOG
});

export const setUpdateAvailable: ActionCreator<ISetUpdateAvailable> = (updateAvailable: boolean) => ({
  payload: {
    updateAvailable
  },
  type: ActionType.SET_UPDATE_AVAILABLE
});

export const updateSelectedDeviceIsProcessing = forSelectedDevice(updateDeviceIsProcessing);
export const updateSelectedDeviceProcessStatus = forSelectedDevice(updateDeviceProcessStatus);
export const setSelectedDeviceParameters = forSelectedDevice(setParameters);
export const setSelectedDeviceParameterResponse = forSelectedDevice(setDeviceParameterResponse);
