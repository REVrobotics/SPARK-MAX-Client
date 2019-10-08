import {SparkAction} from "./action-types";
import SparkManager from "../../managers/SparkManager";
import {initMessageQueue, setConnectedDevice, setSelectedTab, updateDeviceProcessStatus} from "./atom-actions";
import {connectHubDevice, findUsbDevices, selectDevice} from "./connection-actions";
import {queryDeviceByDeviceId, queryFirstVirtualDeviceId} from "../selectors";
import {ConfirmationAnswer, getVirtualDeviceId, TabId, toDeviceId} from "../state";
import {downloadLatestFirmware} from "./firmware-actions";
import {findObsoletedDevice, scanCanBus, updateLoadFirmwareProgress} from "./network-actions";
import {showConfirmation, whenMessageQueueClosed} from "./ui-actions";
import {Intent} from "@blueprintjs/core";
import {loadConfigurations} from "./configuration-actions";

function loadApplicationData(): SparkAction<Promise<any>> {
  return (dispatch) => {
    dispatch(initMessageQueue({
      title: "Problems During Startup",
      body: "During application startup some application settings were invalid.",
      messages: [],
    }));

    return dispatch(loadConfigurations())
      .then(() => dispatch(whenMessageQueueClosed()))
      .then(() => dispatch(findUsbDevices()));
  }
}

export function initApplication(): SparkAction<void> {
  return (dispatch, getState) => {
    dispatch(downloadLatestFirmware());
    dispatch(loadApplicationData())
      .then(() => {
        const virtualDeviceId = queryFirstVirtualDeviceId(getState());
        if (virtualDeviceId == null) {
          return;
        }
        return dispatch(selectDevice(virtualDeviceId))
          .then(() => dispatch(connectHubDevice(virtualDeviceId)))
          .then(() => dispatch(checkForFirmwareUpdate()));
      });

    SparkManager.onDisconnect((deviceId) => {
      const device = queryDeviceByDeviceId(getState(), toDeviceId(deviceId));
      if (device) {
        const virtualDeviceId = getVirtualDeviceId(device);
        dispatch(updateDeviceProcessStatus(virtualDeviceId, ""));
        dispatch(setConnectedDevice(virtualDeviceId, false));
      }
    });

    SparkManager.onLoadFirmwareProgress((error, response) =>
      dispatch(updateLoadFirmwareProgress(error, response)));
  };
}

/**
 * Checks if any of devices uses obsoleted version
 */
function checkForFirmwareUpdate(): SparkAction<void> {
  return (dispatch) => {
    dispatch(downloadLatestFirmware())
      .then(() => dispatch(findObsoletedDevice()))
      .then((hasObsoletedDevice) => {
        if (!hasObsoletedDevice) {
          return ConfirmationAnswer.Cancel;
        }
        return dispatch(showConfirmation({
          intent: Intent.WARNING,
          text: `One of your motor controllers is using an older version of firmware. The client will download the latest version, and can be loaded in the 'Firmware' tab.`,
          yesLabel: "Open Network Tab & Scan Bus",
          cancelLabel: "Close",
        }));
      })
      .then((answer) => {
        if (answer === ConfirmationAnswer.Yes) {
          dispatch(setSelectedTab(TabId.Network));
          dispatch(scanCanBus());
        }
      });
  };
}
