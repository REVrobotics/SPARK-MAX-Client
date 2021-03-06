import {
  ConfirmationAnswer,
  createSignalInstance,
  DisplaySettings,
  fromDtoDeviceId,
  getDestinationId,
  ISignalInstanceState,
  SignalId,
  toDtoDeviceId,
  VirtualDeviceId
} from "../state";
import {SparkAction} from "./action-types";
import {forSelectedDevice} from "./action-creators";
import {
  queryConnectedDescriptor,
  queryControlValue,
  queryRunStateByDeviceId,
  queryDestinations,
  queryDeviceDisplay,
  queryDeviceId,
  queryDisplay,
  queryDisplaySettings,
  queryIsDeviceRunning,
  queryIsHasConnectedDevice,
  queryLastRunningDeviceIds,
  queryLastSyncedConsumers,
  queryRunningVirtualDeviceIds,
  querySelectedDeviceSignal,
  querySignalDestinations,
  querySignalNewStyle
} from "../selectors";
import {
  addSignalInstance,
  removeSignalInstance, setControlMode,
  setControlRangeValue,
  setControlValue,
  setDeviceRunning,
  setDeviceStopped,
  setDisplay,
  setDisplayQuickParam,
  setDisplaySelectedPidSlot,
  setDisplaySetting,
  setLastRunningDeviceIds,
  setLastSyncedConsumers,
  setSelectedSignal,
  setSignalInstanceField
} from "./atom-actions";
import {showConfirmation, showToastError} from "./ui-actions";
import {Intent} from "@blueprintjs/core";
import SparkManager from "../../managers/SparkManager";
import ConfigManager, {CONFIG_DISPLAY} from "../../managers/ConfigManager";
import {ConfigParam, ControlType, DisplayConfigDto, TelemetryEvent, TelemetryEventType} from "../../models/dto";
import {useErrorHandler} from "./error-actions";
import {createDisplayState, displayToDto, mergeDisplays} from "../display-utils";
import {
  addDataBuffer,
  changeDataBuffer, markDataBufferAsIgnoring,
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
 * Sets control mode
 */
export const sendControlMode = (virtualDeviceId: VirtualDeviceId, mode: ControlType): SparkAction<void> =>
  (dispatch, getState) => {
    const deviceDisplay = queryDeviceDisplay(getState(), virtualDeviceId);
    dispatch(setControlMode(virtualDeviceId, mode));
    SparkManager.setSetpoint(
      toDtoDeviceId(queryDeviceId(getState(), virtualDeviceId)!),
      deviceDisplay.run.pidSlot,
      deviceDisplay.run.value);
  };

/**
 * Sets control value
 */
export const sendControlValue = (virtualDeviceId: VirtualDeviceId, value: any): SparkAction<void> =>
  (dispatch, getState) => {
    const deviceDisplay = queryDeviceDisplay(getState(), virtualDeviceId);
    dispatch(setControlValue(virtualDeviceId, value));
    SparkManager.setSetpoint(
      toDtoDeviceId(queryDeviceId(getState(), virtualDeviceId)!),
      deviceDisplay.run.pidSlot,
      value);
  };

/**
 * Sets control value
 */
export const sendPidSlot = (virtualDeviceId: VirtualDeviceId, pidSlot: number): SparkAction<void> =>
  (dispatch, getState) => {
    const deviceDisplay = queryDeviceDisplay(getState(), virtualDeviceId);
    dispatch(setDisplaySelectedPidSlot(virtualDeviceId, pidSlot));
    SparkManager.setSetpoint(
      toDtoDeviceId(queryDeviceId(getState(), virtualDeviceId)!),
      pidSlot,
      deviceDisplay.run.value);
  };

/**
 * Sets control range value
 */
export const sendControlRangeValue = (virtualDeviceId: VirtualDeviceId,
                                      mode: ControlType,
                                      field: "min" | "max",
                                      value: any): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    dispatch(setControlRangeValue(virtualDeviceId, mode, field, value));
    dispatch(sendControlValue(virtualDeviceId, queryControlValue(getState(), virtualDeviceId)));
    return dispatch(persistDisplayConfig());
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
    const lastDestinations = queryLastSyncedConsumers(getState());
    const displaySettings = queryDisplaySettings(getState());
    setDataBufferOptions({
      timeSpan: displaySettings.timeSpan * 1000,
    });
    const currentDestinations = queryDestinations(getState());
    // Compare list of old/new destinations
    const result = diffArrays(lastDestinations, currentDestinations, getDestinationId);

    // Sync destinations
    result.added.forEach(addDataBuffer);
    result.removed.forEach(removeDataBuffer);
    // Consider the case of modified deviceId
    result.modified.forEach(({previous, next}) => {
      if (previous.deviceId !== next.deviceId) {
        changeDataBuffer(next);
      }
    });

    dispatch(setLastSyncedConsumers(currentDestinations));

    currentDestinations.forEach((destination) => {
      if (queryIsDeviceRunning(getState(), destination.virtualDeviceId)) {
        markDataBufferAsIgnoring(destination, false);
      } else {
        markDataBufferAsIgnoring(destination, true);
        markDataBufferAsStale(destination);
      }
    })
  };

/**
 * This methods sets up data producer.
 */
const syncDataProducers = (): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    return SparkManager.telemetryRunningSignals().then((previousDestinations) => {
      // Take ids of running devices
      const runningDeviceIds = queryRunningVirtualDeviceIds(getState())
        .map((virtualDeviceId) => queryDeviceId(getState(), virtualDeviceId)!)
        .map(toDtoDeviceId);
      const connectedDescriptor = queryConnectedDescriptor(getState());
      // Take all destinations of running devices
      const destinationsForRunningDevices = querySignalDestinations(getState())
        .filter(({deviceId}) => runningDeviceIds.includes(deviceId));

      // Extract all previous running devices
      const previousRunningDeviceIds = queryLastRunningDeviceIds(getState()).map(toDtoDeviceId);

      const deviceIdDiff = diffArrays(previousRunningDeviceIds, runningDeviceIds);

      deviceIdDiff.added.forEach((deviceId) => {
        const run = queryRunStateByDeviceId(
          getState(),
          connectedDescriptor!,
          fromDtoDeviceId(deviceId));
        if (run) {
          SparkManager.enableHeartbeat(deviceId, run.pidSlot, run.mode, run.value, 100);
        }
      });
      deviceIdDiff.removed.forEach((deviceId) => SparkManager.disableHeartbeat(deviceId));

      dispatch(setLastRunningDeviceIds(runningDeviceIds.map(fromDtoDeviceId)));

      if (previousRunningDeviceIds.length === 0 && runningDeviceIds.length > 0) {
        SparkManager.telemetryStart();
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

      if (previousRunningDeviceIds.length > 0 && runningDeviceIds.length === 0) {
        SparkManager.telemetryStop();
      }
    });
  };

export const telemetryEvent = (event: TelemetryEvent): SparkAction<void> =>
  (dispatch, getState) => {
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
export const sendSelectedDeviceControlMode = forSelectedDevice(sendControlMode);
export const sendSelectedDevicePidSlot = forSelectedDevice(sendPidSlot);
export const sendSelectedDeviceControlRangeValue = forSelectedDevice(sendControlRangeValue);
export const startSelectedDevice = forSelectedDevice(startDevice);
export const stopSelectedDevice = forSelectedDevice(stopDevice);
