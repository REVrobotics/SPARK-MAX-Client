import {createUsbDeviceState, fromDeviceId, VirtualDeviceId} from "../state";
import {
  addDevices,
  addLog,
  setConnectedDevice, setDeviceLoaded,
  updateDeviceIsProcessing,
  updateDeviceProcessStatus,
  updateGlobalIsProcessing,
  updateGlobalProcessStatus
} from "./atom-actions";
import SparkManager from "../../managers/SparkManager";
import {
  getConnectedVirtualDeviceId,
  getDevice,
  getHubVirtualDeviceId,
  getSelectedVirtualDeviceId,
  isDeviceConnected,
  selectDeviceId
} from "../selectors";
import {loadParameters} from "./parameter-actions";
import {ActionType, SparkAction} from "./action-types";

export function connectHubDevice(virtualDeviceId: VirtualDeviceId): SparkAction<Promise<void>> {
  return (dispatch, getState) => {
    dispatch(updateDeviceProcessStatus(virtualDeviceId, "CONNECTING..."));
    dispatch(updateDeviceIsProcessing(virtualDeviceId, true));

    return SparkManager.connect(fromDeviceId(selectDeviceId(getState(), virtualDeviceId)!))
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
    const deviceId = getSelectedVirtualDeviceId(getState());

    if (deviceId == null) {
      return Promise.resolve();
    }


    const hubDeviceId = getHubVirtualDeviceId(getState(), deviceId);

    return dispatch(disconnectCurrentDevice())
      .then(() => dispatch(connectHubDevice(hubDeviceId)))
  };
}

export function disconnectCurrentDevice(): SparkAction<Promise<any>> {
  return (dispatch, getState) => {
    const deviceId = getConnectedVirtualDeviceId(getState());
    if (deviceId == null) {
      return Promise.resolve();
    }

    const hubVirtualDeviceId = getHubVirtualDeviceId(getState(), deviceId);

    dispatch(updateDeviceIsProcessing(true));
    return SparkManager.disconnect(fromDeviceId(selectDeviceId(getState(), hubVirtualDeviceId)!)).then(() => {
      dispatch(updateDeviceProcessStatus(hubVirtualDeviceId, "DISCONNECTED"));
      dispatch(updateDeviceIsProcessing(hubVirtualDeviceId, false));
      dispatch(setDeviceLoaded(hubVirtualDeviceId, false));
      dispatch(setConnectedDevice(hubVirtualDeviceId, false));
    }).catch(() => {
      dispatch(updateDeviceIsProcessing(hubVirtualDeviceId, false));
    });
  };
}

export const selectDevice = (virtualDeviceId: VirtualDeviceId): SparkAction<Promise<any>> =>
  (dispatch, getState) => {
    const device = getDevice(getState(), virtualDeviceId);

    const isConnected = isDeviceConnected(getState(), virtualDeviceId);

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
