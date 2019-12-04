import {
  flatMap,
  fromPairs,
  groupBy,
  keyBy,
  keys,
  mapKeys,
  mapValues,
  omit,
  partition,
  pick,
  pickBy,
  uniq
} from "lodash";
import {
  createSignalInstance,
  DEFAULT_DEVICE_RUN,
  DEFAULT_DISPLAY_SETTINGS, getDeviceId, getSignalId,
  getVirtualDeviceId,
  IApplicationState,
  IDisplayState,
  ISignalState,
  PanelName,
  QuickPanelName, toDtoDeviceId,
} from "./state";
import {
  ConfigParamGroupName,
  CtrlType,
  DisplayConfigDto,
  DisplayDeviceDto,
  DisplayDeviceSignalDto
} from "../models/dto";
import {maybeMap, removeFields, setField, setFields} from "../utils/object-utils";
import {queryConnectedDevices, queryDeviceId, queryDevicesByDeviceId, querySignalStylePalette} from "./selectors";

const CONTROL_MODE_CONSTRAINTS = [
  {mode: CtrlType.DutyCycle, min: -1, max: 1, stepSize: 0.01, minorStepSize: 0.01},
  {mode: CtrlType.Velocity, min: -1000, max: 1000, stepSize: 0.1, minorStepSize: 0.1},
  {mode: CtrlType.Position, min: -1000, max: 1000, stepSize: 0.1, minorStepSize: 0.1},
];

/**
 * This method merges settings from next display to the current one.
 */
export const mergeDisplays = (currentDisplay: IDisplayState, nextDisplay: IDisplayState): IDisplayState => {
  // Remove ALL removed devices
  const existingDevices = pickBy(
    currentDisplay.devices,
    ((_, virtualDeviceId) => nextDisplay.devices[virtualDeviceId]));

  // Remove ALL removed signal instances from each device
  const mergedDevices = mapValues(existingDevices, (device, virtualDeviceId) => {
    const nextDevice = nextDisplay.devices[virtualDeviceId];
    const nextDeviceInstances = nextDevice ? nextDevice.assignedSignals : {};
    const nextDeviceSignals = (nextDevice ? nextDevice.signals : undefined) || [];
    const nextDeviceSignalById = keyBy(nextDeviceSignals, (signal) => signal.id);

    // Update set of existing signals
    const withExistingSignals = setFields(device, {
      signals: nextDeviceSignals,
      quickBar: nextDevice ? nextDevice.quickBar : [],
      run: setField(device.run, "ranges", nextDevice.run.ranges),
    });

    // Ensure that non-existent signal is not selected
    const withSelectedSignal = setField(
      withExistingSignals,
      "selectedSignalId",
      maybeMap(nextDeviceSignals.find((signal) => signal.id === device.selectedSignalId), (signal) => signal.id));

    // Find all removed signal IDs
    const removedSignalIds = keys(device.assignedSignals)
      .map(Number)
      .filter((signalId) => nextDeviceSignalById[signalId] == null);

    // Delete instances of all removed signals
    return setField(
      withSelectedSignal,
      "assignedSignals",
      setFields(
        removeFields(withSelectedSignal.assignedSignals, removedSignalIds),
        nextDeviceInstances));
  });

  // Add new devices
  const addedDevices = pickBy(
    nextDisplay.devices,
    (_, virtualDeviceId) => currentDisplay.devices[virtualDeviceId] == null);

  return {
    ...currentDisplay,
    devices: {
      ...mergedDevices,
      ...addedDevices,
    },
    settings: nextDisplay.settings,
    raw: nextDisplay.raw,
  };
};

/**
 * Retrieves display settings to be saved into configuration file
 */
export const displayToDto = (state: IApplicationState): DisplayConfigDto => {
  const {display} = state;

  const deviceByVirtualId = mapValues(display.devices, (device) => ({
    ranges: mapValues(device.run.ranges, (range) => pick(range, "min", "max")),
    quickBar: device.quickBar,
    signals: mapValues(device.assignedSignals, (signal) => pick(signal, ["autoScaled", "min", "max"]))
  }));

  return {
    settings: display.settings,
    // We have to store devices under real Device ID
    devices: {
      ...(display.raw ? display.raw.devices : {}),
      ...mapKeys(deviceByVirtualId, (_, virtualDeviceId) => queryDeviceId(state, virtualDeviceId)),
    },
  };
};

/**
 * Creates display from the saved display configuration
 */
export const createDisplayState = (state: IApplicationState,
                                   allSignals: ISignalState[] = [],
                                   config?: DisplayConfigDto): IDisplayState => {
  // Build display state only for connected devices
  const connectedDeviceVirtualIds = queryConnectedDevices(state).map(getVirtualDeviceId);

  // Group devices by device id
  const configDevicesByVirtualId = config ? mapDeviceIdKeyToVirtualId(state, config.devices) : {};
  const normalizedSignals = normalizeAvailableSignals(state, allSignals);
  // Group all signals by device and by signal id
  const signalsByVirtualId = mapDeviceIdKeyToVirtualId(state, groupBy(normalizedSignals, (signal) => signal.deviceId));

  // We save raw settings without connected devices.
  const raw = config ?
    {...config, devices: omit(config.devices, connectedDeviceVirtualIds)} as DisplayConfigDto
    : undefined;

  const stylePalette = querySignalStylePalette(state);

  return {
    selectedPanel: PanelName.Run,
    selectedQuickPanel: QuickPanelName.PIDF,
    raw,
    settings: config ? config.settings : DEFAULT_DISPLAY_SETTINGS,
    devices: fromPairs(connectedDeviceVirtualIds.map((virtualDeviceId) => {
      const configDevice: DisplayDeviceDto = configDevicesByVirtualId[virtualDeviceId] || {quickBar: [], signals: []};

      // Take all existing signals
      const deviceSignals = signalsByVirtualId[virtualDeviceId] || [];
      const deviceSignalsById = keyBy(deviceSignals, getSignalId);
      // Filter saved instances
      const configInstances = pickBy(configDevice.signals, (_, id) => deviceSignalsById[id]);

      return [virtualDeviceId, {
        selectedParamGroupId: ConfigParamGroupName.GROUPNAME_Basic,
        assignedSignals: mapValues(
          configInstances,
          (configInstance: DisplayDeviceSignalDto, signalId) => ({
            ...createSignalInstance(
              virtualDeviceId,
              deviceSignalsById[signalId],
              stylePalette()),
            min: configInstance.min,
            max: configInstance.max,
            autoScaled: configInstance.autoScaled,
          })),
        signals: deviceSignals,
        quickBar: configDevice.quickBar,
        run: {
          ...DEFAULT_DEVICE_RUN,
          ranges: fromPairs(CONTROL_MODE_CONSTRAINTS.map((constraint) => [
            constraint.mode,
            // Use saved or default one configuration
            {...omit(constraint, "mode"), ...(configDevice.ranges ? configDevice.ranges[constraint.mode] : {})},
          ])),
        },
        pidSlot: 0,
      }];
    })),
    lastSyncedConsumers: [],
    lastRunningDeviceIds: [],
  };
};

/**
 * This method transforms key of dictionary object from {@link DeviceId} to {@link VirtualDeviceId}.
 * If `deviceId` cannot be mapped, this field is absent in the result map.
 */
export const mapDeviceIdKeyToVirtualId = <T>(state: IApplicationState,
                                             obj: { [deviceId: number]: T }): { [virtualDeviceId: string]: T } => {
  return fromPairs(flatMap(
    keys(obj),
    (deviceId) => queryDevicesByDeviceId(state, Number(deviceId)).map((device) => [
      getVirtualDeviceId(device),
      obj[deviceId],
    ])));
};

/**
 * Normalized given signals.
 * If signal does not have device ID, it means that this signal available for ALL connected devices.
 * If we have signals without device ID, we generate this signal for ALL connected devices.
 */
const normalizeAvailableSignals = (state: IApplicationState, signals: ISignalState[]) => {
  const [withDeviceId, withoutDeviceId] = partition(signals, ({deviceId}) => deviceId);
  if (withoutDeviceId.length) {
    const allDeviceIds = uniq(queryConnectedDevices(state).map(getDeviceId));
    return withDeviceId.concat(flatMap(
      allDeviceIds,
      (deviceId) => withoutDeviceId.map((signal) => ({...signal, deviceId: toDtoDeviceId(deviceId)}))));
  } else {
    return withDeviceId;
  }
};
