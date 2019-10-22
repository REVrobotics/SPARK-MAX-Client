import {difference, fromPairs} from "lodash";
import {
  createDeviceDisplayState, getSignalId,
  getVirtualDeviceId,
  IApplicationState, IDeviceDisplayState,
  IDisplayState,
  LegendAlignment,
  PanelName
} from "../state";
import {ActionType, ApplicationActions} from "../actions";
import {
  insertArrayElementSorted, removeArrayElementSorted,
  removeField,
  removeFields,
  setField,
  setFields,
  setNestedField
} from "../../utils/object-utils";
import {queryDevicesByDescriptor} from "../selectors";

const displayInitialState: IDisplayState = {
  selectedPanel: PanelName.Run,
  settings: {showLegend: true, legendAlignment: LegendAlignment.Top, singleChart: true, timeSpan: 30},
  devices: {},
};

const displayReducer = (state: IDisplayState = displayInitialState, action: ApplicationActions) => {
  switch (action.type) {
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
      const fields = {[action.payload.key]: action.payload.value};
      // When autoScaled flag is set => reset min/max bounds
      if (action.payload.key === "autoScaled" && action.payload.value) {
        const foundSignal = state.signals.find((signal) => getSignalId(signal) === action.payload.signalId);
        if (foundSignal) {
          fields.min = foundSignal.expectedMin;
          fields.max = foundSignal.expectedMax;
        }
      }

      return setField(
        state,
        "assignedSignals",
        setField(
          state.assignedSignals,
          action.payload.signalId,
          setFields(state.assignedSignals[action.payload.signalId], fields)));
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
