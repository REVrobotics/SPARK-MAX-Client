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
import {
  queryDestinations,
  queryDisplay,
  queryDisplaySettings,
  queryIsHasConnectedDevice,
  querySignal,
  querySignalNewStyle
} from "../selectors";
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
import {createDisplayState, displayToDto, mergeDisplays} from "../display-utils";
import {addDestination, changeDestination, removeDestination, setStreamOptions} from "../data-stream";
import {diffArrays} from "../../utils/object-utils";

export const syncSignals = (): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    // If we do not have connected device => clean display and remove all destinations
    if (!queryIsHasConnectedDevice(getState())) {
      dispatch(runAndSyncDestinations(() =>
        dispatch(setDisplay(mergeDisplays(queryDisplay(getState()), createDisplayState(getState()))))));
      return Promise.resolve();
    }

    // Load all signals from server and merge with saved list of signals
    return Promise.all([
      SparkManager.telemetryList(),
      ConfigManager.get<DisplayConfigDto | undefined>(CONFIG_DISPLAY),
    ]).then(([{signalsAvailable}, displayConfig]) => {
      // Build list of available and assigned signals, sync list of destinations
      dispatch(runAndSyncDestinations(() =>
        dispatch(setDisplay(mergeDisplays(
          queryDisplay(getState()),
          createDisplayState(getState(), signalsAvailable, displayConfig))))));
    }).catch(useErrorHandler(dispatch));
  };

export const persistDisplayConfig = (): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    return ConfigManager.set(CONFIG_DISPLAY, displayToDto(getState()))
      .catch(useErrorHandler(dispatch));
  };

/**
 * When deviceId is changed, we have to
 * * update deviceId associations for existing set of signals
 * * change stream destination
 * * update persisted display configuration
 */
export const syncSignalDeviceId = (virtualDeviceId: VirtualDeviceId): SparkAction<Promise<void>> =>
  (dispatch) => {
    return dispatch(syncSignals())
      .then(() => dispatch(persistDisplayConfig()));
  };

export const addSignal = (virtualDeviceId: VirtualDeviceId, signalId: SignalId): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    const signal = querySignal(getState(), signalId);
    if (signal) {
      const color = querySignalNewStyle(getState(), virtualDeviceId, signalId);
      dispatch(runAndSyncDestinations(() =>
        dispatch(addSignalInstance(createSignalInstance(virtualDeviceId, signal, color)))));
      dispatch(setSelectedSignal(virtualDeviceId, signalId));
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
          dispatch(runAndSyncDestinations(() => dispatch(removeSignalInstance(virtualDeviceId, signalId))));
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
    dispatch(runAndSyncDestinations(() => dispatch(setDisplaySetting(key, value))));
    return dispatch(persistDisplayConfig());
  };

/**
 * This action runs specified operation (potentially mutable) and analyzes if list of signal instances was changed.
 * If some signals were added/removed, corresponding destinations are added/removed correspondingly.
 */
const runAndSyncDestinations = (run: () => void): SparkAction<void> =>
  (dispatch, getState) => {
    const oldDestinations = queryDestinations(getState());
    run();
    const displaySettings = queryDisplaySettings(getState());
    setStreamOptions({
      timeSpan: displaySettings.timeSpan * 1000,
    });
    const newDestinations = queryDestinations(getState());
    // Compare list of old/new destinations
    const result = diffArrays(
      oldDestinations,
      newDestinations,
      (destination) => `${destination.virtualDeviceId}:${destination.signalId}`);

    // Sync destinations
    result.added.forEach(addDestination);
    result.removed.forEach(removeDestination);
    // Consider the case of modified deviceId
    result.modified.forEach(({previous, next}) => {
      if (previous.deviceId !== next.deviceId) {
        changeDestination(next);
      }
    });
  };


export const addSelectedDeviceSignal = forSelectedDevice(addSignal);
export const removeSelectedDeviceSignal = forSelectedDevice(removeSignal);
export const setSelectedDeviceSignalField = forSelectedDevice(setSignalField);
