import {SparkAction} from "./types";
import {
  addLog,
  setBurnedMotorConfig,
  setConnectedDevice,
  setIsConnecting,
  setMotorConfig,
  setParamResponses, setUsbDevices,
  updateConnectionStatus
} from "./actions";
import SparkManager, {IServerResponse} from "../managers/SparkManager";
import {delayPromise} from "../utils/promise-utils";
import MotorConfiguration, {REV_BRUSHLESS} from "../models/MotorConfiguration";
import {firstUsbDeviceSelector} from "./selectors";

export function connectUsbDevice(device: string): SparkAction<Promise<void>> {
  return (dispatch) => {
    dispatch(updateConnectionStatus(false, "CONNECTING..."));
    dispatch(setIsConnecting(true));

    return SparkManager.connect(device).then(() => {
      dispatch(updateConnectionStatus(false, "GETTING PARAMETERS..."));
      dispatch(setConnectedDevice(device));

      const paramResponses: IServerResponse[] = [];
      for (let i = 0; i < 75; i++) {
        paramResponses.push({requestValue: "", responseValue: "", status: 0, type: 0});
      }
      dispatch(setParamResponses(paramResponses));
    }).then(() => delayPromise(1000))
      .then(() => SparkManager.getConfigFromParams())
      .then((config: MotorConfiguration) => {
        dispatch(updateConnectionStatus(true, "CONNECTED"));
        dispatch(setIsConnecting(false));
        dispatch(setMotorConfig(config));
        const burn: MotorConfiguration = new MotorConfiguration(config.name, config.type).fromJSON(config.toJSON());
        dispatch(setBurnedMotorConfig(burn));
      })
      .catch((error: any) => {
        dispatch(updateConnectionStatus(false, "CONNECTION FAILED"));
        dispatch(setIsConnecting(false));
        dispatch(addLog(error));
      });
  };
}

export function connectMasterUsbDevice(): SparkAction<Promise<void>> {
  return (dispatch, getState) => {
    // TODO: if selected device is USB device => connect to it
    // otherwise (if selected device is CAN device) => find master USB device
    const usbDevice = firstUsbDeviceSelector(getState());
    if (usbDevice == null) {
      return Promise.resolve();
    }

    return dispatch(connectUsbDevice(usbDevice));
  };
}

export function disconnectCurrentUsbDevice(): SparkAction<void> {
  return (dispatch, getState) => {
    const { isConnected, connectedDevice } = getState();
    if (!isConnected) {
      return;
    }

    dispatch(setIsConnecting(true));
    SparkManager.disconnect(connectedDevice).then(() => {
      dispatch(updateConnectionStatus(false, "DISCONNECTED"));
      dispatch(setIsConnecting(false));
      dispatch(setParamResponses([]));
      dispatch(setMotorConfig(REV_BRUSHLESS));
      dispatch(setBurnedMotorConfig(REV_BRUSHLESS));
    }).catch(() => {
      dispatch(setIsConnecting(false));
    });
  };
}

export function findUsbDevices(): SparkAction<Promise<void>> {
  return (dispatch) => {
    dispatch(updateConnectionStatus(false, "SEARCHING..."));
    dispatch(setIsConnecting(true));

    return SparkManager.listUsbDevices()
      .then((devices) => {
        dispatch(updateConnectionStatus(false, devices.length ? "" : "NO DEVICES FOUND"));
        dispatch(setIsConnecting(false));
        dispatch(setUsbDevices(devices));
      })
      .catch(() => {
        dispatch(updateConnectionStatus(false, "SEARCH FAILED"));
        dispatch(setIsConnecting(false));
      });
  };
}
