import {difference, fromPairs, isEmpty} from "lodash";
import {
  createDeviceDisplayState,
  DEFAULT_DISPLAY_SETTINGS,
  getSignalId,
  getVirtualDeviceId,
  IApplicationState,
  IDeviceDisplayState,
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
import {queryDevicesInOrder} from "../selectors";
import {roundDecimal} from "../../utils/number-utils";

const displayInitialState: IDisplayState = {
  selectedPanel: PanelName.Run,
  selectedQuickPanel: QuickPanelName.PIDF,
  settings: DEFAULT_DISPLAY_SETTINGS,
  devices: {},
  lastSyncedConsumers: [],
  lastRunningDeviceIds: [],
};

const displayReducer = (state: IDisplayState = displayInitialState, action: ApplicationActions) => {
  switch (action.type) {
    case ActionType.SET_LAST_RUNNING_DEVICE_IDS:
      return setField(state, "lastRunningDeviceIds", action.payload.deviceIds);
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
    case ActionType.SET_CONTROL_VALUE:
    case ActionType.SET_RUNNING_STATUS:
    case ActionType.SET_DISPLAY_SELECTED_PID_PROFILE:
      return setNestedField(
        state,
        ["devices", action.payload.virtualDeviceId],
        deviceDisplayReducer(state.devices[action.payload.virtualDeviceId], action));
    default:
      return state;
  }
};

const deviceDisplayReducer = (state: IDeviceDisplayState, action: ApplicationActions) => {
  switch (action.type) {
    case ActionType.SET_DISPLAY_SELECTED_PID_PROFILE:
      return setField(state, "pidProfile", action.payload.profile);
    case ActionType.SET_RUNNING_STATUS:
      return setField(state, "run", setField(state.run, "running", action.payload.running));
    case ActionType.SET_CONTROL_VALUE:
      return setField(state, "run", setField(state.run, "value", roundDecimal(action.payload.value || 0, 2)));
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
    case ActionType.REMOVE_SIGNAL_INSTANCE: {
      const withoutSignal = setField(
        state,
        "assignedSignals",
        removeField(state.assignedSignals, action.payload.signalId));
      // Stop device if there is no more signals
      return setField(
        withoutSignal,
        "run",
        setField(
          withoutSignal.run,
          "running",
          isEmpty(withoutSignal.assignedSignals) ? false : withoutSignal.run.running));
    }
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
    default:
      return state;
  }
};

export default displayReducer;
