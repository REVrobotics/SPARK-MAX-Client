import {ActionCreator} from "redux";
import MotorConfiguration from "../../models/MotorConfiguration";
import {
  ActionType,
  IAddLog,
  ISetBurnedMotorConfig,
  ISetDeviceProcessing,
  ISetMotorConfig,
  ISetParameters,
  ISetParamResponses,
  ISetUpdateAvailable,
  IAddDevices,
  IUpdateDeviceProcessStatus,
  IUpdateGlobalProcessStatus,
  ISetGlobalProcessing,
  ISetMotorConfigParameter, ISetMotorConfigParameterOptions, ISetConnectedDevice, ISetDeviceLoaded,
} from "./action-types";
import {IServerResponse} from "../../managers/SparkManager";
import {forSelectedDevice} from "./action-creators";
import {IDeviceState, ProcessType, VirtualDeviceId} from "../state";

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

export const setMotorConfig: ActionCreator<ISetMotorConfig> = (virtualDeviceId: VirtualDeviceId,
                                                               config: MotorConfiguration) => ({
  payload: {
    virtualDeviceId,
    config
  },
  type: ActionType.SET_MOTOR_CONFIG
});

export const setBurnedMotorConfig: ActionCreator<ISetBurnedMotorConfig> = (virtualDeviceId: VirtualDeviceId,
                                                                           config: MotorConfiguration) => ({
  payload: {
    virtualDeviceId,
    config
  },
  type: ActionType.SET_BURNED_MOTOR_CONFIG
});

export const setMotorConfigParameter: ActionCreator<ISetMotorConfigParameter> = (virtualDeviceId: VirtualDeviceId,
                                                                                 options: ISetMotorConfigParameterOptions) => ({
  type: ActionType.SET_MOTOR_CONFIG_PARAMETER,
  payload: {
    virtualDeviceId,
    ...options,
  }
});

export const setParamResponses: ActionCreator<ISetParamResponses> = (virtualDeviceId: VirtualDeviceId,
                                                                     paramResponses: IServerResponse[]) => ({
  payload: {
    virtualDeviceId,
    paramResponses
  },
  type: ActionType.SET_SERVER_PARAM_RESPONSE
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

export const setSelectedDeviceMotorConfig = forSelectedDevice(setMotorConfig);
export const setSelectedDeviceBurnedMotorConfig = forSelectedDevice(setBurnedMotorConfig);
export const updateSelectedDeviceIsProcessing = forSelectedDevice(updateDeviceIsProcessing);
export const updateSelectedDeviceProcessStatus = forSelectedDevice(updateDeviceProcessStatus);
