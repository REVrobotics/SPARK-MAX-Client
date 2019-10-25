import {flatMap, isEmpty, toPairs, uniq} from "lodash";
import {
  ConfirmationAnswer,
  createSignalInstance,
  DisplaySettings,
  getDestinationId,
  ISignalInstanceState,
  SignalId,
  VirtualDeviceId
} from "../state";
import {SparkAction} from "./action-types";
import {forSelectedDevice} from "./action-creators";
import {
  queryDestinations,
  queryDeviceId,
  queryDisplay,
  queryDisplaySettings,
  queryIsHasConnectedDevice,
  queryRunningVirtualDeviceIds,
  querySelectedDeviceSignal,
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
  setDisplaySetting,
  setSelectedSignal,
  setSignalInstanceField
} from "./atom-actions";
import {showConfirmation} from "./ui-actions";
import {Intent} from "@blueprintjs/core";
import SparkManager from "../../managers/SparkManager";
import ConfigManager, {CONFIG_DISPLAY} from "../../managers/ConfigManager";
import {ConfigParam, DisplayConfigDto} from "../../models/dto";
import {useErrorHandler} from "./error-actions";
import {createDisplayState, displayToDto, mergeDisplays} from "../display-utils";
import {addDestination, changeDestination, removeDestination, setStreamOptions, writeDataChunk} from "../data-stream";
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
    const signal = querySelectedDeviceSignal(getState(), signalId);
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

export const setAndPersistDisplayQuickParam = (virtualDeviceId: VirtualDeviceId,
                                               param: ConfigParam,
                                               quick: boolean): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    dispatch(setDisplayQuickParam(virtualDeviceId, param, quick));
    return dispatch(persistDisplayConfig());
  };

export const sendControlValue = (virtualDeviceId: VirtualDeviceId, value: any): SparkAction<void> =>
  (dispatch, getState) => {
    dispatch(setControlValue(virtualDeviceId, value));
  };

export const startDevice = (virtualDeviceId: VirtualDeviceId): SparkAction<void> =>
  (dispatch, getState) => {
    dispatch(setDeviceRunning(virtualDeviceId));
    dispatch(syncStreams());
  };

export const stopDevice = (virtualDeviceId: VirtualDeviceId): SparkAction<void> =>
  (dispatch, getState) => {
    dispatch(setDeviceStopped(virtualDeviceId));
    dispatch(syncStreams());
  };

export const stopAllDevices = (): SparkAction<void> =>
  (dispatch, getState) => {
    queryRunningVirtualDeviceIds(getState()).forEach((id) => dispatch(setDeviceStopped(id)));
    dispatch(syncStreams());
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
    const result = diffArrays(oldDestinations, newDestinations, getDestinationId);

    // Sync destinations
    result.added.forEach(addDestination);
    result.removed.forEach(removeDestination);
    // Consider the case of modified deviceId
    result.modified.forEach(({previous, next}) => {
      if (previous.deviceId !== next.deviceId) {
        changeDestination(next);
      }
    });

    dispatch(syncStreams());
  };

const syncStreams = (): SparkAction<void> =>
  (_, getState) => {
    // Take ids of running devices
    const runningVirtualDeviceIds = queryRunningVirtualDeviceIds(getState());
    // Take all destinations of running devices
    const streamingDestinations = queryDestinations(getState())
      .filter(({virtualDeviceId}) => runningVirtualDeviceIds.includes(virtualDeviceId));

    // Take all previous destinations
    const previousStreamingDestinations = flatMap(
      toPairs(mockedStreams),
      ([virtualDeviceId, signalStreams]) => toPairs(signalStreams).map(([signalId, stream]) => ({
        virtualDeviceId,
        deviceId: stream.getDeviceId(),
        signalId: Number(signalId),
      })));
    // Extract all previous running devices
    const previousRunningVirtualDeviceIds = uniq(previousStreamingDestinations.map(({virtualDeviceId}) =>
      virtualDeviceId));

    const virtualDeviceIdDiff = diffArrays(previousRunningVirtualDeviceIds, runningVirtualDeviceIds);
    const streamingToBeStartedFor = virtualDeviceIdDiff.added;
    const streamingToBeStoppedFor = virtualDeviceIdDiff.removed;

    // Take all previous destinations for devices still running
    // const onlyRunningPreviousDestinations = previousStreamingDestinations
    //   .filter(({virtualDeviceId}) => !streamingToBeStoppedFor.includes(virtualDeviceId));
    // const destinationDiff = diffArrays(onlyRunningPreviousDestinations, streamingDestinations, getDestinationId);
    const destinationDiff = diffArrays(previousStreamingDestinations, streamingDestinations, getDestinationId);

    streamingToBeStartedFor.forEach((id) => console.log("start device", queryDeviceId(getState(), id)));
    streamingToBeStoppedFor.forEach((id) => console.log("stop device", queryDeviceId(getState(), id)));

    // TODO: mocked streams, should be removed in future
    destinationDiff.added.forEach((destination) => {
      ensureMockStream(destination.virtualDeviceId)[destination.signalId] = createMockedStream(
        destination.deviceId,
        destination.signalId);
      console.log("add signal", destination.deviceId, destination.signalId);
    });
    destinationDiff.removed.forEach((destination) => {
      const streamsForDevice = ensureMockStream(destination.virtualDeviceId);
      streamsForDevice[destination.signalId].destroy();
      delete streamsForDevice[destination.signalId];
      if (isEmpty(streamsForDevice)) {
        removeMockStream(destination.virtualDeviceId);
      }
      console.log("remove signal", destination.deviceId, destination.signalId);
    });
    destinationDiff.modified.forEach(({previous, next}) => {
      if (previous.deviceId !== next.deviceId) {
        ensureMockStream(next.virtualDeviceId)[next.signalId].setDeviceId(next.deviceId);
      }
    });
  };

const ensureMockStream = (virtualDeviceId: VirtualDeviceId) => {
  const byDevice = mockedStreams[virtualDeviceId] || {};
  mockedStreams[virtualDeviceId] = byDevice;
  return byDevice;
};

const removeMockStream = (virtualDeviceId: VirtualDeviceId) => {
  delete mockedStreams[virtualDeviceId];
};

const createMockedStream = (deviceId: number, signalId: number): MockedStream => {
  let timeoutId: any;
  const startTime = new Date().getTime();
  const maxLimit = 40 + Math.floor(Math.random() * 60);

  const nextTick = (deviceIdToUse: number) => {
    timeoutId = setTimeout(() => {
      writeDataChunk([{
        deviceId: deviceIdToUse,
        id: signalId,
        expectedMin: 0,
        expectedMax: 0,
        name: "",
        timestamp_ms: new Date().getTime() - startTime,
        units: "",
        updateRate_ms: 0,
        value: Math.random() * maxLimit,
      }]);
      nextTick(deviceId);
    }, 300);
  };

  nextTick(deviceId);

  return {
    getDeviceId: () => deviceId,
    setDeviceId: (newDeviceId: number) => {
      deviceId = newDeviceId;
    },
    destroy: () => {
      clearTimeout(timeoutId);
    },
  };
};

interface MockedStream {
  getDeviceId(): number;

  setDeviceId(deviceId: number): void;

  destroy(): void;
}

const mockedStreams: { [virtualDeviceId: string]: { [signalId: number]: MockedStream } } = {};

export const addSelectedDeviceSignal = forSelectedDevice(addSignal);
export const removeSelectedDeviceSignal = forSelectedDevice(removeSignal);
export const setSelectedDeviceSignalField = forSelectedDevice(setSignalField);
export const setAndPersistSelectedDeviceDisplayQuickParam = forSelectedDevice(setAndPersistDisplayQuickParam);
export const sendSelectedDeviceControlValue = forSelectedDevice(sendControlValue);
export const startSelectedDevice = forSelectedDevice(startDevice);
export const stopSelectedDevice = forSelectedDevice(stopDevice);
