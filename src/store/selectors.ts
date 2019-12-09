/**
 * This file defines pure functions which retrieves something from application state.
 * By convention all these functions should be named starting from "query" prefix.
 */

import {countBy, filter, find, first, flatMap, isEmpty, keys, toPairs, values} from "lodash";
import {
  DEFAULT_DEVICE_CONFIGURATION_ID,
  DEFAULT_TRANSIENT_STATE,
  DeviceId,
  FirmwareTag,
  getDeviceBlockedReason,
  getDeviceCommittedCanId,
  getDeviceId,
  getDeviceParam,
  getDeviceParamValue, getDfuDeviceId,
  getNetworkDeviceVirtualId,
  getSignalId,
  getVirtualDeviceId,
  hasDeviceParamError,
  IApplicationState,
  IDestination,
  IDeviceDisplayState,
  IFirmwareEntry,
  isDeviceBlocked,
  isDeviceInvalid,
  isDeviceNotConfigured,
  ISignalInstanceState,
  ISignalState,
  ISignalStyle, isNetworkDeviceSelectable, isNetworkDeviceSelected,
  PathDescriptor,
  ProcessType,
  SignalId,
  toDtoDeviceId,
  VirtualDeviceId
} from "./state";
import {maybeMap} from "../utils/object-utils";
import {ConfigParam, getConfigParamsInGroup} from "../models/ConfigParam";
import {colors, colorToIndex} from "./colors";
import {ConfigParamGroupName, DFU_DEVICE_ALL, ISignalDestinationDto} from "../models/dto";
import {getDeviceParamOrDefault, getDeviceParamValueOrDefault} from "./param-rules/config-param-helpers";

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
 * Returns all devices having given descriptor
 */
export const queryDevicesByDeviceId = ({deviceSet: {devices}}: IApplicationState, deviceId: DeviceId) =>
  filter(devices, (device) => getDeviceId(device) === deviceId);

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
 * Returns index of descriptor
 */
export const queryDescriptorIndex = (state: IApplicationState, descriptor: PathDescriptor) =>
  state.deviceSet.orderedDescriptors.indexOf(descriptor) + 1;

/**
 * Returns order of descriptors
 */
export const queryDescriptorsInOrder = (state: IApplicationState) => state.deviceSet.orderedDescriptors;

/**
 * Returns whether any device is connected
 */
export const queryIsHasConnectedDevice = (state: IApplicationState) => {
  const descriptor = queryConnectedDescriptor(state);
  return descriptor != null ? queryHasDescriptor(state, descriptor) : false;
};

/**
 * Returns true if descriptor is known, otherwise false.
 */
export const queryHasDescriptor = (state: IApplicationState, descriptor: PathDescriptor) =>
  state.deviceSet.orderedDescriptors.indexOf(descriptor) >= 0;

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
 * Is given parameter is dirty for the selected device
 */
export const queryIsDeviceParameterDirty = (state: IApplicationState,
                                            virtualDeviceId: VirtualDeviceId,
                                            parameter: ConfigParam) => {
  const value = getDeviceParamValueOrDefault(queryDevice(state, virtualDeviceId).currentParameters, parameter);

  const burnedParameters = querySelectedDeviceBurnedConfig(state);
  return burnedParameters && burnedParameters[parameter] != null ? burnedParameters[parameter] !== value : false;
};

/**
 * Returns whether parameter has invalid value or does not
 */
export const queryHasDeviceParameterError = (state: IApplicationState,
                                             virtualDeviceId: VirtualDeviceId,
                                             param: ConfigParam) =>
  hasDeviceParamError(getDeviceParamOrDefault(queryDevice(state, virtualDeviceId).currentParameters, param));

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
 * Returns true if device can be used right now
 */
export const queryIsSelectedDeviceEnabled = (state: IApplicationState) => {
  return queryIsSelectedDeviceConnected(state)
    && !queryIsSelectedDeviceInProcessing(state)
    && queryIsSelectedDeviceLoaded(state)
    && !queryIsFirmwareLoading(state);
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
 * Returns all devices in DFU mode
 */
export const queryNetworkDfuDevices = (state: IApplicationState) => state.network.dfuDevices;
/**
 * Returns DFU devices to update: either all or only one device can be selected.
 */
export const queryDfuDevicesToUpdate = (state: IApplicationState) => {
  const {dfuDevices, isSelectAllDfuDevices} = state.network;
  return isSelectAllDfuDevices ?
    [DFU_DEVICE_ALL]
    : dfuDevices.filter((dfuDevice) => dfuDevice.selected).map(getDfuDeviceId);
};
/**
 * Returns specific device on CAN bus
 */
export const queryNetworkDevice = (state: IApplicationState, id: string) =>
  find(state.network.devices, (device) => getNetworkDeviceVirtualId(device) === id);

/**
 * Returns if some DFU device is selected
 */
export const queryHasSelectedDfuDevice = (state: IApplicationState) =>
  state.network.dfuDevices.some((device) => device.selected);

/**
 * Returns all selectable network devices
 */
export const querySelectableNetworkDevices = (state: IApplicationState) =>
  queryNetworkDevices(state).filter(isNetworkDeviceSelectable);

/**
 * Returns true if some device is selected
 */
export const queryHasSelectedNetworkDevices = (state: IApplicationState) =>
  querySelectableNetworkDevices(state).some(isNetworkDeviceSelected);

/**
 * Returns true if there is at least one selectable device
 */
export const queryHasSelectableDevices = (state: IApplicationState) => querySelectableNetworkDevices(state).length > 0;

/**
 * Returns true if all devices are selected
 */
export const queryIsAllNetworkDevicesSelected = (state: IApplicationState) => {
  const selectableDevices = querySelectableNetworkDevices(state);
  return selectableDevices.length > 0 && selectableDevices.every(isNetworkDeviceSelected);
};

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
export const queryIsFirmwareLoading = (state: IApplicationState) => state.network.firmwareLoading;

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

/**
 * Returns ID of selected panel
 */
export const queryDisplaySelectedPanel = (state: IApplicationState) => state.display.selectedPanel;
/**
 * Returns shared chart settings
 */
export const queryDisplaySettings = (state: IApplicationState) => state.display.settings;

/**
 * Returns display settings for selected device
 */
export const querySelectedDeviceDisplay = (state: IApplicationState) => {
  const selectedDeviceId = querySelectedVirtualDeviceId(state);
  return selectedDeviceId == null ? undefined : queryDeviceDisplay(state, selectedDeviceId);
};

/**
 * Returns display settings for requested device
 */
export const queryDeviceDisplay = (state: IApplicationState, virtualDeviceId: VirtualDeviceId) =>
  state.display.devices[virtualDeviceId];

/**
 * Returns whether given device is running
 */
export const queryIsDeviceRunning = (state: IApplicationState, virtualDeviceId: VirtualDeviceId) =>
  queryDeviceDisplay(state, virtualDeviceId).run.running;

/**
 * Returns whether signal exists for selected device
 */
export const queryHasSignalForSelectedDevice = (state: IApplicationState) => {
  const display = querySelectedDeviceDisplay(state);
  return display ? display.signals.length > 0 : false;
};

/**
 * Returns set of available signals for selected device
 */
export const querySelectedDeviceSignals = (state: IApplicationState) => {
  const deviceDisplay = querySelectedDeviceDisplay(state);
  if (deviceDisplay == null) {
    return;
  }
  return deviceDisplay.signals;
};

/**
 * Returns set of assigned signals for selected device
 */
export const querySelectedDeviceAssignedSignals = (state: IApplicationState) => {
  const deviceDisplay = querySelectedDeviceDisplay(state);
  if (deviceDisplay == null) {
    return;
  }
  return deviceDisplay.assignedSignals;
};

/**
 * Returns ID of selected signal for selected device
 */
export const querySelectedSignalIdForSelectedDevice = (state: IApplicationState) => {
  const deviceDisplay = querySelectedDeviceDisplay(state);
  if (deviceDisplay == null) {
    return;
  }
  return deviceDisplay.selectedSignalId;
};

/**
 * Returns requested signal for selected device
 */
export const querySelectedDeviceSignal = (state: IApplicationState, signalId: SignalId) => {
  const deviceDisplay = querySelectedDeviceDisplay(state);
  if (deviceDisplay == null) {
    return;
  }
  return deviceDisplay.signals.find((signal) => getSignalId(signal) === signalId);
};

/**
 * Returns run configuration for selected device
 */
export const querySelectedDeviceRun = (state: IApplicationState) => {
  const deviceDisplay = querySelectedDeviceDisplay(state);
  if (deviceDisplay == null) {
    return;
  }
  return deviceDisplay.run;
};

/**
 * Returns IDs of devices matching given predicate
 */
export const queryVirtualDeviceIdsByDisplayPredicate = (state: IApplicationState,
                                                        displayFn: (display: IDeviceDisplayState) => boolean): VirtualDeviceId[] => {
  return toPairs(state.display.devices)
    .filter(([virtualDeviceId, deviceDisplay]) => displayFn(deviceDisplay))
    .map(([virtualDeviceId]) => virtualDeviceId);
};

/**
 * Returns IDs of running devices
 */
export const queryRunningVirtualDeviceIds = (state: IApplicationState) =>
  queryVirtualDeviceIdsByDisplayPredicate(state, (display) => display.run.running);

/**
 * Returns whether there is any running device or not
 */
export const queryHasRunningDevices = (state: IApplicationState) => queryRunningVirtualDeviceIds(state).length > 0;

/**
 * Returns whether there is at least one assigned signal for selected device
 */
export const queryHasAssignedSignalsForSelectedDevice = (state: IApplicationState) => {
  const display = querySelectedDeviceDisplay(state);
  return display ? !isEmpty(display.assignedSignals) : false;
};

/**
 * Returns unique chart style
 */
export const querySignalNewStyle = (state: IApplicationState): ISignalStyle => querySignalStylePalette(state)();

/**
 * Returns palette to enumerate all unused styles
 */
export const querySignalStylePalette = (state: IApplicationState) => {
  const colorToCount = countBy(querySignalsWithInstances(state).map(([_, instance]) => instance.style.color));
  const copiedColors = colors.slice();
  copiedColors.sort((a, b) => {
    const diffUsage = (colorToCount[a] || 0) - (colorToCount[b] || 0);
    return diffUsage ? diffUsage : colorToIndex[a] - colorToIndex[b];
  });
  let lastColorIndex = 0;
  return () => ({color: copiedColors[lastColorIndex === copiedColors.length ? 0 : lastColorIndex++]});
};

/**
 * Returns information about all assigned signals
 */
export const querySignalsWithInstances = (state: IApplicationState): Array<[ISignalState, ISignalInstanceState]> => {
  return flatMap(
    values(state.display.devices),
    ({assignedSignals, signals}) => values(assignedSignals).map((instance) => [
      signals.find((signal) => getSignalId(signal) === instance.signalId)!,
      instance,
    ]));
};

export const queryDisplay = (state: IApplicationState) => state.display;

/**
 * Returns all destinations
 */
export const queryDestinations = (state: IApplicationState): IDestination[] =>
  flatMap(
    keys(state.display.devices),
    (virtualDeviceId) => keys(state.display.devices[virtualDeviceId].assignedSignals).map(Number).map((signalId) => ({
      virtualDeviceId,
      deviceId: queryDeviceId(state, virtualDeviceId)!,
      signalId,
    })));

export const querySignalDestinations = (state: IApplicationState): ISignalDestinationDto[] =>
  flatMap(
    keys(state.display.devices),
    (virtualDeviceId) => keys(state.display.devices[virtualDeviceId].assignedSignals).map(Number).map((signalId) => ({
      deviceId: toDtoDeviceId(queryDeviceId(state, virtualDeviceId)!),
      signalId,
    })));

export const queryLastSyncedConsumers = (state: IApplicationState): IDestination[] => state.display.lastSyncedConsumers;

export const queryLastRunningDeviceIds = (state: IApplicationState): DeviceId[] => state.display.lastRunningDeviceIds;

/**
 * Returns control value by device ID
 */
export const queryRunStateByDeviceId = (state: IApplicationState,
                                        descriptor: PathDescriptor,
                                        deviceId: DeviceId) => {
  const device = find(queryDevicesByDeviceId(state, deviceId), (found) => found.descriptor === descriptor);
  return device ? queryDeviceDisplay(state, getVirtualDeviceId(device)).run : undefined;
};

/**
 * Returns control value by virtual device ID and mode
 */
export const queryControlValue = (state: IApplicationState, virtualDeviceId: VirtualDeviceId) => {
  const device = queryDeviceDisplay(state, virtualDeviceId);
  return device ? device.run.value : 0;
};

export const querySelectedDeviceSearchString = (state: IApplicationState) => {
  const device = querySelectedDevice(state);
  return device ? device.advanced.search : "";
};

/**
 * Returns `true` if dirty parameter exists in the given group, otherwise `false`
 */
export const queryHasDeviceDirtyParameterInGroup = (state: IApplicationState,
                                                    virtualDeviceId: VirtualDeviceId,
                                                    group: ConfigParamGroupName) => {
  const params = getConfigParamsInGroup(group);
  return params.some((param) => queryIsDeviceParameterDirty(state, virtualDeviceId, param));
};

/**
 * Returns `true` if invalid parameter exists in the given group, otherwise `false`
 */
export const queryHasDeviceParameterErrorInGroup = (state: IApplicationState,
                                                    virtualDeviceId: VirtualDeviceId,
                                                    group: ConfigParamGroupName) => {
  const params = getConfigParamsInGroup(group);
  return params.some((param) => queryHasDeviceParameterError(state, virtualDeviceId, param));
};
