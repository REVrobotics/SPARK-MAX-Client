/**
 * This file defines pure functions which retrieves something from application state.
 * By convention all these functions should be named starting from "query" prefix.
 */

import {filter, find, first} from "lodash";
import {
  DEFAULT_TRANSIENT_STATE,
  DeviceId, FirmwareTag,
  getDeviceBlockedReason,
  getDeviceCommittedCanId,
  getDeviceId,
  getDeviceParam,
  getDeviceParamValue, getNetworkDeviceId,
  getVirtualDeviceId,
  hasDeviceParamError,
  IApplicationState, IFirmwareEntry,
  isDeviceBlocked,
  isDeviceInvalid,
  isDeviceNotConfigured,
  isHubDevice,
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
 * Returns HUB device ID for given device ID.
 * For HUB device this method returns its ID.
 * For CAN device this method returns ID of master HUB device.
 *
 * TODO: it seems this function will be changed as soon as descriptor support will be ready
 */
export const queryHubVirtualDeviceId = (state: IApplicationState, id: VirtualDeviceId) => {
  const device = queryDevice(state, id);
  if (isHubDevice(device)) {
    return device.id;
  } else {
    return device.hubDeviceId!;
  }
};

/**
 * Returns whether given device is connected or not.
 * HUB device is connected iff isConnected = true
 * CAN device is connected iff its HUB device is connected.
 *
 * TODO: it seems this function will be changed as soon as descriptor support will be ready
 */
export const queryIsDeviceConnected = (state: IApplicationState, id: VirtualDeviceId) => {
  const device = queryDevice(state, id);
  if (isHubDevice(device)) {
    return device.id === state.context.connectedVirtualDeviceId;
  } else {
    const usbDevice = queryDevice(state, device.hubDeviceId!);
    return usbDevice.id === state.context.connectedVirtualDeviceId;
  }
};

/**
 * Returns whether any device is connected
 */
export const queryIsHasConnectedDevice = (state: IApplicationState) => queryConnectedVirtualDeviceId(state) != null;

/**
 * Returns id of connected device
 */
export const queryConnectedVirtualDeviceId = (state: IApplicationState) => state.context.connectedVirtualDeviceId;

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
export const queryFirmwareByTag = (state: IApplicationState, tag: FirmwareTag): IFirmwareEntry|undefined => {
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
