import {first} from "lodash";
import {
  createCanDeviceState,
  createHubDeviceState,
  fromDeviceId,
  getVirtualDeviceId,
  setVirtualDeviceId,
  VirtualDeviceId
} from "../state";
import {
  addDevices,
  addLog, replaceDevices,
  setConnectedDevice, setDeviceLoaded, setParameters, setSelectedDevice,
  updateDeviceIsProcessing,
  updateDeviceProcessStatus,
  updateGlobalIsProcessing,
  updateGlobalProcessStatus
} from "./atom-actions";
import SparkManager from "../../managers/SparkManager";
import {
  queryConnectedVirtualDeviceId,
  queryDevice,
  queryHubVirtualDeviceId,
  querySelectedVirtualDeviceId,
  queryIsDeviceConnected,
  queryDeviceId, queryConnectedDevices
} from "../selectors";
import {loadParameters} from "./parameter-actions";
import {SparkAction} from "./action-types";
import {onSchedule} from "../../utils/redux-scheduler";
import {logError} from "../../utils/promise-utils";

export function connectHubDevice(virtualDeviceId: VirtualDeviceId): SparkAction<Promise<void>> {
  return (dispatch, getState) => {
    dispatch(updateDeviceProcessStatus(virtualDeviceId, "CONNECTING..."));
    dispatch(updateDeviceIsProcessing(virtualDeviceId, true));

    const deviceId = fromDeviceId(queryDeviceId(getState(), virtualDeviceId)!);

    return SparkManager.connect(deviceId)
      .then(() =>
        // After device is connected, scan its CAN bus
        SparkManager.listCanDevices(deviceId)
          .catch((err) => {
            // Common error handling, catch clause here below will process error
            SparkManager.disconnect(deviceId);
            return Promise.reject(err);
          }))
      .then(({extendedList}) => {
        // Here we need only SPARK MAX controllers
        const sparkMaxDevices = extendedList.filter((extended) => extended.updateable);
        // Generate device state for each device
        const canDevices = sparkMaxDevices.map((extended) => createCanDeviceState(extended, virtualDeviceId));
        // We assume that first device is the device we tried to connect
        // We have to assign correct id (that was used initially)
        const firstCanDevice = canDevices.slice(0, 1).map((device) => setVirtualDeviceId(device, virtualDeviceId));
        dispatch(addDevices(firstCanDevice.concat(canDevices.slice(1))));
      })
      .catch(logError)
      .catch((error: any) => {
        dispatch(updateDeviceProcessStatus(virtualDeviceId, "CONNECTION FAILED"));
        dispatch(updateDeviceIsProcessing(virtualDeviceId, false));
        dispatch(addLog(error));
      })
      .then(() => {
        dispatch(setConnectedDevice(virtualDeviceId, true));
        return dispatch(loadParameters(virtualDeviceId))
      });
  };
}

export function connectToSelectedDevice(): SparkAction<Promise<void>> {
  return (dispatch, getState) => {
    const deviceId = querySelectedVirtualDeviceId(getState());

    if (deviceId == null) {
      return Promise.resolve();
    }

    const hubDeviceId = queryHubVirtualDeviceId(getState(), deviceId);

    return dispatch(disconnectCurrentDevice())
      .then(() => dispatch(connectHubDevice(hubDeviceId)))
  };
}

export function disconnectHubDevice(virtualDeviceId: VirtualDeviceId): SparkAction<Promise<any>> {
  return onSchedule("device-action", virtualDeviceId, (dispatch, getState) => {
    dispatch(updateDeviceIsProcessing(virtualDeviceId, true));
    return SparkManager.disconnect(fromDeviceId(queryDeviceId(getState(), virtualDeviceId)!))
      .then(() =>
        SparkManager.listUsbDevices()
        // TODO: select disconnected USB device based on descriptor
          .then(({extendedList}) => first(extendedList)!))
      .then((disconnectedDevice) => {
        // Remove all CAN devices connected to hub device
        // As we do not know what device is a hub, we just replace current one by hub device state
        const device = setVirtualDeviceId(createHubDeviceState(disconnectedDevice), virtualDeviceId);
        const deviceIdsToReplace = queryConnectedDevices(getState()).map(getVirtualDeviceId);
        dispatch(replaceDevices(device, deviceIdsToReplace));
        dispatch(updateDeviceProcessStatus(virtualDeviceId, ""));
        dispatch(updateDeviceIsProcessing(virtualDeviceId, false));
        dispatch(setDeviceLoaded(virtualDeviceId, false));
        dispatch(setConnectedDevice(virtualDeviceId, false));
        dispatch(setParameters(virtualDeviceId, []));
      })
      .catch(logError)
      .catch(() => {
        dispatch(updateDeviceIsProcessing(virtualDeviceId, false));
      });
  });
};

export function disconnectCurrentDevice(): SparkAction<Promise<any>> {
  return (dispatch, getState) => {
    const virtualDeviceId = queryConnectedVirtualDeviceId(getState());
    if (virtualDeviceId == null) {
      return Promise.resolve();
    }

    const hubVirtualDeviceId = queryHubVirtualDeviceId(getState(), virtualDeviceId);

    return dispatch(disconnectHubDevice(hubVirtualDeviceId));
  };
}

export const selectDevice = (virtualDeviceId: VirtualDeviceId): SparkAction<Promise<any>> =>
  (dispatch, getState) => {
    const device = queryDevice(getState(), virtualDeviceId);

    const isConnected = queryIsDeviceConnected(getState(), virtualDeviceId);

    dispatch(setSelectedDevice(virtualDeviceId));

    // load parameters if device is connected and parameters was not loaded
    return isConnected && !device.isLoaded ?
      dispatch(loadParameters(virtualDeviceId))
      : Promise.resolve();
  };

export function findUsbDevices(): SparkAction<Promise<void>> {
  return (dispatch) => {
    dispatch(updateGlobalProcessStatus("SEARCHING..."));
    dispatch(updateGlobalIsProcessing(true));

    return SparkManager.listUsbDevices()
      .then(({deviceList, extendedList}) => {
        dispatch(updateGlobalProcessStatus(deviceList.length ? "" : "NO DEVICES FOUND"));
        dispatch(updateGlobalIsProcessing(false));
        dispatch(addDevices(extendedList.map((extended) => createHubDeviceState(extended))));
      })
      .catch(() => {
        dispatch(updateGlobalProcessStatus("SEARCH FAILED"));
        dispatch(updateGlobalIsProcessing(false));
      });
  };
}
