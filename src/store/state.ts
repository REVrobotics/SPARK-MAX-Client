import MotorConfiguration, {REV_BRUSHLESS} from "../models/MotorConfiguration";
import {IServerResponse} from "../managers/SparkManager";
import {Intent} from "@blueprintjs/core";

export enum ProcessType {
  Save = "Save",
  Reset = "Process"
}

export type DeviceId = number;

export interface IContextState {
  connectedDeviceId?: DeviceId,
  selectedDeviceId?: DeviceId,
  isProcessing: boolean,
  processStatus: string,
}

export interface IDeviceSetState {
  orderedDevices: DeviceId[],
  devices: { [deviceId: number]: IDeviceState },
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
  deviceId: DeviceId;
  info: IDeviceInfo;
  masterDeviceId?: number;
  processStatus: string,
  isProcessing: boolean,
  isLoaded: boolean,
  processType?: ProcessType,
  parameters: number[],
  currentConfig: MotorConfiguration,
  burnedConfig: MotorConfiguration,
  paramResponses: IServerResponse[]
}

export interface IConfirmationDialogConfig {
  intent: Intent;
  text: string;
  yesLabel: string;
  cancelLabel: string;
}

export enum ConfirmationAnswer {
  Yes = "Yes",
  Cancel = "Cancel"
}

const createDeviceState = (deviceId: DeviceId, info: IDeviceInfo): IDeviceState => ({
  deviceId,
  info,
  burnedConfig: new MotorConfiguration("REV BRUSHLESS", 1),
  processStatus: "NOT CONNECTED",
  currentConfig: REV_BRUSHLESS,
  isProcessing: false,
  isLoaded: false,
  parameters: [],
  paramResponses: [],
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
