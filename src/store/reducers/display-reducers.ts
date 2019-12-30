import {clamp, difference, fromPairs} from "lodash";
import {
  createDeviceDisplayState,
  DEFAULT_DISPLAY_SETTINGS,
  getSignalId,
  getVirtualDeviceId,
  IApplicationState,
  IDeviceDisplayState,
  IDisplayExportSettings,
  IDisplayState,
  ISignalInstanceState,
  PanelName,
  QuickPanelName
} from "../state";
import {ActionType, ApplicationActions} from "../actions";
import {
  insertArrayElementSorted,
  removeArrayElementSorted,
  removeField,
  removeFields,
  setField,
  setFields,
  setNestedField
} from "../../utils/object-utils";
import {queryDeviceDisplay, queryDeviceParameterValue, queryDevicesInOrder} from "../selectors";
import {roundDecimal} from "../../utils/number-utils";
import {ConfigParam} from "../../models/proto-gen/SPARK-MAX-Types_dto_pb";

const displayInitialState: IDisplayState = {
  selectedPanel: PanelName.Run,
  selectedQuickPanel: QuickPanelName.PIDF,
  settings: DEFAULT_DISPLAY_SETTINGS,
  devices: {},
  lastSyncedConsumers: [],
  lastRunningDeviceIds: [],
  exportSettings: {
    isCsvExportInProcess: false,
    csv: {
      excludeGaps: false,
      includeTimeColumn: true,
      timeInterval: 1000,
    },
  },
};

const displayReducer = (state: IDisplayState = displayInitialState, action: ApplicationActions) => {
  switch (action.type) {
    case ActionType.SET_LAST_RUNNING_DEVICE_IDS:
      return setField(state, "lastRunningDeviceIds", action.payload.deviceIds);
    case ActionType.SET_LAST_SYNCED_CONSUMERS:
      return setField(state, "lastSyncedConsumers", action.payload.destinations);
    case ActionType.SET_DISPLAY:
      return action.payload.display;
    case ActionType.SET_DISPLAY_SELECTED_PANEL:
      return setField(state, "selectedPanel", action.payload.panel);
    case ActionType.SET_DISPLAY_SELECTED_QUICK_PANEL:
      return setField(state, "selectedQuickPanel", action.payload.panel);
    case ActionType.SET_DISPLAY_SETTING:
      return setField(state, "settings", setField(state.settings, action.payload.key, action.payload.value));
    case ActionType.SET_DISPLAY_SELECTED_PARAM_GROUP:
    case ActionType.SET_DISPLAY_QUICK_PARAM:
    case ActionType.SET_SELECTED_SIGNAL:
    case ActionType.ADD_SIGNAL_INSTANCE:
    case ActionType.REMOVE_SIGNAL_INSTANCE:
    case ActionType.SET_SIGNAL_INSTANCE_FIELD:
    case ActionType.SET_CONTROL_MODE:
    case ActionType.SET_CONTROL_VALUE:
    case ActionType.SET_CONTROL_RANGE_VALUE:
    case ActionType.SET_RUNNING_STATUS:
    case ActionType.SET_DISPLAY_SELECTED_PID_SLOT:
      return setNestedField(
        state,
        ["devices", action.payload.virtualDeviceId],
        deviceDisplayReducer(state.devices[action.payload.virtualDeviceId], action));
    case ActionType.SET_CSV_EXPORT_SETTING:
    case ActionType.SET_CSV_EXPORT_DIALOG_OPENED:
      return setField(state, "exportSettings", exportSettingsReducer(state.exportSettings, action));
    default:
      return state;
  }
};

function exportSettingsReducer(exportSettings: IDisplayExportSettings, action: ApplicationActions) {
  switch (action.type) {
    case ActionType.SET_CSV_EXPORT_DIALOG_OPENED:
      return setField(exportSettings, "isCsvExportInProcess", action.payload.isOpened);
    case ActionType.SET_CSV_EXPORT_SETTING:
      return setField(exportSettings, "csv", setField(exportSettings.csv, action.payload.key, action.payload.value));
    default:
      return exportSettings;
  }
}

const deviceDisplayReducer = (state: IDeviceDisplayState, action: ApplicationActions) => {
  switch (action.type) {
    case ActionType.SET_DISPLAY_SELECTED_PID_SLOT:
      return setField(state, "run", setField(state.run, "pidSlot", action.payload.pidSlot));
    case ActionType.SET_RUNNING_STATUS:
      return setField(state, "run", setField(state.run, "running", action.payload.running));
    case ActionType.SET_CONTROL_MODE:
      return setField(
        state,
        "run",
        setField(state.run, "mode", action.payload.mode));
    case ActionType.SET_CONTROL_VALUE:
      return setField(
        state,
        "run",
        setField(state.run, "value", roundDecimal(action.payload.value || 0, 2)));
    case ActionType.SET_CONTROL_RANGE_VALUE: {
      const rangeValue = roundDecimal(action.payload.value || 0, 2);
      const currentRange = state.run.ranges[action.payload.mode];
      const nextRange = setField(
        currentRange,
        action.payload.field,
        action.payload.field === "min" ?
          clamp(rangeValue, Number.NEGATIVE_INFINITY, currentRange.max) :
          clamp(rangeValue, currentRange.min, Number.POSITIVE_INFINITY));

      return setField(
        state,
        "run",
        setField(state.run, "ranges", setField(state.run.ranges, action.payload.mode, nextRange)));
    }
    case ActionType.SET_DISPLAY_SELECTED_PARAM_GROUP:
      return setField(
        state,
        "selectedParamGroupId",
        action.payload.paramGroupId);
    case ActionType.SET_DISPLAY_QUICK_PARAM:
      return setField(
        state,
        "quickBar",
        action.payload.quick ?
          insertArrayElementSorted(state.quickBar, action.payload.param)
          : removeArrayElementSorted(state.quickBar, action.payload.param));
    case ActionType.SET_SELECTED_SIGNAL:
      return setField(
        state,
        "selectedSignalId",
        action.payload.signalId);
    case ActionType.ADD_SIGNAL_INSTANCE:
      return setField(
        state,
        "assignedSignals",
        setField(state.assignedSignals, action.payload.instance.signalId, action.payload.instance));
    case ActionType.REMOVE_SIGNAL_INSTANCE:
      return setField(
        state,
        "assignedSignals",
        removeField(state.assignedSignals, action.payload.signalId));
    case ActionType.SET_SIGNAL_INSTANCE_FIELD: {
      const {key, value, signalId} = action.payload;

      const fields: Partial<ISignalInstanceState> = {};
      const foundSignal = state.signals.find((signal) => getSignalId(signal) === signalId)!;
      const instance = state.assignedSignals[signalId];
      switch (key) {
        case "autoScaled":
          // When autoScaled flag is set => reset min/max bounds
          if (value) {
            fields.min = foundSignal.expectedMin;
            fields.max = foundSignal.expectedMax;
          }
          fields.autoScaled = value;
          break;
        case "min":
          // Guarantee that min value is always valid
          if (isNaN(value)) {
            fields.min = foundSignal.expectedMin;
          } else if (value > instance.max) {
            fields.min = instance.max;
          } else {
            fields.min = value;
          }
          break;
        case "max":
          // Guarantee that max value is always valid
          if (isNaN(value)) {
            fields.max = foundSignal.expectedMax;
          } else if (value < instance.min) {
            fields.max = instance.min;
          } else {
            fields.max = value;
          }
          break;
      }

      return setField(
        state,
        "assignedSignals",
        setField(
          state.assignedSignals,
          signalId,
          setFields(instance, fields)));
    }
    default:
      return state;
  }
};

export const rootDisplayReducer = (state: IApplicationState, action: ApplicationActions) => {
  switch (action.type) {
    case ActionType.ADD_DEVICES:
      return setNestedField(state, ["display", "devices"], fromPairs(action.payload.devices.map((device) => [
        device.id,
        createDeviceDisplayState(),
      ])));
    case ActionType.REPLACE_DEVICES: {
      const existingDevices = queryDevicesInOrder(state);
      const displayDevices = Object.keys(state.display.devices);
      const displayDevicesToBeRemoved = difference(displayDevices, existingDevices.map(getVirtualDeviceId));

      return setNestedField(
        state,
        ["display", "devices"],
        removeFields(state.display.devices, displayDevicesToBeRemoved));
    }
    case ActionType.SET_DEVICE_PARAMETER: {
      if (action.payload.parameter !== ConfigParam.kCtrlType) {
        return state;
      }
      const virtualDeviceId = action.payload.virtualDeviceId;
      const deviceDisplay = queryDeviceDisplay(state, virtualDeviceId);
      if (deviceDisplay == null) {
        return state;
      }
      const mode = queryDeviceParameterValue(state, virtualDeviceId, ConfigParam.kCtrlType);
      const range = deviceDisplay.run.ranges[mode];
      return setNestedField(
        state,
        ["display", "devices", virtualDeviceId, "run", "value"],
        (range.min + range.max) / 2);
    }
    default:
      return state;
  }
};

export default displayReducer;
