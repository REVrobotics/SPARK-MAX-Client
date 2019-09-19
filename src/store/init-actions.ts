import {SparkAction} from "./types";
import SparkManager from "../managers/SparkManager";
import {REV_BRUSHLESS} from "../models/MotorConfiguration";
import WebProvider from "../providers/WebProvider";
import {
  addLog, selectDevice,
  setBurnedMotorConfig,
  setMotorConfig,
  setParamResponses,
  updateDeviceProcessStatus
} from "./actions";
import {connectUsbDevice, findUsbDevices} from "./device-actions";
import {getFirstUsbDeviceId} from "./selectors";
import {toDeviceId} from "./reducer";

export function initApplication(): SparkAction<void> {
  return (dispatch, getState) => {
    dispatch(downloadLatestFirmware());
    dispatch(findUsbDevices())
      .then(() => {
        const usbDevice = getFirstUsbDeviceId(getState());
        if (usbDevice == null) {
          return;
        }
        dispatch(selectDevice(usbDevice));
        return dispatch(connectUsbDevice(usbDevice));
      })
      .then(() => dispatch(checkForFirmwareUpdate()));

    SparkManager.onDisconnect((device) => {
      const deviceId = toDeviceId(device);
      dispatch(updateDeviceProcessStatus(deviceId, false, "DISCONNECTED"));
      dispatch(setParamResponses(deviceId, []));
      dispatch(setMotorConfig(deviceId, REV_BRUSHLESS));
      dispatch(setBurnedMotorConfig(deviceId, REV_BRUSHLESS));
    });
  };
}

function checkForFirmwareUpdate(): SparkAction<void> {
  return (dispatch) => {
    SparkManager.getFirmware().then((versionJSON: any) => {
      if (versionJSON.version && versionJSON.version.length > 0) {
        const version = versionJSON.version.substring(1, versionJSON.version.length);
        WebProvider.get("content/sw/max/sparkmax-gui-cfg.json").then((firmwareJSON: any) => {
          // const firmwareJSON: any = TEST_JSON;
          if (firmwareJSON.firmware) {
            for (const firmware of firmwareJSON.firmware) {
              if (firmware.spec === "Latest") {
                if (isOldFirmware(version, firmware.version)) {
                  SparkManager.showInfoBox("SPARK MAX Firmware", `Your motor controller is using an older version of firmware. The client will download the latest version, and can be loaded in the 'Firmware' tab.`);
                }
              }
            }
          }
        }).catch((error: any) => {
          dispatch(addLog(error));
        });
      }
    });
  };
}

function isOldFirmware(current: string, other: string): boolean {
  const curVer = current.toString().split(".");
  const othVer = other.toString().split(".");

  for (let i = 0; i < (Math.max(curVer.length, othVer.length)); i++) {

    if (Number(curVer[i]) < Number(othVer[i])) {
      return true;
    }

    if (curVer[i] !== othVer[i]) {
      break;
    }
  }
  return false;
}

function downloadLatestFirmware(): SparkAction<void> {
  return (dispatch) => {
    WebProvider.get("content/sw/max/sparkmax-gui-cfg.json").then((firmwareJSON: any) => {
      if (firmwareJSON.firmware) {
        for (const firmware of firmwareJSON.firmware) {
          if (firmware.spec === "Latest") {
            SparkManager.downloadFile(firmware.url);
          }
        }
      }
    }).catch((error: any) => {
      dispatch(addLog(error));
    });
  };
}