/**
 * This file describes structure of application state and defines pure functions for working with it.
 */

import {IServerResponse} from "../managers/SparkManager";
import {Intent} from "@blueprintjs/core";
import {uniqueId} from "lodash";
import {ConfigParam} from "../models/ConfigParam";
import {ExtendedListResponseDto} from "../models/dto";
import {setField} from "../utils/object-utils";

/**
 * Allows to track type of current processing, like saving or resetting
 */
export enum ProcessType {
  Save = "Save",
  Reset = "Reset"
}

/**
 * The reason device is blocked
 */
export enum DeviceBlockedReason {
  NotConfigured = "NotConfigured",
  Invalid = "Invalid",
}

/**
 * Unfortunately, device does not have any field that can be used as unique and permanent ID across all devices.
 * That is why client application generates virtual id for each device.
 */
export type VirtualDeviceId = string;
/**
 * "Physical ID" for device.
 * Despite this is an ID of device, it is not unique across devices coming from different CAN buses.
 * Moreover Device ID is changed as soon as CAN ID is modified.
 *
 * Device has the following format: 0x000000
 * Where bytes have the following meaning
 * * Manufacturer ID (02 = Rev Robotics)
 * * Device Type (05 = Motor Controller)
 * * Device ID (CAN ID of the device)
 */
export type DeviceId = number;

/**
 * Device-independent status of application
 */
export interface IContextState {
  /**
   * ID of connected device
   * TODO: in future it seems we will use descriptor, which groups devices on single CAN bus together
   */
  connectedVirtualDeviceId?: VirtualDeviceId,
  /**
   * ID of selected device
   */
  selectedVirtualDeviceId?: VirtualDeviceId,
  /**
   * Do we have any global processing, like searching of device, scanning of can bus.
   * Connecting to specific device or burning configuration for specific device is not global processing.
   */
  isProcessing: boolean,
  /**
   * Human-readable status of global processing.
   */
  processStatus: string,
}

export interface IDeviceSetState {
  /**
   * Ordered list of device IDs.
   * Devices on the top dropdown are displayed according to the order in this array.
   */
  orderedDevices: VirtualDeviceId[],
  /**
   * Dictionary of all devices.
   */
  devices: { [deviceId: string]: IDeviceState },
}

export interface INetworkState {
  devices: INetworkDevice[];
  outputText: string[];
  firmwareLoading: boolean;
  firmwareLoadingProgress: number,
  firmwareLoadingText: string,
  scanInProgress: boolean;
  lastFirmwareLoadingMessage: string;
}

export interface IFirmwareState {
  loading: boolean;
  loadError: boolean;
  config: any;
}

export enum FirmwareTag {
  RecoveryUpdateRequired = "Recovery Update Required",
  Latest = "Latest",
  Previous = "Previous",
}

export interface IFirmwareEntry {
  spec: FirmwareTag;
  version: string;
  url: string;
  md5: string;
  sha1: string;
}

/**
 * Whole application state
 */
export interface IApplicationState {
  context: IContextState,
  deviceSet: IDeviceSetState,
  network: INetworkState,
  firmware: IFirmwareState;
  logs: string[],
  ui: IUiState;
}

export enum NetworkDeviceStatus {
  Unknown,
  NotUpdateable,
  NotConfigured,
  RequiresRecoveryMode,
  RecoveryMode,
  Updateable,
  Error,
}

export interface INetworkDevice {
  selected: boolean;
  deviceId: DeviceId;
  uniqueId: number;
  interfaceName: string;
  driverName: string;
  deviceName: string;
  updateable: boolean;
  firmwareVersion: string;
  loading: boolean;
  status: NetworkDeviceStatus;
  error?: string;
}

/**
 * Short information about device
 */
export interface IDeviceInfo {
  deviceId: number;
  interfaceName: string;
  driverName: string;
  deviceName: string;
  updateable: boolean;
}

export enum TabId {
  Basic = "main-tab-basic",
  Advanced = "main-tab-advanced",
  Run = "main-tab-run",
  Network = "main-tab-network",
  Help = "main-tab-help",
  About = "main-tab-about",
}

/**
 * State of shared UI components.
 * This state is necessary to support common application flows: confirmations, notifications, etc.
 */
export interface IUiState {
  selectedTabId: TabId;
  /**
   * Properties for confirmation dialog.
   */
  confirmation?: IConfirmationDialogConfig;
  confirmationOpened: boolean;
}

export interface IDeviceState {
  id: VirtualDeviceId;
  /**
   * "Physical" device ID
   */
  fullDeviceId: DeviceId;
  uniqueId: number;
  info: IDeviceInfo;
  /**
   * TODO: In future this field will be deleted as soon as we have support of descriptor
   */
  hubDeviceId?: VirtualDeviceId;
  /**
   * Do we have device-specific processing in progress,
   * like connecting to the device, burning device configuration, etc
   */
  isProcessing: boolean,
  /**
   * Type of current processing
   */
  processType?: ProcessType,
  /**
   * Human-readable status of processing
   */
  processStatus: string,
  /**
   * Are all parameters loaded.
   * Device can be connected, but its parameters may not be loaded yet.
   */
  isLoaded: boolean,
  /**
   * All device parameters
   */
  currentParameters: IDeviceParameterState[];
  /**
   * Not-persisted UI-specific state
   */
  transientParameters: IDeviceTransientState;
  /**
   * "Burned" parameter values.
   */
  burnedParameters: number[];
}

/**
 * Transient state is necessary to describe UI-specific state of device.
 */
export interface IDeviceTransientState {
  rampRateEnabled: boolean;
}

/**
 * State of separate device parameter
 */
export interface IDeviceParameterState {
  /**
   * Value of this parameter.
   */
  value: number;
  /**
   * Response of the last setParameter call.
   */
  lastResponse?: IServerResponse;
  /**
   * Any message associated with the parameter
   */
  message?: Message;
}

/**
 * Configuration of confirmation dialog
 */
export interface IConfirmationDialogConfig {
  intent: Intent;
  text: string;
  yesLabel: string;
  cancelLabel: string;
}

/**
 * Constraints used by numeric fields
 */
export interface INumericFieldConstraints {
  min?: number;
  max?: number;
  integral?: boolean;
}

export type IFieldConstraints = INumericFieldConstraints;

/**
 * Values used in control loop
 */
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

export enum MessageSeverity {
  Error = "Error",
  Warning = "Warning"
}

/**
 * Message encapsulates some validation result having severity and text
 */
export class Message {
  public static error(text: string): Message {
    return new Message(MessageSeverity.Error, text);
  }

  public static warning(text: string): Message {
    return new Message(MessageSeverity.Warning, text);
  }

  private constructor(readonly severity: MessageSeverity, readonly text: string) {
  }
}

/**
 * Creates initial state for device.
 */
const createDeviceState = (extended: ExtendedListResponseDto): IDeviceState => ({
  id: uniqueId("device:"),
  fullDeviceId: extended.deviceId!,
  uniqueId: extended.uniqueId!,
  info: {
    deviceId: extended.deviceId!,
    interfaceName: extended.interfaceName!,
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

/**
 * Calculates initial transient state based on device parameter values.
 */
export const getTransientState = (config: IDeviceParameterState[]): IDeviceTransientState => {
  const rampRateParam = config[ConfigParam.kRampRate];
  return {
    rampRateEnabled: rampRateParam && rampRateParam.value > 0 || false,
  };
};

/**
 * Creates initial state for HUB device.
 * TODO: It seems in future this method will be changed as soon as support of descriptor will be ready
 */
export const createHubDeviceState = (extended: ExtendedListResponseDto): IDeviceState => createDeviceState(extended);

/**
 * Creates initial state for CAN (non-HUB) device.
 * TODO: It seems in future this method will be changed as soon as support of descriptor will be ready
 */
export const createCanDeviceState = (extended: ExtendedListResponseDto,
                                     hubDeviceId: VirtualDeviceId): IDeviceState => ({
  ...createDeviceState(extended),
  hubDeviceId,
});

/**
 * Is provided device is HUB device
 * TODO: It seems in future this method will be changed as soon as support of descriptor will be ready
 * @param device
 */
export const isHubDevice = (device: IDeviceState) => !device.hubDeviceId;

/**
 * Device ID is passed to the server as string, but used in the application as number.
 * This method is necessary for convenient
 */
export const toDeviceId = (device: string) => Number(device);
/**
 * Device ID is passed to the server as string, but used in the application as number.
 * This method is necessary for convenient
 */
export const fromDeviceId = (deviceId: DeviceId) => String(deviceId);

/**
 * Returns "physical" device ID of the given device
 */
export const getDeviceId = (device: IDeviceState) => device.fullDeviceId;
/**
 * Returns virtual id (client id) of the given device
 */
export const getVirtualDeviceId = (device: IDeviceState) => device.id;
/**
 * Sets virtual ID for the given device
 */
export const setVirtualDeviceId = (device: IDeviceState, id: VirtualDeviceId) => setField(device, "id", id);

/**
 * Returns state of parameters for the given device.
 */
export const getDeviceCurrentParameters = (device: IDeviceState) => device.currentParameters;
/**
 * Returns state of "burned" (actually in-ROM) parameters for the given device.
 */
export const getDeviceBurnedParameters = (device: IDeviceState) => device.burnedParameters;

/**
 * Returns parameter from given state of parameters.
 */
export const getDeviceParam = (parameters: IDeviceParameterState[], param: ConfigParam) => parameters[param];
/**
 * Returns value from parameter state.
 */
export const getDeviceParamValue = (param: IDeviceParameterState) => param.value;
/**
 * Returns whether parameter state has error or do not
 */
export const hasDeviceParamError = (param: IDeviceParameterState) =>
  param.message ? param.message.severity === MessageSeverity.Error : false;
/**
 * Returns actual CAN ID of the given device.
 * Value stored in kCanID field can be invalid by some reason (only on UI).
 * This way to retrieve actual CAN ID (in-RAM) we have to use this method.
 */
export const getDeviceCommittedCanId = (device: IDeviceState) => getCanIdFromDeviceId(device.fullDeviceId);

/**
 * Returns requested component of PID profile.
 */
export const getProfileConfigParam = (profile: number, param: ProfileConfigParam): ConfigParam =>
  ConfigParam.kP_0 + 8 * profile + param;

/**
 * Device is considered invalid iff it has error for CAN ID parameter.
 */
export const isDeviceInvalid = (device: IDeviceState) => {
  const canIdParam = getDeviceParam(getDeviceCurrentParameters(device), ConfigParam.kCanID);
  return canIdParam ? hasDeviceParamError(canIdParam) : false;
};

/**
 * Device is considered not-configured iff it has uniqueId != 0.
 */
export const isDeviceNotConfigured = (device: IDeviceState) => device.uniqueId > 0;

/**
 * Returns the reason for device to be blocked, otherwise `undefined`.
 * @param device
 */
export const getDeviceBlockedReason = (device: IDeviceState) => {
  if (isDeviceInvalid(device)) {
    return DeviceBlockedReason.Invalid;
  }
  if (isDeviceNotConfigured(device)) {
    return DeviceBlockedReason.NotConfigured;
  }
  return;
};

/**
 * Returns whether device is blocked. Device is blocked when it is not configured or invalid.
 */
export const isDeviceBlocked = (device: IDeviceState) => getDeviceBlockedReason(device) != null;

/**
 * Returns CAN ID encoded in device ID.
 */
// tslint:disable-next-line:no-bitwise
export const getCanIdFromDeviceId = (device: DeviceId) => device % 100;

export const getNetworkDeviceId = (device: INetworkDevice) => device.deviceId;

export const createNetworkDevice = (extended: ExtendedListResponseDto): INetworkDevice => {
  let status: NetworkDeviceStatus;

  if (extended.uniqueId) {
    status = NetworkDeviceStatus.NotConfigured;
  } else if (!extended.updateable) {
    status = NetworkDeviceStatus.NotUpdateable
  } else {
    status = NetworkDeviceStatus.Unknown;
  }

  return {
    deviceId: extended.deviceId!,
    uniqueId: extended.uniqueId!,
    deviceName: extended.deviceName!,
    interfaceName: extended.interfaceName!,
    driverName: extended.driverName!,
    firmwareVersion: "",
    status,
    updateable: !!extended.updateable,
    loading: !!extended.updateable,
    selected: status === NetworkDeviceStatus.NotConfigured,
  };
};

export const isNetworkDeviceUpdateable = (device: INetworkDevice) => device.updateable;
export const isNetworkDeviceNeedFirmwareVersion = (device: INetworkDevice) => device.updateable && device.uniqueId === 0;
export const isNetworkDeviceReadyToUpdate = (device: INetworkDevice) =>
  device.status === NetworkDeviceStatus.Updateable;
export const isNetworkDeviceLoading = (device: INetworkDevice) => device.loading;
export const isNetworkDeviceError = (device: INetworkDevice) => device.status === NetworkDeviceStatus.Error;
export const isNetworkDeviceSelectable = (device: INetworkDevice) =>
  !device.loading && device.status === NetworkDeviceStatus.Updateable;
export const isNetworkDeviceSelected = (device: INetworkDevice) => device.selected;
