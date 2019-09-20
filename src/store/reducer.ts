import {Reducer} from "redux";
import {keyBy, sortBy} from "lodash";
import {default as MotorConfiguration, REV_BRUSHLESS} from "../models/MotorConfiguration";
import {
  ActionType,
  ApplicationActions,
  DeviceId,
  IApplicationState,
  IDeviceInfo,
  IDeviceState,
  IUiState,
} from "./types";
import {setField, setFields} from "../utils/object-utils";

export const initialState: IApplicationState = {
  orderedDevices: [],
  devices: {},
  logs: [],
  isProcessing: false,
  processStatus: "",
  ui: {
    confirmationOpened: false
  }
};

const createDeviceState = (deviceId: DeviceId, info: IDeviceInfo): IDeviceState => ({
  deviceId,
  info,
  burnedConfig: new MotorConfiguration("REV BRUSHLESS", 1),
  processStatus: "NOT CONNECTED",
  currentConfig: REV_BRUSHLESS,
  isProcessing: false,
  parameters: [],
  paramResponses: [],
  isConnected: false,
});

export const createUsbDeviceState = (deviceId: DeviceId, info: IDeviceInfo): IDeviceState =>
  createDeviceState(deviceId, info);

export const createCanDeviceState = (deviceId: DeviceId, info: IDeviceInfo, masterDeviceId: number): IDeviceState => ({
  ...createDeviceState(deviceId, info),
  masterDeviceId,
});

export const isUsbDevice = (device: IDeviceState) => !device.masterDeviceId;
export const isCanDevice = (device: IDeviceState) => !isUsbDevice(device);

export const toDeviceId = (device: string) => Number(device);
export const fromDeviceId = (deviceId: DeviceId) => String(deviceId);

const reducer: Reducer<IApplicationState> = (state: IApplicationState = initialState,
                                             action: ApplicationActions): IApplicationState => {
  switch (action.type) {
    case ActionType.ADD_DEVICES: {
      const devices = setFields(state.devices, keyBy(action.payload.devices, "deviceId"));
      return setFields(state, {
        devices,
        orderedDevices: sortBy(Object.keys(devices).map(Number)),
      });
    }
    case ActionType.SELECT_DEVICE:
      return setField(state, "selectedDeviceId", action.payload.deviceId);
    case ActionType.SET_GLOBAL_PROCESS_STATUS:
      return setField(state, "processStatus", action.payload.processStatus);
    case ActionType.SET_GLOBAL_PROCESSING:
      return setField(state, "isProcessing", action.payload.isProcessing);
    case ActionType.SET_DEVICE_PROCESS_STATUS:
    case ActionType.SET_DEVICE_PROCESSING:
    case ActionType.SET_PARAMETERS:
    case ActionType.SET_CURRENT_MOTOR_CONFIG:
    case ActionType.SET_BURNED_MOTOR_CONFIG:
    case ActionType.SET_SERVER_PARAM_RESPONSE:
      return setField(
        state,
        "devices",
        setField(state.devices,
          action.payload.deviceId,
          deviceReducer(state.devices[action.payload.deviceId], action)));
    case ActionType.ADD_LOG:
      return {...state, logs: [...state.logs, action.payload.log]};
    case ActionType.OPEN_CONFIRMATION:
    case ActionType.ANSWER_CONFIRMATION:
      return setField(state, "ui", uiReducer(state.ui, action));
    default:
      return state;
  }
};

const uiReducer: Reducer<IUiState> = (state: IUiState, action: ApplicationActions): IUiState => {
  switch (action.type) {
    case ActionType.OPEN_CONFIRMATION:
      return { ...state, confirmation: action.payload, confirmationOpened: true };
    case ActionType.ANSWER_CONFIRMATION:
      return { ...state, confirmationOpened: false };
    default:
      return state;
  }
};

const deviceReducer: Reducer<IDeviceState> = (state: IDeviceState, action: ApplicationActions): IDeviceState => {
  switch (action.type) {
    case ActionType.SET_DEVICE_PROCESS_STATUS:
      return {...state, isConnected: action.payload.isConnected, processStatus: action.payload.processStatus};
    case ActionType.SET_DEVICE_PROCESSING:
      return {...state, isProcessing: action.payload.isProcessing, processType: action.payload.processType};
    case ActionType.SET_PARAMETERS:
      return {...state, parameters: action.payload.parameters};
    case ActionType.SET_CURRENT_MOTOR_CONFIG:
      return {...state, currentConfig: action.payload.config};
    case ActionType.SET_BURNED_MOTOR_CONFIG:
      return {...state, burnedConfig: action.payload.config};
    case ActionType.SET_SERVER_PARAM_RESPONSE:
      return {...state, paramResponses: action.payload.paramResponses};
    default:
      return state;
  }
};

export default reducer;