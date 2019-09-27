import {createUsbDeviceState, fromDeviceId, VirtualDeviceId} from "../state";
import {
  addDevices,
  addLog,
  setConnectedDevice, setDeviceLoaded, setParameters,
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
  queryDeviceId
} from "../selectors";
import {loadParameters} from "./parameter-actions";
import {ActionType, SparkAction} from "./action-types";
import {onSchedule} from "../../utils/redux-scheduler";

export function connectHubDevice(virtualDeviceId: VirtualDeviceId): SparkAction<Promise<void>> {
  return (dispatch, getState) => {
    dispatch(updateDeviceProcessStatus(virtualDeviceId, "CONNECTING..."));
    dispatch(updateDeviceIsProcessing(virtualDeviceId, true));

    return SparkManager.connect(fromDeviceId(queryDeviceId(getState(), virtualDeviceId)!))
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
    dispatch(updateDeviceIsProcessing(true));
    return SparkManager.disconnect(fromDeviceId(queryDeviceId(getState(), virtualDeviceId)!)).then(() => {
      dispatch(updateDeviceProcessStatus(virtualDeviceId, "DISCONNECTED"));
      dispatch(updateDeviceIsProcessing(virtualDeviceId, false));
      dispatch(setDeviceLoaded(virtualDeviceId, false));
      dispatch(setConnectedDevice(virtualDeviceId, false));
      dispatch(setParameters(virtualDeviceId, []));
    }).catch(() => {
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

    // load parameters if device is connected and parameters was not loaded
    const parametersLoaded = isConnected && !device.isLoaded ?
      dispatch(loadParameters(virtualDeviceId))
      : Promise.resolve();

    return parametersLoaded
      .then(() => dispatch({
        payload: { virtualDeviceId },
        type: ActionType.SELECT_DEVICE,
      }));
  };

export function findUsbDevices(): SparkAction<Promise<void>> {
  return (dispatch) => {
    dispatch(updateGlobalProcessStatus("SEARCHING..."));
    dispatch(updateGlobalIsProcessing(true));

    return SparkManager.listUsbDevices()
      .then(({deviceList, extendedList}) => {
        dispatch(updateGlobalProcessStatus(deviceList.length ? "" : "NO DEVICES FOUND"));
        dispatch(updateGlobalIsProcessing(false));
        dispatch(addDevices(extendedList.map((extended) => createUsbDeviceState(extended.deviceId!, {
          deviceName: extended.deviceName!,
          driverName: extended.driverName!,
          updateable: extended.updateable!,
        }))));
      })
      .catch(() => {
        dispatch(updateGlobalProcessStatus("SEARCH FAILED"));
        dispatch(updateGlobalIsProcessing(false));
      });
  };
}
