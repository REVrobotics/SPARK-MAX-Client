import {DeviceId, SparkAction} from "./types";
import {
  addLog,
  setBurnedMotorConfig,
  updateDeviceIsProcessing,
  setMotorConfig,
  setParamResponses, addDevices,
  updateDeviceProcessStatus, updateGlobalProcessStatus, updateGlobalIsProcessing
} from "./actions";
import SparkManager, {IServerResponse} from "../managers/SparkManager";
import {delayPromise} from "../utils/promise-utils";
import MotorConfiguration, {REV_BRUSHLESS} from "../models/MotorConfiguration";
import {getFirstUsbDeviceId, getMasterDeviceId, getSelectedDeviceId, isDeviceConnected} from "./selectors";
import {createUsbDeviceState, fromDeviceId} from "./reducer";

export function connectUsbDevice(deviceId: DeviceId): SparkAction<Promise<void>> {
  return (dispatch) => {
    dispatch(updateDeviceProcessStatus(deviceId, false, "CONNECTING..."));
    dispatch(updateDeviceIsProcessing(deviceId, true));

    return SparkManager.connect(fromDeviceId(deviceId)).then(() => {
      dispatch(updateDeviceProcessStatus(deviceId, false, "GETTING PARAMETERS..."));

      const paramResponses: IServerResponse[] = [];
      for (let i = 0; i < 75; i++) {
        paramResponses.push({requestValue: "", responseValue: "", status: 0, type: 0});
      }
      dispatch(setParamResponses(deviceId, paramResponses));
    }).then(() => delayPromise(1000))
      .then(() => SparkManager.getConfigFromParams())
      .then((config: MotorConfiguration) => {
        dispatch(updateDeviceProcessStatus(deviceId, true, "CONNECTED"));
        dispatch(updateDeviceIsProcessing(deviceId, false));
        dispatch(setMotorConfig(deviceId, config));
        const burn: MotorConfiguration = new MotorConfiguration(config.name, config.type).fromJSON(config.toJSON());
        dispatch(setBurnedMotorConfig(deviceId, burn));
      })
      .catch((error: any) => {
        dispatch(updateDeviceProcessStatus(deviceId, false, "CONNECTION FAILED"));
        dispatch(updateDeviceIsProcessing(deviceId, false));
        dispatch(addLog(error));
      });
  };
}

export function connectMasterUsbDevice(): SparkAction<Promise<void>> {
  return (dispatch, getState) => {
    // TODO: if selected device is USB device => connect to it
    // otherwise (if selected device is CAN device) => find master USB device
    const usbDevice = getFirstUsbDeviceId(getState());
    if (usbDevice == null) {
      return Promise.resolve();
    }

    return dispatch(connectUsbDevice(usbDevice));
  };
}

export function disconnectCurrentUsbDevice(): SparkAction<void> {
  return (dispatch, getState) => {
    const deviceId = getSelectedDeviceId(getState());
    if (deviceId == null || !isDeviceConnected(getState(), deviceId)) {
      return;
    }

    const usbDeviceId = getMasterDeviceId(getState(), deviceId);

    dispatch(updateDeviceIsProcessing(true));
    SparkManager.disconnect(fromDeviceId(usbDeviceId)).then(() => {
      dispatch(updateDeviceProcessStatus(usbDeviceId, false, "DISCONNECTED"));
      dispatch(updateDeviceIsProcessing(usbDeviceId, false));
      dispatch(setParamResponses(usbDeviceId, []));
      dispatch(setMotorConfig(usbDeviceId, REV_BRUSHLESS));
      dispatch(setBurnedMotorConfig(usbDeviceId, REV_BRUSHLESS));
    }).catch(() => {
      dispatch(updateDeviceIsProcessing(usbDeviceId, false));
    });
  };
}

export function findUsbDevices(): SparkAction<Promise<void>> {
  return (dispatch) => {
    dispatch(updateGlobalProcessStatus(false, "SEARCHING..."));
    dispatch(updateGlobalIsProcessing(true));

    return SparkManager.listUsbDevices()
      .then(({ deviceList, extendedList }) => {
        dispatch(updateGlobalProcessStatus(false, deviceList.length ? "" : "NO DEVICES FOUND"));
        dispatch(updateGlobalIsProcessing(false));
        dispatch(addDevices(extendedList.map((extended) => createUsbDeviceState(extended.deviceId!, {
          deviceName: extended.deviceName!,
          driverName: extended.driverName!,
          updateable: extended.updateable!,
        }))));
      })
      .catch(() => {
        dispatch(updateGlobalProcessStatus(false, "SEARCH FAILED"));
        dispatch(updateGlobalIsProcessing(false));
      });
  };
}
