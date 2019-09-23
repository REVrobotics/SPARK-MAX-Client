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
import {DeviceId, IDeviceState, ProcessType} from "../state";

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

export const updateDeviceProcessStatus: ActionCreator<IUpdateDeviceProcessStatus> = (deviceId: DeviceId,
                                                                                     processStatus: string) => ({
  payload: {
    deviceId,
    processStatus,
  },
  type: ActionType.SET_DEVICE_PROCESS_STATUS
});

export const setConnectedDevice: ActionCreator<ISetConnectedDevice> = (deviceId: DeviceId, connected: boolean) => ({
  payload: {
    deviceId,
    connected
  },
  type: ActionType.SET_CONNECTED_DEVICE
});

export const setDeviceLoaded: ActionCreator<ISetDeviceLoaded> = (deviceId: DeviceId, loaded: boolean) => ({
  payload: {
    deviceId,
    loaded
  },
  type: ActionType.SET_DEVICE_LOADED
});

export const updateDeviceIsProcessing: ActionCreator<ISetDeviceProcessing> = (deviceId: DeviceId,
                                                                              isProcessing: boolean,
                                                                              processType?: ProcessType) => ({
  payload: {
    deviceId,
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

export const setParameters: ActionCreator<ISetParameters> = (deviceId: DeviceId, parameters: number[]) => ({
  payload: {
    deviceId,
    parameters
  },
  type: ActionType.SET_PARAMETERS
});

export const setMotorConfig: ActionCreator<ISetMotorConfig> = (deviceId: DeviceId, config: MotorConfiguration) => ({
  payload: {
    deviceId,
    config
  },
  type: ActionType.SET_MOTOR_CONFIG
});

export const setBurnedMotorConfig: ActionCreator<ISetBurnedMotorConfig> = (deviceId: DeviceId,
                                                                           config: MotorConfiguration) => ({
  payload: {
    deviceId,
    config
  },
  type: ActionType.SET_BURNED_MOTOR_CONFIG
});

export const setMotorConfigParameter: ActionCreator<ISetMotorConfigParameter> = (deviceId: DeviceId,
                                                                                 options: ISetMotorConfigParameterOptions) => ({
  type: ActionType.SET_MOTOR_CONFIG_PARAMETER,
  payload: {
    deviceId,
    ...options,
  }
});

export const setParamResponses: ActionCreator<ISetParamResponses> = (deviceId: DeviceId,
                                                                     paramResponses: IServerResponse[]) => ({
  payload: {
    deviceId,
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
