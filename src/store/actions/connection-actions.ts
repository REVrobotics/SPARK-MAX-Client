import {first} from "lodash";
import {
  createDeviceState,
  diffDevices,
  getDeviceId,
  PathDescriptor,
  resetDeviceState,
  toDtoDescriptor,
  toDtoDeviceId,
  VirtualDeviceId
} from "../state";
import {
  addDevices,
  replaceDevices,
  setConnectedDescriptor,
  setSelectedDevice,
  updateGlobalIsProcessing,
  updateGlobalProcessStatus,
  updateIsProcessingByDescriptor,
} from "./atom-actions";
import SparkManager from "../../managers/SparkManager";
import {
  queryConnectedDescriptor,
  queryDevice,
  queryDevicesByDescriptor, queryDevicesInOrder,
  queryIsDeviceConnected,
  queryPathDescriptor,
  querySelectedVirtualDeviceId
} from "../selectors";
import {loadParameters} from "./parameter-actions";
import {SparkAction} from "./action-types";
import {showToastWarning} from "./ui-actions";
import {onError, useErrorHandler} from "./error-actions";
import {syncSignals} from "./display-actions";

export function connectDevice(descriptor: PathDescriptor): SparkAction<Promise<void>> {
  return (dispatch, getState) => {
    // Update status of all devices for the given descriptor
    dispatch(updateGlobalIsProcessing(true));
    dispatch(updateGlobalProcessStatus(tt("lbl_status_connecting")));
    dispatch(updateIsProcessingByDescriptor(descriptor, true));

    // Find some device for the given descriptor
    // It does not matter what device (having the same descriptor) we use to connect
    const deviceForDescriptor = first(queryDevicesByDescriptor(getState(), descriptor))!;

    // Try to connect to the found device
    return SparkManager.connect(toDtoDeviceId(getDeviceId(deviceForDescriptor)), toDtoDescriptor(descriptor))
      .catch(onError(() => {
        dispatch(updateGlobalIsProcessing(false));
        dispatch(updateGlobalProcessStatus(tt("lbl_status_connection_failed")));
        dispatch(updateIsProcessingByDescriptor(descriptor, false));
      }))
      .then(() => {
        dispatch(setConnectedDescriptor(descriptor));
        dispatch(updateGlobalIsProcessing(false));
        dispatch(updateGlobalProcessStatus(""));
        dispatch(updateIsProcessingByDescriptor(descriptor, false));

        // Resync list of devices after connection
        return dispatch(syncDevices());
      })
      .catch(useErrorHandler(dispatch));
  };
}

export function connectToSelectedDevice(): SparkAction<Promise<void>> {
  return (dispatch, getState) => {
    const deviceId = querySelectedVirtualDeviceId(getState());

    if (deviceId == null) {
      return Promise.resolve();
    }

    const descriptor = queryPathDescriptor(getState(), deviceId);

    // Hardly, it can be imagined such situation when descriptor is absent, but just in case
    if (descriptor == null) {
      return Promise.resolve();
    }

    return dispatch(disconnectCurrentDevice())
      .then(() => dispatch(connectDevice(descriptor)))
  };
}

export function disconnectCurrentDevice(): SparkAction<Promise<any>> {
  return (dispatch, getState) => {
    const descriptor = queryConnectedDescriptor(getState());

    if (descriptor == null) {
      return Promise.resolve();
    }

    dispatch(updateGlobalProcessStatus(tt("lbl_status_disconnecting")));
    dispatch(updateGlobalIsProcessing(true));
    dispatch(updateIsProcessingByDescriptor(descriptor, true));
    return SparkManager.disconnect()
      .then(() => {
        const devices = queryDevicesInOrder(getState());
        dispatch(replaceDevices(devices.map(resetDeviceState)));

        dispatch(setConnectedDescriptor());

        // When there is no connected device, syncSignals just cleans display and removes all destinations
        return dispatch(syncSignals());
      })
      .catch(useErrorHandler(dispatch))
      .finally(() => {
        dispatch(updateGlobalProcessStatus(""));
        dispatch(updateGlobalIsProcessing(false));
        dispatch(updateIsProcessingByDescriptor(descriptor, false));
      });
  };
}

export function syncDevices(showNotifications: boolean = false): SparkAction<Promise<void>> {
  return (dispatch, getState) => {
    const descriptor = queryConnectedDescriptor(getState());
    // Update status of all devices for the given descriptor
    dispatch(updateGlobalProcessStatus(tt("lbl_status_syncing")));
    dispatch(updateGlobalIsProcessing(true));
    if (descriptor) {
      dispatch(updateIsProcessingByDescriptor(descriptor, true));
    }

    return SparkManager.listAllDevices()
      .then(({driverList, extendedList}) => {
        // Here we need only SPARK MAX controllers
        const nextDevices = extendedList.filter((extended) => extended.updateable);
        // Generate device state for each connected device
        const nextDeviceStates = nextDevices.map(createDeviceState);
        const currentDeviceStates = queryDevicesInOrder(getState());
        const connectedDescriptor = queryConnectedDescriptor(getState());
        const {added, merged, removed} = diffDevices(currentDeviceStates, nextDeviceStates);
        // Merge list of devices for the given descriptor
        dispatch(replaceDevices(added.concat(merged), driverList));

        if (showNotifications) {
          added
            .filter((device) => device.descriptor === connectedDescriptor)
            .forEach((device) => showToastWarning(tt("msg_device_added", {
              deviceId: device.info.deviceId,
              deviceName: device.info.deviceName
            })));

          removed
            .filter((device) => device.descriptor === connectedDescriptor)
            .forEach((device) => showToastWarning(tt("msg_device_removed", {
              deviceId: device.info.deviceId,
              deviceName: device.info.deviceName
            })));
        }
      })
      // Syncing of signals is a part of device syncing
      .then((response) => dispatch(syncSignals()).then(() => response))
      .then(() => {
        dispatch(updateGlobalProcessStatus(""));
        dispatch(updateGlobalIsProcessing(false));
        if (descriptor) {
          dispatch(updateIsProcessingByDescriptor(descriptor, false));
        }
      })
      .catch(onError(() => {
        dispatch(updateGlobalProcessStatus(tt("lbl_status_failed_to_sync")));
        dispatch(updateGlobalIsProcessing(false));
        if (descriptor) {
          dispatch(updateIsProcessingByDescriptor(descriptor, false));
        }
      }))
      .then(() => {
        const selectedDeviceId = querySelectedVirtualDeviceId(getState());
        if (selectedDeviceId) {
          return dispatch(ensureDeviceLoaded(selectedDeviceId));
        } else {
          return Promise.resolve();
        }
      })
      .catch(useErrorHandler(dispatch));
  };
}

export const selectDevice = (virtualDeviceId: VirtualDeviceId): SparkAction<Promise<any>> =>
  (dispatch) => {
    dispatch(setSelectedDevice(virtualDeviceId));
    return dispatch(ensureDeviceLoaded(virtualDeviceId));
  };

export const ensureDeviceLoaded = (virtualDeviceId: VirtualDeviceId): SparkAction<Promise<any>> =>
  (dispatch, getState) => {
    const device = queryDevice(getState(), virtualDeviceId);

    const isConnected = queryIsDeviceConnected(getState(), virtualDeviceId);

    // load parameters if device is connected and parameters was not loaded
    return isConnected && !device.isLoaded ?
      dispatch(loadParameters(virtualDeviceId))
      : Promise.resolve();
  };

export function findAllDevices(): SparkAction<Promise<void>> {
  return (dispatch) => {
    dispatch(updateGlobalProcessStatus(tt("lbl_status_searching")));
    dispatch(updateGlobalIsProcessing(true));

    return SparkManager.listAllDevices()
      .then(({driverList, extendedList}) => {
        dispatch(updateGlobalProcessStatus(""));
        dispatch(updateGlobalIsProcessing(false));
        dispatch(addDevices(extendedList.filter(({updateable}) => updateable).map(createDeviceState), driverList));
      })
      .catch(onError(() => {
        dispatch(updateGlobalProcessStatus(tt("lbl_status_search_failed")));
        dispatch(updateGlobalIsProcessing(false));
      }))
      .catch(useErrorHandler(dispatch));
  };
}
