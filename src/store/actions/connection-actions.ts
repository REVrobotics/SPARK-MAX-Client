import {createUsbDeviceState, DeviceId, fromDeviceId} from "../state";
import {
  addDevices,
  addLog,
  setBurnedMotorConfig, setConnectedDevice, setDeviceLoaded,
  setMotorConfig,
  setParamResponses,
  updateDeviceIsProcessing,
  updateDeviceProcessStatus,
  updateGlobalIsProcessing,
  updateGlobalProcessStatus
} from "./atom-actions";
import SparkManager from "../../managers/SparkManager";
import {REV_BRUSHLESS} from "../../models/MotorConfiguration";
import {getConnectedDeviceId, getDevice, getMasterDeviceId, getSelectedDeviceId, isDeviceConnected} from "../selectors";
import {loadParameters} from "./parameter-actions";
import {ActionType, SparkAction} from "./action-types";

export function connectUsbDevice(deviceId: DeviceId): SparkAction<Promise<void>> {
  return (dispatch) => {
    dispatch(updateDeviceProcessStatus(deviceId, "CONNECTING..."));
    dispatch(updateDeviceIsProcessing(deviceId, true));

    return SparkManager.connect(fromDeviceId(deviceId))
      .catch((error: any) => {
        dispatch(updateDeviceProcessStatus(deviceId, "CONNECTION FAILED"));
        dispatch(updateDeviceIsProcessing(deviceId, false));
        dispatch(addLog(error));
      })
      .then(() => {
        dispatch(setConnectedDevice(deviceId, true));
        return dispatch(loadParameters(deviceId))
      });
  };
}

export function connectToSelectedDevice(): SparkAction<Promise<void>> {
  return (dispatch, getState) => {
    const deviceId = getSelectedDeviceId(getState());

    if (deviceId == null) {
      return Promise.resolve();
    }


    const usbDeviceId = getMasterDeviceId(getState(), deviceId);

    return dispatch(disconnectCurrentDevice())
      .then(() => dispatch(connectUsbDevice(usbDeviceId)))
  };
}

export function disconnectCurrentDevice(): SparkAction<Promise<any>> {
  return (dispatch, getState) => {
    const deviceId = getConnectedDeviceId(getState());
    if (deviceId == null) {
      return Promise.resolve();
    }

    const usbDeviceId = getMasterDeviceId(getState(), deviceId);

    dispatch(updateDeviceIsProcessing(true));
    return SparkManager.disconnect(fromDeviceId(usbDeviceId)).then(() => {
      dispatch(updateDeviceProcessStatus(usbDeviceId, "DISCONNECTED"));
      dispatch(updateDeviceIsProcessing(usbDeviceId, false));
      dispatch(setDeviceLoaded(usbDeviceId, false));
      dispatch(setConnectedDevice(usbDeviceId, false));
      dispatch(setParamResponses(usbDeviceId, []));
      dispatch(setMotorConfig(usbDeviceId, REV_BRUSHLESS));
      dispatch(setBurnedMotorConfig(usbDeviceId, REV_BRUSHLESS));
    }).catch(() => {
      dispatch(updateDeviceIsProcessing(usbDeviceId, false));
    });
  };
}

export const selectDevice = (deviceId: DeviceId): SparkAction<Promise<any>> =>
  (dispatch, getState) => {
    const device = getDevice(getState(), deviceId);

    const isConnected = isDeviceConnected(getState(), deviceId);

    // load parameters if device is connected and parameters was not loaded
    const parametersLoaded = isConnected && !device.isLoaded ? dispatch(loadParameters(deviceId)) : Promise.resolve();

    return parametersLoaded
      .then(() => dispatch({
        payload: { deviceId },
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
