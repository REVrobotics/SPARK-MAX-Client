import {
  ConfirmationAnswer,
  createSignalInstance,
  DisplaySettings,
  ISignalInstanceState,
  SignalId,
  VirtualDeviceId
} from "../state";
import {SparkAction} from "./action-types";
import {forSelectedDevice} from "./action-creators";
import {queryIsHasConnectedDevice, querySignal, querySignalNewStyle} from "../selectors";
import {
  addSignalInstance,
  removeSignalInstance,
  setDisplay,
  setDisplaySetting,
  setSelectedSignal,
  setSignalInstanceField
} from "./atom-actions";
import {showConfirmation} from "./ui-actions";
import {Intent} from "@blueprintjs/core";
import SparkManager from "../../managers/SparkManager";
import ConfigManager, {CONFIG_DISPLAY} from "../../managers/ConfigManager";
import {DisplayConfigDto} from "../../models/dto";
import {useErrorHandler} from "./error-actions";
import {displayFromDto, displayToDto, mergeDisplays} from "../display-utils";

export const syncSignals = (): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    if (!queryIsHasConnectedDevice(getState())) {
      const state = getState();
      dispatch(setDisplay(mergeDisplays(state.display, displayFromDto(state, []))));
      dispatch(syncStream());
      return Promise.resolve();
    }

    return Promise.all([
      SparkManager.telemetryList(),
      ConfigManager.get<DisplayConfigDto | undefined>(CONFIG_DISPLAY),
    ]).then(([{signalsAvailable}, displayConfig]) => {
      const state = getState();
      dispatch(setDisplay(mergeDisplays(state.display, displayFromDto(state, signalsAvailable, displayConfig))));
      dispatch(syncStream());
    }).catch(useErrorHandler(dispatch));
  };

export const persistDisplayConfig = (): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    return ConfigManager.set(CONFIG_DISPLAY, displayToDto(getState()))
      .catch(useErrorHandler(dispatch));
  };

export const addSignal = (virtualDeviceId: VirtualDeviceId, signalId: SignalId): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    const signal = querySignal(getState(), signalId);
    if (signal) {
      const color = querySignalNewStyle(getState(), virtualDeviceId, signalId);
      dispatch(addSignalInstance(createSignalInstance(virtualDeviceId, signal, color)));
      dispatch(setSelectedSignal(virtualDeviceId, signalId));
      dispatch(syncStream());
      return dispatch(persistDisplayConfig());
    } else {
      return Promise.resolve();
    }
  };

export const removeSignal = (virtualDeviceId: VirtualDeviceId, signalId: SignalId): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    return dispatch(showConfirmation({
      intent: Intent.SUCCESS,
      text: tt("msg_remove_signal"),
      yesLabel: tt("lbl_yes"),
      cancelLabel: tt("lbl_no"),
    }))
      .then((answer) => {
        if (answer === ConfirmationAnswer.Yes) {
          dispatch(removeSignalInstance(virtualDeviceId, signalId));
          dispatch(syncStream());
          return dispatch(persistDisplayConfig());
        } else {
          return Promise.resolve();
        }
      });
  };

export const setSignalField = (virtualDeviceId: VirtualDeviceId,
                               signalId: SignalId,
                               key: keyof ISignalInstanceState,
                               value: any): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    dispatch(setSignalInstanceField(virtualDeviceId, signalId, key, value));
    return dispatch(persistDisplayConfig());
  };

export const setAndPersistDisplaySetting = (key: keyof DisplaySettings, value: any): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    dispatch(setDisplaySetting(key, value));
    return dispatch(persistDisplayConfig());
  };

const syncStream = (): SparkAction<void> =>
  (_, getState) => {
    console.log("resync subscription");
  };

export const addSelectedDeviceSignal = forSelectedDevice(addSignal);
export const removeSelectedDeviceSignal = forSelectedDevice(removeSignal);
export const setSelectedDeviceSignalField = forSelectedDevice(setSignalField);
