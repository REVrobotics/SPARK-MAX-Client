import {IServerResponse} from "../managers/SparkManager";
import {Intent} from "@blueprintjs/core";
import {uniqueId} from "lodash";
import {ConfigParam} from "../models/ConfigParam";

export enum ProcessType {
  Save = "Save",
  Reset = "Process"
}

export type VirtualDeviceId = string;
export type DeviceId = number;

export interface IContextState {
  connectedVirtualDeviceId?: VirtualDeviceId,
  selectedVirtualDeviceId?: VirtualDeviceId,
  isProcessing: boolean,
  processStatus: string,
}

export interface IDeviceSetState {
  orderedDevices: VirtualDeviceId[],
  devices: {[deviceId: string]: IDeviceState},
}

export interface IApplicationState {
  context: IContextState,
  deviceSet: IDeviceSetState,
  logs: string[],
  ui: IUiState;
}

export interface IDeviceInfo {
  driverName: string;
  deviceName: string;
  updateable: boolean;
}

export interface IUiState {
  confirmation?: IConfirmationDialogConfig;
  confirmationOpened: boolean;
}

export interface IDeviceState {
  id: VirtualDeviceId;
  fullDeviceId: DeviceId;
  info: IDeviceInfo;
  hubDeviceId?: VirtualDeviceId;
  processStatus: string,
  isProcessing: boolean,
  isLoaded: boolean,
  processType?: ProcessType,
  transientParameters: IDeviceTransientState;
  currentParameters: IDeviceParameterState[];
  burnedParameters: number[];
}

export interface IDeviceTransientState {
  rampRateEnabled: boolean;
}

export interface IDeviceParameterState {
  value: number;
  lastResponse?: IServerResponse;
  warning?: string;
  error?: string;
}

export interface IConfirmationDialogConfig {
  intent: Intent;
  text: string;
  yesLabel: string;
  cancelLabel: string;
}

export interface INumericFieldConstraints {
  min?: number;
  max?: number;
  integral?: boolean;
}

export type IFieldConstraints = INumericFieldConstraints;

export enum ProfileConfigParam {
  P, I, D, F
}

export const DEFAULT_TRANSIENT_STATE: IDeviceTransientState = {
  rampRateEnabled: false,
};

export enum ConfirmationAnswer {
  Yes = "Yes",
  Cancel = "Cancel"
}

const createDeviceState = (fullDeviceId: DeviceId, info: IDeviceInfo): IDeviceState => ({
  id: uniqueId("device:"),
  fullDeviceId,
  info,
  processStatus: "NOT CONNECTED",
  isProcessing: false,
  isLoaded: false,
  transientParameters: DEFAULT_TRANSIENT_STATE,
  currentParameters: [],
  burnedParameters: [],
});

export const getTransientState = (config: IDeviceParameterState[]): IDeviceTransientState => ({
  rampRateEnabled: config[ConfigParam.kRampRate].value > 0,
});

export const createUsbDeviceState = (deviceId: DeviceId, info: IDeviceInfo): IDeviceState =>
  createDeviceState(deviceId, info);

export const createCanDeviceState = (deviceId: DeviceId,
                                     info: IDeviceInfo,
                                     hubDeviceId: VirtualDeviceId): IDeviceState => ({
  ...createDeviceState(deviceId, info),
  hubDeviceId,
});

export const isHubDevice = (device: IDeviceState) => !device.hubDeviceId;
export const isCanDevice = (device: IDeviceState) => !isHubDevice(device);

export const toDeviceId = (device: string) => Number(device);
export const fromDeviceId = (deviceId: DeviceId) => String(deviceId);

export const getDeviceId = (device: IDeviceState) => device.fullDeviceId;
export const getVirtualDeviceId = (device: IDeviceState) => device.id;

export const getDeviceCurrentParameters = (device: IDeviceState) => device.currentParameters;
export const getDeviceBurnedParameters = (device: IDeviceState) => device.burnedParameters;

export const getDeviceParam = (parameters: IDeviceParameterState[], param: ConfigParam) => parameters[param];
export const getDeviceParamValue = (param: IDeviceParameterState) => param.value;

export const getProfileConfigParam = (profile: number, param: ProfileConfigParam): ConfigParam =>
  ConfigParam.kP_0 + 8 * profile + param;
