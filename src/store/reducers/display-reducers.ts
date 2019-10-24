import {difference, fromPairs} from "lodash";
import {
  createDeviceDisplayState,
  DEFAULT_DISPLAY_SETTINGS,
  getSignalId,
  getVirtualDeviceId,
  IApplicationState,
  IDeviceDisplayState,
  IDisplayState,
  ISignalInstanceState,
  PanelName
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
import {queryDevicesByDescriptor} from "../selectors";
import {roundDecimal} from "../../utils/number-utils";

const displayInitialState: IDisplayState = {
  selectedPanel: PanelName.Run,
  settings: DEFAULT_DISPLAY_SETTINGS,
  devices: {},
};

const displayReducer = (state: IDisplayState = displayInitialState, action: ApplicationActions) => {
  switch (action.type) {
    case ActionType.SET_DISPLAY:
      return action.payload.display;
    case ActionType.SET_DISPLAY_SELECTED_PANEL:
      return setField(state, "selectedPanel", action.payload.panel);
    case ActionType.SET_DISPLAY_SETTING:
      return setField(state, "settings", setField(state.settings, action.payload.key, action.payload.value));
    case ActionType.SET_DISPLAY_SELECTED_PARAM_GROUP:
    case ActionType.SET_DISPLAY_QUICK_PARAM:
    case ActionType.SET_SELECTED_SIGNAL:
    case ActionType.ADD_SIGNAL_INSTANCE:
    case ActionType.REMOVE_SIGNAL_INSTANCE:
    case ActionType.SET_SIGNAL_INSTANCE_FIELD:
    case ActionType.SET_CONTROL_FIELD:
    case ActionType.SET_RUNNING_STATUS:
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
    case ActionType.SET_RUNNING_STATUS:
      return setField(state, "run", setField(state.run, "running", action.payload.running));
    case ActionType.SET_CONTROL_FIELD: {
      const {field, value} = action.payload;
      switch (field) {
        case "mode":
          return setField(state, "run", setFields(state.run, {mode: value, value: 0}));
        case "value":
          return setField(state, "run", setField(state.run, "value", roundDecimal(value || 0, 2)));
        default:
          return setField(state, "run", setField(state.run, "value", value));
      }
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
      const existingDevices = queryDevicesByDescriptor(state, action.payload.descriptor);
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
