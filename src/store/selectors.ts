import {find} from "lodash";
import {
  DEFAULT_TRANSIENT_STATE,
  getDeviceId, getDeviceParam, getDeviceParamValue,
  getVirtualDeviceId,
  IApplicationState,
  isHubDevice,
  VirtualDeviceId
} from "./state";
import {maybeMap} from "../utils/object-utils";
import {ConfigParam} from "../models/ConfigParam";

/**
 * Returns first USB device
 *
 * @param orderedDevices
 * @param devices
 */
export const getFirstHubVirtualDeviceId = ({deviceSet: {orderedDevices, devices}}: IApplicationState) =>
  maybeMap(find(orderedDevices.map((id) => devices[id]), isHubDevice), getVirtualDeviceId);

/**
 * Returns true if at least one device exist, otherwise false
 *
 * @param state
 */
export const isConnectableToAnyDevice = (state: IApplicationState) => state.deviceSet.orderedDevices.length > 0;

/**
 * Returns ID of selected device
 *
 * @param selectedDeviceId
 */
export const getSelectedVirtualDeviceId = ({context: {selectedVirtualDeviceId}}: IApplicationState) =>
  selectedVirtualDeviceId;

/**
 * Returns ID of selected device
 *
 * @param state
 */
export const getSelectedDeviceId = (state: IApplicationState) => {
  const device = getSelectedDevice(state);
  return device ? getDeviceId(device) : undefined;
};

/**
 * Returns selected device
 *
 * @param state
 */
export const getSelectedDevice = (state: IApplicationState) => {
  const id = getSelectedVirtualDeviceId(state);
  return id ? state.deviceSet.devices[id] : undefined;
};

/**
 * Returns device by ID
 *
 * @param state
 * @param id
 */
export const getDevice = (state: IApplicationState, id: VirtualDeviceId) => state.deviceSet.devices[id];

/**
 * Returns full Device ID for request device
 *
 * @param state
 * @param id
 */
export const selectDeviceId = (state: IApplicationState, id: VirtualDeviceId) => {
  const device = getDevice(state, id);
  return device ? getDeviceId(device) : undefined;
};

/**
 * Get device by predefined order
 *
 * @param orderedDevices
 * @param devices
 */
export const getDevicesInOrder = ({deviceSet: {orderedDevices, devices}}: IApplicationState) =>
  orderedDevices.map((id) => devices[id]);

/**
 * Returns HUB device ID for given device ID.
 * For HUB device this method returns its ID.
 * For CAN device this method returns ID of master HUB device.
 *
 * @param state
 * @param id
 */
export const getHubVirtualDeviceId = (state: IApplicationState, id: VirtualDeviceId) => {
  const device = getDevice(state, id);
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
 * @param state
 * @param id
 */
export const isDeviceConnected = (state: IApplicationState, id: VirtualDeviceId) => {
  const device = getDevice(state, id);
  if (isHubDevice(device)) {
    return device.id === state.context.connectedVirtualDeviceId;
  } else {
    const usbDevice = getDevice(state, device.hubDeviceId!);
    return usbDevice.id === state.context.connectedVirtualDeviceId;
  }
};

/**
 * Returns whether any device is connected
 * @param state
 */
export const isHasConnectedDevice = (state: IApplicationState) => getConnectedVirtualDeviceId(state) != null;

/**
 * Returns id of connected device
 * @param state
 */
export const getConnectedVirtualDeviceId = (state: IApplicationState) => state.context.connectedVirtualDeviceId;

/**
 * Returns whether selected device is in the connected state
 * @param state
 */
export const isSelectedDeviceConnected = (state: IApplicationState) => {
  const selectedId = getSelectedVirtualDeviceId(state);
  if (selectedId == null) {
    return false;
  }

  return isDeviceConnected(state, selectedId);
};

/**
 * Returns current state of parameters for selected device
 * @param state
 */
export const getSelectedDeviceCurrentConfig = (state: IApplicationState) => {
  const selectedDevice = getSelectedDevice(state);
  if (selectedDevice == null) {
    return;
  }
  return selectedDevice.currentParameters;
};

/**
 * Returns burned parameters
 *
 * @param state
 */
export const getSelectedDeviceBurnedConfig = (state: IApplicationState) => {
  const selectedDevice = getSelectedDevice(state);
  if (selectedDevice == null) {
    return;
  }
  return selectedDevice.burnedParameters;
};

/**
 * Returns value of parameter for the given device
 *
 * @param state
 * @param virtualDeviceId
 * @param param
 */
export const selectDeviceParameterValue = (state: IApplicationState,
                                           virtualDeviceId: VirtualDeviceId,
                                           param: ConfigParam) =>
  getDeviceParamValue(getDeviceParam(getDevice(state, virtualDeviceId).currentParameters, param));

/**
 * Returns whether processing status should be shown.
 *
 * @param state
 */
export const isInProcessing = (state: IApplicationState) => {
  // Do we have global processing? (for example, searching of devices)
  if (state.context.isProcessing) {
    return true;
  }

  return isSelectedDeviceInProcessing(state);
};

/**
 * Returns if we have processing for selected device
 * @param state
 */
export const isSelectedDeviceInProcessing = (state: IApplicationState) => {
  const selectedDevice = getSelectedDevice(state);
  return selectedDevice == null ? false : selectedDevice.isProcessing;
};

/**
 * Returns if we have processing for selected device
 * @param state
 */
export const getSelectedDeviceProcessType = (state: IApplicationState) => {
  const selectedDevice = getSelectedDevice(state);
  return selectedDevice == null ? undefined : selectedDevice.processType;
};

/**
 * Returns transient state for selected device
 * @param state
 */
export const getSelectedDeviceTransientParameters = (state: IApplicationState) => {
  const selectedDevice = getSelectedDevice(state);
  return selectedDevice == null ? DEFAULT_TRANSIENT_STATE : selectedDevice.transientParameters;
};

/**
 * Returns text of processing status
 *
 * @param state
 */
export const getProcessStatus = (state: IApplicationState) => {
  // Show processStatus if we have global processing. (for example, searching of devices)
  if (state.context.processStatus) {
    return state.context.processStatus;
  }

  // Show processStatus if we have processing for selected device
  const selectedDevice = getSelectedDevice(state);
  return selectedDevice == null ? "" : selectedDevice.processStatus;
};
