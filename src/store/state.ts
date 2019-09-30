import {IServerResponse} from "../managers/SparkManager";
import {Intent} from "@blueprintjs/core";
import {uniqueId} from "lodash";
import {ConfigParam} from "../models/ConfigParam";
import {ExtendedListResponseDto} from "../models/dto";
import {setField} from "../utils/object-utils";

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
  uniqueId: number;
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

const createDeviceState = (extended: ExtendedListResponseDto): IDeviceState => ({
  id: uniqueId("device:"),
  fullDeviceId: extended.deviceId!,
  uniqueId: extended.uniqueId!,
  info: {
    deviceName: extended.deviceName!,
    driverName: extended.driverName!,
    updateable: extended.updateable!,
  },
  processStatus: "NOT CONNECTED",
  isProcessing: false,
  isLoaded: false,
  transientParameters: DEFAULT_TRANSIENT_STATE,
  currentParameters: [],
  burnedParameters: [],
});

export const getTransientState = (config: IDeviceParameterState[]): IDeviceTransientState => {
  const rampRateParam = config[ConfigParam.kRampRate];
  return {
    rampRateEnabled: rampRateParam && rampRateParam.value > 0 || false,
  };
};

export const createHubDeviceState = (extended: ExtendedListResponseDto): IDeviceState => createDeviceState(extended);

export const createCanDeviceState = (extended: ExtendedListResponseDto,
                                     hubDeviceId: VirtualDeviceId): IDeviceState => ({
  ...createDeviceState(extended),
  hubDeviceId,
});

export const isHubDevice = (device: IDeviceState) => !device.hubDeviceId;

export const toDeviceId = (device: string) => Number(device);
export const fromDeviceId = (deviceId: DeviceId) => String(deviceId);

export const getDeviceId = (device: IDeviceState) => device.fullDeviceId;
export const getVirtualDeviceId = (device: IDeviceState) => device.id;
export const setVirtualDeviceId = (device: IDeviceState, id: VirtualDeviceId) => setField(device, "id", id);

export const getDeviceCurrentParameters = (device: IDeviceState) => device.currentParameters;
export const getDeviceBurnedParameters = (device: IDeviceState) => device.burnedParameters;

export const getDeviceParam = (parameters: IDeviceParameterState[], param: ConfigParam) => parameters[param];
export const getDeviceParamValue = (param: IDeviceParameterState) => param.value;
export const hasDeviceParamError = (param: IDeviceParameterState) => param.error != null;
export const getDeviceCommittedCanId = (device: IDeviceState) => getCanIdFromDeviceId(device.fullDeviceId);

export const getProfileConfigParam = (profile: number, param: ProfileConfigParam): ConfigParam =>
  ConfigParam.kP_0 + 8 * profile + param;

/**
 * Device is considered invalid iff it has error fro CAN ID parameter.
 *
 * @param device
 */
export const isDeviceInvalid = (device: IDeviceState) => {
  const canIdParam = getDeviceParam(getDeviceCurrentParameters(device), ConfigParam.kCanID);
  return canIdParam ? hasDeviceParamError(canIdParam) : false;
};

/**
 * Device is considered not-configured iff it has uniqueId != 0.
 * @param device
 */
export const isDeviceNotConfigured = (device: IDeviceState) => device.uniqueId > 0;

// tslint:disable-next-line:no-bitwise
export const getCanIdFromDeviceId = (device: DeviceId) => 0xff & device;
