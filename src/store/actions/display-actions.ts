import {uniq} from "lodash";
import {
  ConfirmationAnswer,
  createSignalInstance,
  DisplaySettings, fromDtoDeviceId,
  getDestinationId,
  ISignalInstanceState,
  SignalId,
  toDtoDeviceId,
  VirtualDeviceId
} from "../state";
import {SparkAction} from "./action-types";
import {forSelectedDevice} from "./action-creators";
import {
  queryControlValueByDeviceId,
  queryDestinations,
  queryDeviceId,
  queryDisplay,
  queryDisplaySettings,
  queryIsDeviceRunning,
  queryIsHasConnectedDevice,
  queryLastSyncedConsumers,
  queryRunningVirtualDeviceIds,
  querySelectedDeviceSignal,
  querySignalDestinations,
  querySignalNewStyle
} from "../selectors";
import {
  addSignalInstance,
  removeSignalInstance,
  setControlValue,
  setDeviceRunning,
  setDeviceStopped,
  setDisplay,
  setDisplayQuickParam,
  setDisplaySetting, setLastSyncedConsumers,
  setSelectedSignal,
  setSignalInstanceField
} from "./atom-actions";
import {showConfirmation, showToastError} from "./ui-actions";
import {Intent} from "@blueprintjs/core";
import SparkManager from "../../managers/SparkManager";
import ConfigManager, {CONFIG_DISPLAY} from "../../managers/ConfigManager";
import {ConfigParam, DisplayConfigDto, TelemetryEvent, TelemetryEventType} from "../../models/dto";
import {useErrorHandler} from "./error-actions";
import {createDisplayState, displayToDto, mergeDisplays} from "../display-utils";
import {
  addDataBuffer,
  changeDataBuffer,
  markDataBufferAsStale,
  removeDataBuffer,
  setDataBufferOptions,
  writeDataChunk
} from "../data-stream";
import {diffArrays} from "../../utils/object-utils";

/**
 * This action synchronizes set of saved signals with the set of available signals and display only existing ones.
 */
export const syncSignals = (): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    // If we do not have connected device => clean display and remove all destinations
    if (!queryIsHasConnectedDevice(getState())) {
      dispatch(setDisplay(mergeDisplays(queryDisplay(getState()), createDisplayState(getState()))));
      return dispatch(syncDataParticipants());
    }

    // Load all signals from server and merge with saved list of signals
    return Promise.all([
      SparkManager.telemetryList(),
      ConfigManager.get<DisplayConfigDto | undefined>(CONFIG_DISPLAY),
    ]).then(([{signalsAvailable}, displayConfig]) => {
      // Build list of available and assigned signals, sync list of destinations
      dispatch(setDisplay(mergeDisplays(
        queryDisplay(getState()),
        createDisplayState(getState(), signalsAvailable, displayConfig))));
      return dispatch(syncDataParticipants());
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

/**
 * Adds signal and updates telemetry streaming if necessary
 */
export const addSignal = (virtualDeviceId: VirtualDeviceId, signalId: SignalId): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    const signal = querySelectedDeviceSignal(getState(), signalId);
    if (signal) {
      const color = querySignalNewStyle(getState());
      dispatch(addSignalInstance(createSignalInstance(virtualDeviceId, signal, color)));
      dispatch(setSelectedSignal(virtualDeviceId, signalId));
      return dispatch(syncDataParticipants())
        .then(() => dispatch(persistDisplayConfig()));
    } else {
      return Promise.resolve();
    }
  };

/**
 * Removes signal and updates telemetry streaming if necessary
 */
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
          return dispatch(syncDataParticipants())
            .then(() => dispatch(persistDisplayConfig()));
        } else {
          return Promise.resolve();
        }
      });
  };

/**
 * Sets and persist signal-specific settings
 */
export const setSignalField = (virtualDeviceId: VirtualDeviceId,
                               signalId: SignalId,
                               key: keyof ISignalInstanceState,
                               value: any): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    dispatch(setSignalInstanceField(virtualDeviceId, signalId, key, value));
    return dispatch(persistDisplayConfig());
  };

/**
 * Set and persist shared signal settings
 */
export const setAndPersistDisplaySetting = (key: keyof DisplaySettings, value: any): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    dispatch(setDisplaySetting(key, value));
    return dispatch(syncDataParticipants())
      .then(() => dispatch(persistDisplayConfig()));
  };

/**
 * Set and persist parameter-specific display settings
 */
export const setAndPersistDisplayQuickParam = (virtualDeviceId: VirtualDeviceId,
                                               param: ConfigParam,
                                               quick: boolean): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    dispatch(setDisplayQuickParam(virtualDeviceId, param, quick));
    return dispatch(persistDisplayConfig());
  };

/**
 * Sets control value
 */
export const sendControlValue = (virtualDeviceId: VirtualDeviceId, value: any): SparkAction<void> =>
  (dispatch, getState) => {
    SparkManager.setSetpoint(toDtoDeviceId(queryDeviceId(getState(), virtualDeviceId)!), value);
    dispatch(setControlValue(virtualDeviceId, value));
  };

export const startDevice = (virtualDeviceId: VirtualDeviceId): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    dispatch(setDeviceRunning(virtualDeviceId));
    return dispatch(syncDataParticipants());
  };

export const stopDevice = (virtualDeviceId: VirtualDeviceId): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    dispatch(setDeviceStopped(virtualDeviceId));
    return dispatch(syncDataParticipants());
  };

export const stopAllDevices = (): SparkAction<Promise<void>> =>
  (dispatch) => {
    dispatch(terminateStreaming());
    return dispatch(syncDataParticipants());
  };

export const terminateStreaming = (): SparkAction<void> =>
  (dispatch, getState) => {
    queryRunningVirtualDeviceIds(getState()).forEach((id) => dispatch(setDeviceStopped(id)));
  };

/**
 * There are two kind of participants in data streaming:
 * * *producer* emits data points
 * * *consumer* buffers all emitted data points to display it on the chart
 */
const syncDataParticipants = (): SparkAction<Promise<void>> =>
  (dispatch) => {
    dispatch(syncDataConsumers());
    return dispatch(syncDataProducers());
  };

/**
 * This method synchronizes list of data buffers used by chart library.
 */
const syncDataConsumers = (): SparkAction<void> =>
  (dispatch, getState) => {
    const oldDestinations = queryLastSyncedConsumers(getState());
    const displaySettings = queryDisplaySettings(getState());
    setDataBufferOptions({
      timeSpan: displaySettings.timeSpan * 1000,
    });
    const newDestinations = queryDestinations(getState());
    // Compare list of old/new destinations
    const result = diffArrays(oldDestinations, newDestinations, getDestinationId);

    // Sync destinations
    result.added.forEach(addDataBuffer);
    result.removed.forEach(removeDataBuffer);
    // Consider the case of modified deviceId
    result.modified.forEach(({previous, next}) => {
      if (previous.deviceId !== next.deviceId) {
        changeDataBuffer(next);
      }
    });

    dispatch(setLastSyncedConsumers(newDestinations));

    newDestinations.forEach((destination) => {
      if (!queryIsDeviceRunning(getState(), destination.virtualDeviceId)) {
        markDataBufferAsStale(destination);
      }
    })
  };

/**
 * This methods sets up data producer.
 */
const syncDataProducers = (): SparkAction<Promise<void>> =>
  (_, getState) => {
    return SparkManager.telemetryRunningSignals().then((previousDestinations) => {
      // Take ids of running devices
      const runningDeviceIds = queryRunningVirtualDeviceIds(getState())
        .map((virtualDeviceId) => queryDeviceId(getState(), virtualDeviceId)!)
        .map(toDtoDeviceId);
      // Take all destinations of running devices
      const destinationsForRunningDevices = querySignalDestinations(getState())
        .filter(({deviceId}) => runningDeviceIds.includes(deviceId));

      // Extract all previous running devices
      const previousRunningDeviceIds = uniq(previousDestinations.map(({deviceId}) => deviceId));

      const deviceIdDiff = diffArrays(previousRunningDeviceIds, runningDeviceIds);

      deviceIdDiff.added.forEach((deviceId) => {
        SparkManager.enableHeartbeat(deviceId, queryControlValueByDeviceId(getState(), fromDtoDeviceId(deviceId)), 40);
      });
      deviceIdDiff.removed.forEach((deviceId) => SparkManager.disableHeartbeat(deviceId));

      if (previousRunningDeviceIds.length === 0 && runningDeviceIds.length > 0) {
        SparkManager.telemetryStart();
      } else if (previousRunningDeviceIds.length > 0 && runningDeviceIds.length === 0) {
        SparkManager.telemetryStop();
        return;
      }

      const destinationDiff = diffArrays(
        previousDestinations,
        destinationsForRunningDevices,
        ({deviceId, signalId}) => `${deviceId}:${signalId}`);

      destinationDiff.added.forEach((destination) => {
        SparkManager.telemetryAddSignal(destination.deviceId, destination.signalId);
      });
      destinationDiff.removed.forEach((destination) => {
        SparkManager.telemetryRemoveSignal(destination.deviceId, destination.signalId);
      });
    });
  };

export const telemetryEvent = (event: TelemetryEvent): SparkAction<void> =>
  (dispatch, getState) => {
    console.log("telemetry event", event);
    switch(event.type) {
      case TelemetryEventType.Start:
        break;
      case TelemetryEventType.Stop:
        terminateStreaming();
        break;
      case TelemetryEventType.Error:
        showToastError(tt("msg_streaming_error"));
        terminateStreaming();
        break;
      case TelemetryEventType.Data:
        writeDataChunk(event.data);
        break;
    }
  };

export const addSelectedDeviceSignal = forSelectedDevice(addSignal);
export const removeSelectedDeviceSignal = forSelectedDevice(removeSignal);
export const setSelectedDeviceSignalField = forSelectedDevice(setSignalField);
export const setAndPersistSelectedDeviceDisplayQuickParam = forSelectedDevice(setAndPersistDisplayQuickParam);
export const sendSelectedDeviceControlValue = forSelectedDevice(sendControlValue);
export const startSelectedDevice = forSelectedDevice(startDevice);
export const stopSelectedDevice = forSelectedDevice(stopDevice);
