import {ConfirmationAnswer, ProcessType, SparkAction} from "./types";
import {showConfirmation} from "./ui-actions";
import {getDevice, getSelectedDeviceId} from "./selectors";
import MotorConfiguration, {getFromID} from "../models/MotorConfiguration";
import SparkManager from "../managers/SparkManager";
import {fromDeviceId} from "./reducer";
import {delayPromise} from "../utils/promise-utils";
import {setBurnedMotorConfig, setMotorConfig, updateDeviceIsProcessing, updateDeviceProcessStatus} from "./actions";

export const burnConfiguration = (): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    const selectedDeviceId = getSelectedDeviceId(getState());
    if (selectedDeviceId == null) {
      return Promise.resolve();
    }

    const device = getDevice(getState(), selectedDeviceId);
    const activeMotorType = getFromID(device.currentConfig.type);

    return dispatch(showConfirmation({
      intent: "success",
      text: `Are you sure you want to update the configuration of your SPARK controller to a ${activeMotorType.name} motor?`,
      yesLabel: "Yes, Update",
      cancelLabel: "Cancel"
    })).then((answer) => {
      if (answer === ConfirmationAnswer.Cancel) {
        return;
      }

      dispatch(updateDeviceIsProcessing(selectedDeviceId, true, ProcessType.Save));
      return SparkManager.burnFlash(fromDeviceId(selectedDeviceId))
        .then(() => delayPromise(1000))
        .then(() =>
          SparkManager.getConfigFromParams(fromDeviceId(selectedDeviceId)).then((config: MotorConfiguration) => {
            dispatch(setMotorConfig(config));
            dispatch(setBurnedMotorConfig(new MotorConfiguration(config.name, config.type).fromJSON(config.toJSON())));
          }))
        .finally(() => {
          dispatch(updateDeviceIsProcessing(selectedDeviceId, false));
        });
    });
  };

export const resetConfiguration = (): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    const selectedDeviceId = getSelectedDeviceId(getState());
    if (selectedDeviceId == null) {
      return Promise.resolve();
    }

    return dispatch(showConfirmation({
      intent: "warning",
      text: "WARNING: You are about to restore the connected SPARK MAX controller to its factory default settings. Make sure to properly configure the controller before attempting to operate. Are you sure you want to proceed?",
      yesLabel: "Yes",
      cancelLabel: "Cancel"
    })).then((answer) => {
      if (answer === ConfirmationAnswer.Cancel) {
        return;
      }

      dispatch(updateDeviceIsProcessing(selectedDeviceId, true, ProcessType.Reset));
      dispatch(updateDeviceProcessStatus(selectedDeviceId, false, "RESETTING..."));

      return SparkManager.restoreDefaults(fromDeviceId(selectedDeviceId))
        .then(() => {
          dispatch(updateDeviceProcessStatus(selectedDeviceId, true, "GETTING PARAMETERS..."));
          return delayPromise(1000);
        })
        .then(() =>
          SparkManager.getConfigFromParams(fromDeviceId(selectedDeviceId)).then((config: MotorConfiguration) => {
            dispatch(setMotorConfig(selectedDeviceId, config));
            dispatch(setBurnedMotorConfig(new MotorConfiguration(config.name, config.type).fromJSON(config.toJSON())));
          }))
        .finally(() => {
          dispatch(updateDeviceIsProcessing(selectedDeviceId, false));
          dispatch(updateDeviceProcessStatus(selectedDeviceId, true, "CONNECTED"));
        });
    });
  };
