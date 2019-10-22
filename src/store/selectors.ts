/**
 * This file defines pure functions which retrieves something from application state.
 * By convention all these functions should be named starting from "query" prefix.
 */

import {filter, find, first} from "lodash";
import {
  DEFAULT_DEVICE_CONFIGURATION_ID,
  DEFAULT_TRANSIENT_STATE,
  DeviceId, FirmwareTag,
  getDeviceBlockedReason,
  getDeviceCommittedCanId,
  getDeviceId,
  getDeviceParam,
  getDeviceParamValue, getNetworkDeviceId, getSignalId,
  getVirtualDeviceId,
  hasDeviceParamError,
  IApplicationState, IFirmwareEntry,
  isDeviceBlocked,
  isDeviceInvalid,
  isDeviceNotConfigured, ISignalStyle, PathDescriptor,
  ProcessType, SignalId,
  VirtualDeviceId
} from "./state";
import {maybeMap} from "../utils/object-utils";
import {ConfigParam} from "../models/ConfigParam";

export const querySelectedTabId = (state: IApplicationState) => state.ui.selectedTabId;

/**
 * Returns ID of the first USB device
 */
export const queryFirstVirtualDeviceId = ({deviceSet: {orderedDevices, devices}}: IApplicationState) =>
  maybeMap(first(orderedDevices.map((id) => devices[id])), getVirtualDeviceId);

/**
 * Returns all devices having given descriptor
 */
export const queryDevicesByDescriptor = ({deviceSet: {devices}}: IApplicationState, descriptor: PathDescriptor) =>
  filter(devices, (device) => device.descriptor === descriptor);

/**
 * Returns true if at least one device exists, otherwise false
 */
export const queryIsConnectableToAnyDevice = (state: IApplicationState) => state.deviceSet.orderedDevices.length > 0;

/**
 * Returns ID of selected device
 */
export const querySelectedVirtualDeviceId = ({context: {selectedVirtualDeviceId}}: IApplicationState) =>
  selectedVirtualDeviceId;

/**
 * Returns ID of selected device
 */
export const querySelectedDeviceId = (state: IApplicationState) => {
  const device = querySelectedDevice(state);
  return device ? getDeviceId(device) : undefined;
};

/**
 * Returns selected device
 */
export const querySelectedDevice = (state: IApplicationState) => {
  const id = querySelectedVirtualDeviceId(state);
  return id ? state.deviceSet.devices[id] : undefined;
};

/**
 * Returns device by its "physical" device ID
 */
export const queryDeviceByDeviceId = (state: IApplicationState, id: DeviceId) =>
  find(state.deviceSet.devices, (device) => getDeviceId(device) === id);

/**
 * Returns device by ID
 */
export const queryDevice = (state: IApplicationState, id: VirtualDeviceId) => state.deviceSet.devices[id];

/**
 * Returns all connected devices (through USB and CAN bus)
 */
export const queryConnectedDevices = (state: IApplicationState) =>
  filter(state.deviceSet.devices, (device) => queryIsDeviceConnected(state, getVirtualDeviceId(device)));

/**
 * Returns all devices having given Can ID
 */
export const queryConnectedDevicesByCanId = (state: IApplicationState, canId: number) =>
  queryConnectedDevices(state).filter((device) => getDeviceCommittedCanId(device) === canId);

/**
 * Returns full Device ID for provided device
 */
export const queryDeviceId = (state: IApplicationState, id: VirtualDeviceId) => {
  const device = queryDevice(state, id);
  return device ? getDeviceId(device) : undefined;
};

/**
 * Returns devices by predefined order
 */
export const queryDevicesInOrder = ({deviceSet: {orderedDevices, devices}}: IApplicationState) =>
  orderedDevices.map((id) => devices[id]);

/**
 * Returns {@link PathDescriptor} for given device ID.
 */
export const queryPathDescriptor = (state: IApplicationState, id: VirtualDeviceId) => {
  const device = queryDevice(state, id);
  return device ? device.descriptor : undefined;
};

/**
 * Returns whether given device is connected or not.
 */
export const queryIsDeviceConnected = (state: IApplicationState, id: VirtualDeviceId) => {
  const device = queryDevice(state, id);
  const connectedDescriptor = queryConnectedDescriptor(state);
  return device ? device.descriptor === connectedDescriptor : false;
};

/**
 * Returns whether any device is connected
 */
export const queryIsHasConnectedDevice = (state: IApplicationState) => queryConnectedDescriptor(state) != null;

/**
 * Returns id of connected device
 */
export const queryConnectedDescriptor = (state: IApplicationState) => state.context.connectedDescriptor;

/**
 * Returns whether selected device is in the connected state
 */
export const queryIsSelectedDeviceConnected = (state: IApplicationState) => {
  const selectedId = querySelectedVirtualDeviceId(state);
  if (selectedId == null) {
    return false;
  }

  return queryIsDeviceConnected(state, selectedId);
};

/**
 * Returns current state of parameters for selected device
 */
export const querySelectedDeviceCurrentConfig = (state: IApplicationState) => {
  const selectedDevice = querySelectedDevice(state);
  if (selectedDevice == null) {
    return;
  }
  return selectedDevice.currentParameters;
};

/**
 * Returns burned parameters
 */
export const querySelectedDeviceBurnedConfig = (state: IApplicationState) => {
  const selectedDevice = querySelectedDevice(state);
  if (selectedDevice == null) {
    return;
  }
  return selectedDevice.burnedParameters;
};

/**
 * Returns whether parameter has invalid value or does not
 */
export const queryHasDeviceParameterError = (state: IApplicationState,
                                             virtualDeviceId: VirtualDeviceId,
                                             param: ConfigParam) =>
  hasDeviceParamError(getDeviceParam(queryDevice(state, virtualDeviceId).currentParameters, param));

/**
 * Returns value of parameter for the given device
 */
export const queryDeviceParameterValue = (state: IApplicationState,
                                          virtualDeviceId: VirtualDeviceId,
                                          param: ConfigParam) =>
  getDeviceParamValue(getDeviceParam(queryDevice(state, virtualDeviceId).currentParameters, param));

/**
 * Returns whether processing status should be shown.
 */
export const queryIsInProcessing = (state: IApplicationState) => {
  // Do we have global processing? (for example, searching of devices)
  if (state.context.isProcessing) {
    return true;
  }

  return queryIsSelectedDeviceInProcessing(state);
};

/**
 * Returns if device configuration is invalid. Device is invalid iff it has error for CAN ID parameter.
 */
export const queryIsSelectedDeviceInvalid = (state: IApplicationState) => {
  const selectedDevice = querySelectedDevice(state);
  return selectedDevice == null ? false : isDeviceInvalid(selectedDevice);
};

/**
 * Returns true if device is not configured, otherwise false
 */
export const queryIsSelectedDeviceNotConfigured = (state: IApplicationState) => {
  const selectedDevice = querySelectedDevice(state);
  return selectedDevice == null ? false : isDeviceNotConfigured(selectedDevice);
};

/**
 * Returns if device is blocked.
 * @param state
 */
export const queryIsSelectedDeviceBlocked = (state: IApplicationState) => {
  const selectedDevice = querySelectedDevice(state);
  return selectedDevice == null ? false : isDeviceBlocked(selectedDevice);
};

/**
 * Returns if selected device requires user attention
 * @param state
 */
export const querySelectedDeviceBlockedReason = (state: IApplicationState) => {
  const selectedDevice = querySelectedDevice(state);
  return selectedDevice == null ? false : getDeviceBlockedReason(selectedDevice);
};

/**
 * Returns if some of devices requires user attention
 * @param state
 */
export const queryHasGlobalError = (state: IApplicationState) => {
  const devices = queryConnectedDevices(state);
  return devices.some((device) => getDeviceBlockedReason(device) != null);
};

/**
 * Returns true if we have processing for selected device, otherwise false
 */
export const queryIsSelectedDeviceInProcessing = (state: IApplicationState) => {
  const selectedDevice = querySelectedDevice(state);
  return selectedDevice == null ? false : selectedDevice.isProcessing;
};

/**
 * Returns true if parameters were loaded for selected device, otherwise false
 */
export const queryIsSelectedDeviceLoaded = (state: IApplicationState) => {
  const selectedDevice = querySelectedDevice(state);
  return selectedDevice == null ? false : selectedDevice.isLoaded;
};

/**
 * Returns type of processing for selected device, otherwise `undefined`
 * @param state
 */
export const querySelectedDeviceProcessType = (state: IApplicationState) => {
  const selectedDevice = querySelectedDevice(state);
  return selectedDevice == null ? undefined : selectedDevice.processType;
};

/**
 * Returns transient state for selected device
 */
export const querySelectedDeviceTransientParameters = (state: IApplicationState) => {
  const selectedDevice = querySelectedDevice(state);
  return selectedDevice == null ? DEFAULT_TRANSIENT_STATE : selectedDevice.transientParameters;
};

/**
 * Returns human-readable text of processing status
 */
export const queryProcessStatus = (state: IApplicationState) => {
  // Show processStatus if we have global processing. (for example, searching of devices)
  if (state.context.processStatus) {
    return state.context.processStatus;
  }

  // Show processStatus if we have processing for selected device
  const selectedDevice = querySelectedDevice(state);
  return selectedDevice == null ? "" : selectedDevice.processStatus;
};

/**
 * Returns state of network tab
 */
export const queryNetwork = (state: IApplicationState) => state.network;
/**
 * Returns all devices on CAN bus
 */
export const queryNetworkDevices = (state: IApplicationState) => state.network.devices;
/**
 * Returns specific device on CAN bus
 */
export const queryNetworkDevice = (state: IApplicationState, id: DeviceId) =>
  find(state.network.devices, (device) => getNetworkDeviceId(device) === id);
/**
 * Returns ALL console output. Displayed on network tab
 */
export const queryConsoleOutput = (state: IApplicationState) => state.network.outputText;
/**
 * Returns last message provided by firmware load process
 */
export const queryLastFirmwareLoadingMessage = (state: IApplicationState) => state.network.lastFirmwareLoadingMessage;
/**
 * Returns if the latest firmware was already downloaded
 */
export const queryIsFirmwareDownloaded = (state: IApplicationState) => queryFirmwareConfig(state) != null;
/**
 * Returns if the latest firmware is in process of downloading
 */
export const queryIsFirmwareDownloading = (state: IApplicationState) => state.firmware.loading;
/**
 * Returns if some error has happened while downloading.
 */
export const queryFirmwareDownloadError = (state: IApplicationState) => state.firmware.loadError;
/**
 * Returns state of firmware loading
 */
export const queryFirmwareConfig = (state: IApplicationState) => state.firmware.config;
/**
 * Returns the latest version of firmware.
 */
export const queryLatestFirmwareVersion = (state: IApplicationState) => {
  const firmware = queryFirmwareByTag(state, FirmwareTag.Latest);
  return firmware ? firmware.version : undefined;
};
/**
 * Returns requested firmware by the provided tag (Latest, RecoveryUpdateRequired, etc)
 */
export const queryFirmwareByTag = (state: IApplicationState, tag: FirmwareTag): IFirmwareEntry | undefined => {
  const config = queryFirmwareConfig(state);

  if (config == null || config.firmware == null) {
    return;
  }

  for (const firmware of config.firmware) {
    if (firmware.spec === tag) {
      return firmware;
    }
  }

  return;
};

/**
 * Returns if firmware is updated currently.
 */
export const queryIsFirmwareLoading = (state: IApplicationState) => state.firmware.loading;

/**
 * Returns ID of currently selected configuration
 */
export const querySelectedConfigurationId = (state: IApplicationState) =>
  querySelectedDeviceTransientParameters(state).configurationId;

/**
 * Returns currently selected configuration
 */
export const querySelectedConfiguration = (state: IApplicationState) => {
  const id = querySelectedConfigurationId(state);
  return queryConfiguration(state, id);
};

/**
 * Returns configuration by ID
 */
export const queryConfiguration = (state: IApplicationState, id: string) => find(queryConfigurations(state), {id});
/**
 * Returns all configurations
 */
export const queryConfigurations = (state: IApplicationState) => state.configurations;
/**
 * Returns if current device settings do no correspond to the selected configuration
 */
export const queryIsSelectedConfigurationDirty = (state: IApplicationState) => {
  const configurationId = querySelectedConfigurationId(state);
  // Dirty flag makes sense only for device with loaded parameters and non-default configuration
  if (configurationId === DEFAULT_DEVICE_CONFIGURATION_ID || !queryIsSelectedDeviceLoaded(state)) {
    return false;
  } else {
    const device = querySelectedDevice(state)!;
    // Do not check parameters while we are in process of setting
    if (device.processType === ProcessType.SetConfiguration) {
      return false;
    }
    const deviceParameters = device.currentParameters;
    const configuration = queryConfiguration(state, configurationId)!;
    return configuration.parameters.some((value, param) =>
      value != null && getDeviceParamValue(getDeviceParam(deviceParameters, param)) !== value);
  }
};

/**
 * Returns state of message queue
 */
export const queryMessageQueueConfig = (state: IApplicationState) => state.ui.messageQueue;

/**
 * Returns whether message queue should be opened now.
 * Message queue should be opened iff it has at least one message.
 */
export const queryIsMessageQueueOpened = (state: IApplicationState) => {
  const {messageQueue} = state.ui;
  return messageQueue ? messageQueue.messages.length > 0 : false;
};

export const queryDisplaySelectedPanel = (state: IApplicationState) => state.display.selectedPanel;
export const queryDisplaySettings = (state: IApplicationState) => state.display.settings;

export const querySelectedDeviceDisplay = (state: IApplicationState) => {
  const selectedDeviceId = querySelectedVirtualDeviceId(state);
  return selectedDeviceId == null ? undefined : state.display.devices[selectedDeviceId];
};

export const querySignals = (state: IApplicationState) => {
  const deviceDisplay = querySelectedDeviceDisplay(state);
  if (deviceDisplay == null) {
    return;
  }
  return deviceDisplay.signals;
};

export const queryAssignedSignals = (state: IApplicationState) => {
  const deviceDisplay = querySelectedDeviceDisplay(state);
  if (deviceDisplay == null) {
    return;
  }
  return deviceDisplay.assignedSignals;
};

export const querySelectedSignalId = (state: IApplicationState) => {
  const deviceDisplay = querySelectedDeviceDisplay(state);
  if (deviceDisplay == null) {
    return;
  }
  return deviceDisplay.selectedSignalId;
};

export const querySignal = (state: IApplicationState, signalId: SignalId) => {
  const deviceDisplay = querySelectedDeviceDisplay(state);
  if (deviceDisplay == null) {
    return;
  }
  return deviceDisplay.signals.find((signal) => getSignalId(signal) === signalId);
};

export const querySignalNewStyle = (state: IApplicationState,
                                    virtualDeviceId: VirtualDeviceId,
                                    signalId: SignalId): ISignalStyle => {
  return {
    color: "red",
  };
};

export const querySelectedSignal = (state: IApplicationState) => {
  const deviceDisplay = querySelectedDeviceDisplay(state);
  if (deviceDisplay == null || deviceDisplay.selectedSignalId == null) {
    return;
  }
  return querySignal(state, deviceDisplay.selectedSignalId);
};
