import {find} from "lodash";
import {DeviceId, IApplicationState} from "./types";
import {isUsbDevice} from "./reducer";
import {maybeMap} from "../utils/object-utils";
import {REV_BRUSHLESS} from "../models/MotorConfiguration";

/**
 * Returns first USB device
 *
 * @param orderedDevices
 * @param devices
 */
export const getFirstUsbDeviceId = ({deviceSet: {orderedDevices, devices}}: IApplicationState) =>
  maybeMap(find(orderedDevices.map((deviceId) => devices[deviceId]), isUsbDevice), ({deviceId}) => deviceId);

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
export const getSelectedDeviceId = ({context: {selectedDeviceId}}: IApplicationState) => selectedDeviceId;

/**
 * Returns selected device
 *
 * @param state
 */
export const getSelectedDevice = (state: IApplicationState) => {
  const selectedDeviceId = getSelectedDeviceId(state);
  return selectedDeviceId ? state.deviceSet.devices[selectedDeviceId] : undefined;
};

/**
 * Returns device by ID
 *
 * @param state
 * @param deviceId
 */
export const getDevice = (state: IApplicationState, deviceId: DeviceId) => state.deviceSet.devices[deviceId];

/**
 * Get device by predefined order
 *
 * @param orderedDevices
 * @param devices
 */
export const getDevicesInOrder = ({deviceSet: {orderedDevices, devices}}: IApplicationState) =>
  orderedDevices.map((deviceId) => devices[deviceId]);

/**
 * Returns USB device ID for given device ID.
 * For USB device this method returns its ID.
 * For CAN device this method returns ID of master USB device.
 *
 * @param state
 * @param deviceId
 */
export const getMasterDeviceId = (state: IApplicationState, deviceId: DeviceId) => {
  const device = getDevice(state, deviceId);
  if (isUsbDevice(device)) {
    return device.deviceId;
  } else {
    return device.masterDeviceId!;
  }
};

/**
 * Returns whether given device is connected or not.
 * USB device is connected iff isConnected = true
 * CAN device is connected iff its master USB device is connected.
 *
 * @param state
 * @param deviceId
 */
export const isDeviceConnected = (state: IApplicationState, deviceId: DeviceId) => {
  const device = getDevice(state, deviceId);
  if (isUsbDevice(device)) {
    return device.deviceId === state.context.connectedDeviceId;
  } else {
    const usbDevice = getDevice(state, device.masterDeviceId!);
    return usbDevice.deviceId === state.context.connectedDeviceId;
  }
};

/**
 * Returns whether any device is connected
 * @param state
 */
export const isHasConnectedDevice = (state: IApplicationState) => getConnectedDeviceId(state) != null;

/**
 * Returns id of connected device
 * @param state
 */
export const getConnectedDeviceId = (state: IApplicationState) => state.context.connectedDeviceId;

/**
 * Returns whether selected device is in the connected state
 * @param state
 */
export const isSelectedDeviceConnected = (state: IApplicationState) => {
  const selectedDeviceId = getSelectedDeviceId(state);
  if (selectedDeviceId == null) {
    return false;
  }

  return isDeviceConnected(state, selectedDeviceId);
};

/**
 * Returns current {@link MotorConfiguration} for selected device.
 *
 * @param state
 */
export const getSelectedDeviceMotorConfig = (state: IApplicationState) => {
  const selectedDevice = getSelectedDevice(state);
  if (selectedDevice == null) {
    return REV_BRUSHLESS;
  }
  return selectedDevice.currentConfig;
};

/**
 * Returns burned {@link MotorConfiguration} for selected device.
 *
 * @param state
 */
export const getSelectedDeviceBurnedConfig = (state: IApplicationState) => {
  const selectedDevice = getSelectedDevice(state);
  if (selectedDevice == null) {
    return REV_BRUSHLESS;
  }
  return selectedDevice.burnedConfig;
};

/**
 * Returns last parameter responses for selected device.
 *
 * @param state
 */
export const getSelectedDeviceParamResponses = (state: IApplicationState) => {
  const selectedDevice = getSelectedDevice(state);
  if (selectedDevice == null) {
    return [];
  }
  return selectedDevice.paramResponses;
};

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
