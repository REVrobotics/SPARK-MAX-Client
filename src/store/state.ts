/**
 * This file describes structure of application state and defines pure functions for working with it.
 */

import {IServerResponse} from "../managers/SparkManager";
import {Intent} from "@blueprintjs/core";
import {find, keyBy, padStart, partition, sortBy, uniqueId} from "lodash";
import {ConfigParam, ConfigParamGroupId, configParamNames, getConfigParamName} from "../models/ConfigParam";
import {
  ConfigParamGroupName,
  CtrlType,
  DisplayConfigDto,
  DisplaySettingsDto,
  ExtendedDfuResponseDto,
  ExtendedListResponseDto,
  TelemetryResponseDto,
} from "../models/dto";
import {diffArrays, setField} from "../utils/object-utils";
import {ReactNode} from "react";
import {IRawDeviceConfigDto} from "../models/device-config.dto";
import {Message, MessageSeverity} from "../models/Message";
import {LegendPosition} from "../display/display-interfaces";

/**
 * Allows to track type of current processing, like saving or resetting
 */
export enum ProcessType {
  Save = "Save",
  Reset = "Reset",
  SetConfiguration = "SetConfiguration"
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
 * PathDescriptor serves as unique ID of specific USB port.
 * If we have SPARK MAX controller connected via USB port,
 * all devices living on its CAN bus will share the same descriptor.
 */
export type PathDescriptor = string;

/**
 * Default descriptor used when server returns no descriptor for device.
 * Default descriptor should never be send to the server:
 * always use `toDtoDescriptor` and `fromDtoDescriptor` to guarantee correct handling of default descriptor.
 *
 * **Note** May be server always returns descriptor. But it does not matter.
 *          Default descriptor is necessary just to follow the same state management flows in the client application.
 */
export const DEFAULT_PATH_DESCRIPTOR: PathDescriptor = "__default__";

/**
 * Device-independent status of application
 */
export interface IContextState {
  /**
   * ID of connected device
   */
  connectedDescriptor?: PathDescriptor,
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
   * Devices in the top dropdown are displayed according to the order in this array.
   */
  orderedDevices: VirtualDeviceId[],
  /**
   * Ordered list of descriptors.
   * It is necessary to sort devices in right order.
   */
  orderedDescriptors: string[],
  /**
   * Dictionary of all devices.
   */
  devices: { [deviceId: string]: IDeviceState },
}

/**
 * State of network tab
 */
export interface INetworkState {
  /**
   * Devices visible on CAN bus
   */
  devices: INetworkDevice[];
  /**
   * DFU devices
   */
  dfuDevices: IDfuDevice[];
  /**
   * Is "all DFU devices" selected
   */
  isSelectAllDfuDevices: boolean;
  /**
   * Text displayed in the console
   */
  outputText: string[];
  /**
   * Is firmware loading currently in progress
   */
  firmwareLoading: boolean;
  /**
   * Progress of current loading process
   */
  firmwareLoadingProgress: number,
  /**
   * Text status of current loading progress
   */
  firmwareLoadingText: string,
  /**
   * Is scanning in progress
   */
  scanInProgress: boolean;
  /**
   * Last message provided by firmware loading process
   */
  lastFirmwareLoadingMessage: string;
}

/**
 * State of firmware downloading
 */
export interface IFirmwareState {
  loading: boolean;
  loadError: boolean;
  config: any;
}

/**
 * Version tags from sparkmax-gui-cfg.json
 */
export enum FirmwareTag {
  RecoveryUpdateRequired = "Recovery Update Required",
  Latest = "Latest",
  Previous = "Previous",
}

/**
 * Firmware entry from sparkmax-gui-cfg.json file
 */
export interface IFirmwareEntry {
  spec: FirmwareTag;
  version: string;
  url: string;
  md5: string;
  sha1: string;
}

/**
 * Device configuration holds values for some devices parameters.
 * This structure is used by persistent configuration and motor types feature.
 */
export interface IDeviceConfiguration {
  id: string;
  name: string;
  parameters: Array<number | undefined>;
  raw: IRawDeviceConfigDto;
  template: boolean;
}

export const DEFAULT_DEVICE_CONFIGURATION_ID = "ram";

/**
 * Default device configuration is never changed and always correspond to the current device settings.
 */
export const DEFAULT_DEVICE_CONFIGURATION: IDeviceConfiguration = {
  id: DEFAULT_DEVICE_CONFIGURATION_ID,
  name: tt("lbl_in_ram"),
  parameters: [],
  raw: undefined as any,
  template: false,
};

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
  configurations: IDeviceConfiguration[],
  display: IDisplayState
}

/**
 * Name of panel available on "Run Tab"
 */
export enum PanelName {
  Run = "run",
  Parameters = "parameters",
  Signals = "signals",
  Settings = "settings",
}

/**
 * Name of quick panel available on "Run" panel of "Run Tab"
 */
export enum QuickPanelName {
  PIDF = "pidf",
  Quick = "quick",
}

/**
 * State of all device displays
 */
export interface IDisplayState {
  selectedPanel: PanelName;
  selectedQuickPanel: QuickPanelName;
  settings: DisplaySettings;
  devices: { [deviceId: string]: IDeviceDisplayState };
  raw?: DisplayConfigDto;
  lastSyncedConsumers: IDestination[];
  lastRunningDeviceIds: DeviceId[];
}

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  showLegend: true,
  legendPosition: LegendPosition.Top,
  singleChart: true,
  timeSpan: 30
};

export const DEFAULT_DEVICE_RUN: IDeviceRunState = {
  value: 0,
  running: false,
};

export type SignalId = number;

/**
 * State of assigned signal
 */
export interface ISignalInstanceState {
  signalId: SignalId;
  virtualDeviceId: VirtualDeviceId;
  autoScaled: boolean;
  min: number;
  max: number;
  style: ISignalStyle;
  scaleId: string;
}

export interface ISignalStyle {
  color: string;
}

export type SignalStylePalette = () => ISignalStyle;

export type ISignalState = TelemetryResponseDto;

export type ITelemetryDataItem = TelemetryResponseDto;

/**
 * Device specific state of display
 */
export interface IDeviceDisplayState {
  selectedSignalId?: SignalId;
  selectedParamGroupId: ConfigParamGroupId;
  assignedSignals: { [id: number]: ISignalInstanceState };
  signals: ISignalState[];
  quickBar: ConfigParam[];
  run: IDeviceRunState;
  pidProfile: number;
}

export interface IDeviceRunState {
  value: number;
  running: boolean;
}

export type DisplaySettings = DisplaySettingsDto;

export interface IDestination {
  virtualDeviceId: VirtualDeviceId;
  deviceId: DeviceId;
  signalId: SignalId;
}

/**
 * Status of device on CAN bus
 */
export enum NetworkDeviceStatus {
  Unknown,
  NotUpdateable,
  NotConfigured,
  RequiresRecoveryMode,
  Updateable,
  Error,
}

/**
 * Represents device on CAN bus
 */
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

export type IDfuDevice = ExtendedDfuResponseDto & {
  selected: boolean;
};

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
  /**
   * Currently selected application tab
   */
  selectedTabId: TabId;
  /**
   * Properties for confirmation dialog.
   */
  alert?: IAlertDialogConfig;
  alertOpened: boolean;
  /**
   * Properties for confirmation dialog.
   */
  confirmation?: IConfirmationDialogConfig;
  confirmationOpened: boolean;
  messageQueue?: IMessageQueueConfig;
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
   * Descriptor shared between devices connected to a single USB port
   */
  descriptor: PathDescriptor;
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
  /**
   * State of the advanced tab for the device
   */
  advanced: IDeviceAdvancedState;
}

/**
 * State of the advanced tab for the device
 */
export interface IDeviceAdvancedState {
  search: string;
}

/**
 * Transient state is necessary to describe UI-specific state of device.
 */
export interface IDeviceTransientState {
  rampRateEnabled: boolean;
  configurationId: string;
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
 * Result of diffing of two device sets
 */
export interface IDeviceDiffResult {
  added: IDeviceState[],
  merged: IDeviceState[],
  removed: IDeviceState[],
}

/**
 * Configuration of confirmation dialog
 */
export interface IAlertDialogConfig {
  intent: Intent;
  text?: string;
  content?: ReactNode;
  okLabel: string;
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
 * State of message queue.
 * Message queue represents long list of messages displayed for user.
 * It is display as soon as it has at least one message
 */
export interface IMessageQueueConfig {
  title: string;
  body: string;
  messages: string[];
}

/**
 * Constraints used by numeric fields
 */
export interface INumericFieldConstraints {
  min?: number;
  max?: number;
  integral?: boolean;
  stepSize?: number;
}

export interface IEnumFieldConstraints {
  values: number[];
}

export type IFieldConstraints = INumericFieldConstraints | IEnumFieldConstraints;

/**
 * Values used in control loop
 */
export enum ProfileConfigParam {
  P, I, D, F
}

export const CONTROL_MODE_CONSTRAINTS = {
  [CtrlType.DutyCycle]: {min: -1, max: 1, stepSize: 0.01, minorStepSize: 0.01},
  [CtrlType.Velocity]: {},
  [CtrlType.Position]: {},
};

export const DEFAULT_TRANSIENT_STATE: IDeviceTransientState = {
  rampRateEnabled: false,
  configurationId: DEFAULT_DEVICE_CONFIGURATION_ID,
};

export enum ConfirmationAnswer {
  Yes = "Yes",
  Cancel = "Cancel"
}

export const getDestinationId = (destination: IDestination) => `${destination.virtualDeviceId}:${destination.signalId}`;

export const DISPLAY_SETTING_CONSTRAINTS: { [name: string]: IFieldConstraints } = {
  timeSpan: {min: 1, max: 1000},
};

/**
 * Creates initial state for device.
 */
export const createDeviceState = (extended: ExtendedListResponseDto): IDeviceState => ({
  id: uniqueId("device:"),
  fullDeviceId: extended.deviceId!,
  uniqueId: extended.uniqueId!,
  descriptor: fromDtoDescriptor(extended.driverDesc),
  info: {
    deviceId: extended.deviceId!,
    interfaceName: extended.interfaceName!,
    deviceName: extended.deviceName!,
    driverName: extended.driverName!,
    updateable: extended.updateable!,
  },
  processStatus: "",
  isProcessing: false,
  isLoaded: false,
  transientParameters: DEFAULT_TRANSIENT_STATE,
  currentParameters: [],
  burnedParameters: [],
  advanced: {
    search: "",
  },
});

/**
 * Resets device state to describe not loaded and not connected device
 */
export const resetDeviceState = (state: IDeviceState) => ({
  ...state,
  uniqueId: 0,
  isLoaded: false,
});

export const createDeviceDisplayState = (): IDeviceDisplayState => ({
  signals: [],
  assignedSignals: {},
  quickBar: [],
  selectedParamGroupId: ConfigParamGroupName.GROUPNAME_Basic,
  run: DEFAULT_DEVICE_RUN,
  pidProfile: 0,
});

export const createSignalInstance = (virtualDeviceId: VirtualDeviceId,
                                     signal: ISignalState,
                                     style: ISignalStyle): ISignalInstanceState => ({
  virtualDeviceId,
  signalId: getSignalId(signal)!,
  scaleId: `${virtualDeviceId}:${getSignalId(signal)}`,
  autoScaled: true,
  min: signal.expectedMin!,
  max: signal.expectedMax!,
  style,
});

/**
 * Calculates initial transient state based on device parameter values.
 */
export const getTransientState = (config: IDeviceParameterState[]): IDeviceTransientState => {
  const rampRateParam = config[ConfigParam.kRampRate];
  return {
    configurationId: DEFAULT_DEVICE_CONFIGURATION_ID,
    rampRateEnabled: rampRateParam && rampRateParam.value > 0 || false,
  };
};

/**
 * Device ID is passed to the server as string, but used in the application as number.
 * This method is necessary for convenience
 */
export const fromDtoDeviceId = (device: string) => Number(device);
/**
 * Device ID is passed to the server as string, but used in the application as number.
 * This method is necessary for convenience
 */
export const toDtoDeviceId = (deviceId: DeviceId) => String(deviceId);

/**
 * Returns "physical" device ID of the given device
 */
export const getDeviceId = (device: IDeviceState) => device.fullDeviceId;
/**
 * Returns group of "physical" device id and descriptor
 */
export const getDeviceSourceId = (device: IDeviceState) => `${device.descriptor}>>>${device.fullDeviceId}`;
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
/**
 * Returns device ID for SPARK MAX controller using its CAN ID
 */
export const getSparkmaxDeviceIdFromCanId = (canId: number) => `205${padStart(String(canId), 2, "0")}`;

/**
 * Analyzes two set of devices and determines which device was added, updated or removed
 */
export const diffDevices = (previous: IDeviceState[], next: IDeviceState[]): IDeviceDiffResult => {
  const [previousZero, previousNotZero] = partition(
    previous,
    (device) => getCanIdFromDeviceId(getDeviceId(device)) === 0);
  const [nextZero, nextNotZero] = partition(
    next,
    (device) => getCanIdFromDeviceId(getDeviceId(device)) === 0);

  // Analyze devices having CAN ID != 0
  const diffNon0 = diffArrays(previousNotZero, nextNotZero, getDeviceSourceId);

  // Analyze devices having CAN ID = 0
  const diff0 = diffArrays(previousZero, nextZero, (device) => device.uniqueId);

  return {
    added: diffNon0.added.concat(diff0.added),
    merged: diffNon0.unmodified
      .concat(diff0.unmodified)
      .concat(diffNon0.modified.map(({previous: p}) => p))
      .concat(diff0.modified.map(({previous: p}) => p)),
    removed: diffNon0.removed.concat(diff0.removed),
  };
};

/**
 * Returns deviceId of device on CAN bus.
 * Returned ID may be not-unique.
 */
export const getNetworkDeviceId = (device: INetworkDevice) => device.deviceId;

/**
 * Returns identifier of DFU device
 */
export const getDfuDeviceId = (dfuDevice: IDfuDevice) => dfuDevice.identifier!;

/**
 * Creates {@link INetworkDevice} based on DTO representation
 */
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
    loading: !!extended.updateable && status !== NetworkDeviceStatus.NotConfigured,
    selected: status === NetworkDeviceStatus.NotConfigured,
  };
};

export const createDfuDevice = (device: ExtendedDfuResponseDto): IDfuDevice => ({
  ...device,
  selected: false,
});

/**
 * Returns whether given device is updateable, or not.
 */
export const isNetworkDeviceUpdateable = (device: INetworkDevice) => device.updateable;
/**
 * Returns whether given device need firmware version to be loaded.
 */
export const isNetworkDeviceNeedFirmwareVersion = (device: INetworkDevice) => device.updateable && device.uniqueId === 0;
/**
 * Returns whether firmware version is being loaded for the given device
 */
export const isNetworkDeviceLoading = (device: INetworkDevice) => device.loading;
/**
 * Returns whether firmware version was failed to load for the given device
 */
export const isNetworkDeviceError = (device: INetworkDevice) => device.status === NetworkDeviceStatus.Error;
/**
 * Returns whether given device can be selected to update
 */
export const isNetworkDeviceSelectable = (device: INetworkDevice) =>
  !device.loading && device.status === NetworkDeviceStatus.Updateable;
/**
 * Returns whether given device is selected to update
 */
export const isNetworkDeviceSelected = (device: INetworkDevice) => device.selected;

/**
 * Returns ID for device configuration
 */
export const getDeviceConfigurationId = (config: IDeviceConfiguration) => config.id;
/**
 * Returns name of device configuration
 */
export const getDeviceConfigurationName = (config: IDeviceConfiguration) => config.name;
/**
 * Returns whether given configuration is a default one.
 */
export const isDefaultDeviceConfiguration = (config: IDeviceConfiguration) =>
  getDeviceConfigurationId(config) === DEFAULT_DEVICE_CONFIGURATION_ID;

/**
 * Returns whether given configuration is a template.
 */
export const isTemplateDeviceConfiguration = (config: IDeviceConfiguration) => config.template;

/**
 * Returns whether configuration names are equal
 */
export const eqDeviceConfigurationName = (a: string, b: string) => a.toLowerCase().trim() === b.toLowerCase().trim();

/**
 * Creates new empty device configuration
 */
export const newDeviceConfiguration = (config: IDeviceConfiguration): IDeviceConfiguration => ({
  ...config,
  id: "",
  raw: {
    ...config.raw,
    fileName: "",
    filePath: "",
  },
});

/**
 * Finds device configuration by name
 */
export const findDeviceConfigurationByName = (configs: IDeviceConfiguration[],
                                              name: string,
                                              excludeId?: string): IDeviceConfiguration | undefined => {
  const found = find(
    configs,
    (configuration) =>
      configuration.id !== DEFAULT_DEVICE_CONFIGURATION_ID && eqDeviceConfigurationName(configuration.name, name));
  return found && found.id !== excludeId ? found : undefined;
};

/**
 * Converts DTO representation to device configuration
 */
export const deviceConfigurationFromDto = (dto: IRawDeviceConfigDto): IDeviceConfiguration => {
  const dtoParamById = keyBy(dto.parameters, (param) => param.id);

  return {
    id: dto.fileName,
    name: dto.name,
    parameters: configParamNames.map((name) => {
      const param = dtoParamById[name];
      return param ? param.value : undefined;
    }),
    template: dto.template,
    raw: dto,
  };
};

/**
 * Converts device configuration to DTO representation.
 * This methods merges current device parameters into DTO and can substitute configuration name.
 */
export const deviceToDeviceConfigurationDto = (basic: IRawDeviceConfigDto,
                                               device: IDeviceState,
                                               newName?: string): IRawDeviceConfigDto => {
  const parameterValues = device.currentParameters.map(getDeviceParamValue);
  const rawParamById = keyBy(basic.parameters, (param) => param.id);

  return {
    ...basic,
    name: newName ? newName : basic.name,
    parameters: parameterValues
      .map((value, param) => {
        const id = getConfigParamName(param);
        const rawParam = rawParamById[id];
        return rawParam ? {...rawParam, value} : {id, value};
      })
      .filter((_, param) => param !== ConfigParam.kCanID),
  };
};

/**
 * Sorts device configurations
 */
export const sortConfigurations = (configurations: IDeviceConfiguration[]) =>
  sortBy(configurations, (config) => {
    if (getDeviceConfigurationId(config) === DEFAULT_DEVICE_CONFIGURATION_ID) {
      return `0:${config.name}`;
    } else if (config.template) {
      return `2:${config.name}`;
    } else {
      return `1:${config.name}`;
    }
  });

export const configurationByGroup = (configuration: IDeviceConfiguration) => {
  if (getDeviceConfigurationId(configuration) === DEFAULT_DEVICE_CONFIGURATION_ID) {
    return "";
  } else if (configuration.template) {
    return "template";
  } else {
    return "user-defined";
  }
};

export const configurationGroupTitle = (group: string) => tt(`lbl_configuration_group:${group}`);

export const isDefaultDescriptor = (descriptor: PathDescriptor) => descriptor === DEFAULT_PATH_DESCRIPTOR;
export const toDtoDescriptor = (descriptor: PathDescriptor) => isDefaultDescriptor(descriptor) ? undefined : descriptor;
export const fromDtoDescriptor = (descriptor?: PathDescriptor) => descriptor ? descriptor : DEFAULT_PATH_DESCRIPTOR;

export const getDisplaySettingConstraints = <S extends keyof DisplaySettings>(name: S) =>
  DISPLAY_SETTING_CONSTRAINTS[name];

export const getSignalId = (signal: ISignalState) => signal.id!;
