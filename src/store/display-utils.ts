import {flatMap, fromPairs, groupBy, keyBy, keys, mapKeys, mapValues, omit, pick, pickBy} from "lodash";
import {
  createSignalInstance,
  DEFAULT_DISPLAY_SETTINGS,
  getVirtualDeviceId,
  IApplicationState,
  IDisplayState,
  ISignalState,
  PanelName,
} from "./state";
import {ConfigParamGroupName, DisplayConfigDto, DisplayDeviceSignalDto} from "../models/dto";
import {maybeMap, removeFields, setField, setFields} from "../utils/object-utils";
import {queryDeviceId, queryDevicesByDeviceId, querySignalNewStyle} from "./selectors";

/**
 * This method merges settings from next display to the current one.
 */
export const mergeDisplays = (currentDisplay: IDisplayState, nextDisplay: IDisplayState): IDisplayState => {
  // Remove ALL removed signals and signal instances from each device
  const mergedDevices = mapValues(currentDisplay.devices, (device, virtualDeviceId) => {
    const nextDevice = nextDisplay.devices[virtualDeviceId];
    const nextDeviceInstances = nextDevice ? nextDevice.assignedSignals : {};
    const nextDeviceSignals = (nextDevice ? nextDevice.signals : undefined) || [];
    const nextDeviceSignalById = keyBy(nextDeviceSignals, (signal) => signal.id);

    // Update set of existing signals
    const withExistingSignals = setField(device, "signals", nextDeviceSignals);

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

  return {
    ...currentDisplay,
    devices: mergedDevices,
    settings: nextDisplay.settings,
    raw: nextDisplay.raw,
  };
};
export const displayToDto = (state: IApplicationState): DisplayConfigDto => {
  const {display} = state;

  const deviceByVirtualId = mapValues(display.devices, (device) => ({
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

export const displayFromDto = (state: IApplicationState,
                               allSignals: ISignalState[],
                               config?: DisplayConfigDto): IDisplayState => {
  // Group devices by device id
  const devicesByVirtualId = config ? mapDeviceIdKeyToVirtualId(state, config.devices) : {};
  // Group all signals by device and by signal id
  const signalsByVirtualId = mapDeviceIdKeyToVirtualId(state, groupBy(allSignals, (signal) => signal.deviceId));

  // We save raw settings without found devices
  const raw = config ?
    {...config, devices: omit(config.devices, keys(devicesByVirtualId))} as DisplayConfigDto
    : undefined;

  return {
    selectedPanel: PanelName.Run,
    raw,
    settings: config ? config.settings : DEFAULT_DISPLAY_SETTINGS,
    devices: mapValues(devicesByVirtualId, (device, virtualDeviceId) => {
      // Take all existing signals
      const deviceSignals = signalsByVirtualId[virtualDeviceId];
      const deviceSignalsById = keyBy(deviceSignals, (signal) => signal.id);
      // Filter saved instances
      const configInstances = pickBy(device.signals, (_, id) => deviceSignalsById[id]);

      return {
        selectedParamGroupId: ConfigParamGroupName.GROUPNAME_Basic,
        assignedSignals: mapValues(
          configInstances,
          (configInstance: DisplayDeviceSignalDto, signalId) => ({
            ...createSignalInstance(
              virtualDeviceId,
              deviceSignalsById[signalId],
              querySignalNewStyle(state, virtualDeviceId, Number(signalId))),
            min: configInstance.min,
            max: configInstance.max,
            autoScaled: configInstance.autoScaled,
          })),
        signals: deviceSignals,
        quickBar: device.quickBar,
      };
    }),
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
