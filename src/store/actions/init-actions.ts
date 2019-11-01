import {SparkAction, SparkDispatch} from "./action-types";
import SparkManager from "../../managers/SparkManager";
import {initMessageQueue, setConnectedDescriptor, setSelectedTab} from "./atom-actions";
import {connectDevice, findAllDevices, selectDevice, syncDevices} from "./connection-actions";
import {queryConnectedDescriptor, queryFirstVirtualDeviceId, querySelectedDevice} from "../selectors";
import {ConfirmationAnswer, TabId} from "../state";
import {downloadLatestFirmware} from "./firmware-actions";
import {findObsoletedDevice, scanCanBus, updateLoadFirmwareProgress} from "./network-actions";
import {showConfirmation, whenMessageQueueClosed} from "./ui-actions";
import {Intent} from "@blueprintjs/core";
import {loadConfigurations} from "./configuration-actions";
import {stopAllDevices, telemetryEvent} from "./display-actions";

/**
 * Loads necessary application data.
 */
function loadApplicationData(): SparkAction<Promise<any>> {
  return (dispatch) => {
    // Initialize message queue.
    // Anyway message queue is displayed ONLY when it has some messages associated
    dispatch(initMessageQueue({
      title: tt("lbl_problems_during_startup"),
      body: tt("msg_startup_problems"),
      messages: [],
    }));

    return dispatch(loadConfigurations())
      .then(() => dispatch(whenMessageQueueClosed()))
      .then(() => dispatch(findAllDevices()));
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
          .then(() => {
            const selectedDevice = querySelectedDevice(getState())!;
            return dispatch(connectDevice(selectedDevice.descriptor));
          })
          .then(() => dispatch(checkForFirmwareUpdate()));
      });

    SparkManager.onDisconnect(() => {
      dispatch(setConnectedDescriptor());
    });

    SparkManager.onResync(() => {
      const descriptor = queryConnectedDescriptor(getState());
      if (descriptor) {
        dispatch(syncDevices(true));
      }
    });

    SparkManager.onLoadFirmwareProgress((error, response) =>
      dispatch(updateLoadFirmwareProgress(error, response)));

    SparkManager.onTelemetryEvent((event) => dispatch(telemetryEvent(event)));

    registerShortcuts(dispatch);
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
          text: tt("msg_controller_has_old_firmware"),
          yesLabel: tt("lbl_update_old_firmware"),
          cancelLabel: tt("lbl_close"),
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

function registerShortcuts(dispatch: SparkDispatch): void {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      dispatch(stopAllDevices());
    }
  });
}
