import MotorConfiguration, {REV_BRUSHLESS} from "../models/MotorConfiguration";
import {IServerResponse} from "../managers/SparkManager";
import {Intent} from "@blueprintjs/core";
import {uniqueId} from "lodash";

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
  devices: { [deviceId: string]: IDeviceState },
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

const createDeviceState = (fullDeviceId: DeviceId, info: IDeviceInfo): IDeviceState => ({
  id: uniqueId("device:"),
  fullDeviceId,
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
