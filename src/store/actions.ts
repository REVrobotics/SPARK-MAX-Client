import {ActionCreator} from "redux";
import MotorConfiguration from "../models/MotorConfiguration";
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
  IDeviceState,
  DeviceId,
  IUpdateGlobalProcessStatus,
  ISetGlobalProcessing,
  SparkAction,
  ISelectDevice, ProcessType,
} from "./types";
import {IServerResponse} from "../managers/SparkManager";
import {getSelectedDeviceId} from "./selectors";

export const updateGlobalProcessStatus: ActionCreator<IUpdateGlobalProcessStatus> = (isConnected: boolean,
                                                                                     processStatus: string) => ({
  payload: {
    processStatus,
    isConnected
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
                                                                                     isConnected: boolean,
                                                                                     processStatus: string) => ({
  payload: {
    deviceId,
    processStatus,
    isConnected
  },
  type: ActionType.SET_DEVICE_PROCESS_STATUS
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
  type: ActionType.SET_CURRENT_MOTOR_CONFIG
});

export const setBurnedMotorConfig: ActionCreator<ISetBurnedMotorConfig> = (deviceId: DeviceId,
                                                                           config: MotorConfiguration) => ({
  payload: {
    deviceId,
    config
  },
  type: ActionType.SET_BURNED_MOTOR_CONFIG
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

export const selectDevice: ActionCreator<ISelectDevice> = (deviceId: DeviceId) => ({
  payload: {
    deviceId
  },
  type: ActionType.SELECT_DEVICE,
});

export const setSelectedDeviceMotorConfig = (config: MotorConfiguration): SparkAction<void> =>
  (dispatch, getState) => {
    const selectedDeviceId = getSelectedDeviceId(getState());
    if (selectedDeviceId) {
      dispatch(setMotorConfig(selectedDeviceId, config));
    }
  };

export const setSelectedDeviceBurnedMotorConfig = (config: MotorConfiguration): SparkAction<void> =>
  (dispatch, getState) => {
    const selectedDeviceId = getSelectedDeviceId(getState());
    if (selectedDeviceId) {
      dispatch(setBurnedMotorConfig(selectedDeviceId, config));
    }
  };

export const updateSelectedDeviceIsProcessing = (isProcessing: boolean): SparkAction<void> =>
  (dispatch, getState) => {
    const selectedDeviceId = getSelectedDeviceId(getState());
    if (selectedDeviceId) {
      dispatch(updateDeviceIsProcessing(selectedDeviceId, isProcessing));
    }
  };

export const updateSelectedDeviceProcessStatus = (isConnected: boolean, processStatus: string): SparkAction<void> =>
  (dispatch, getState) => {
    const selectedDeviceId = getSelectedDeviceId(getState());
    if (selectedDeviceId) {
      dispatch(updateDeviceProcessStatus(selectedDeviceId, isConnected, processStatus));
    }
  };
