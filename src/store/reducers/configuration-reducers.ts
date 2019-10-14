import {mapValues} from "lodash";
import {
  DEFAULT_DEVICE_CONFIGURATION,
  DEFAULT_DEVICE_CONFIGURATION_ID,
  getDeviceConfigurationId,
  IApplicationState,
  IDeviceConfiguration,
  sortConfigurations
} from "../state";
import {ActionType, ApplicationActions} from "../actions";
import {setArrayElementBy, setFields, setNestedField} from "../../utils/object-utils";
import {querySelectedVirtualDeviceId} from "../selectors";

const initialConfigurationsState = [DEFAULT_DEVICE_CONFIGURATION];

const configurationsReducer = (state: IDeviceConfiguration[] = initialConfigurationsState,
                               action: ApplicationActions): IDeviceConfiguration[] => {
  switch (action.type) {
    case ActionType.SET_CONFIGURATIONS:
      return sortConfigurations([DEFAULT_DEVICE_CONFIGURATION].concat(action.payload.configurations));
    case ActionType.ADD_CONFIGURATION:
      return sortConfigurations(state.concat([action.payload.configuration]));
    case ActionType.REMOVE_CONFIGURATION:
      return state.filter((configuration) => getDeviceConfigurationId(configuration) !== action.payload.id);
    case ActionType.UPDATE_CONFIGURATION:
      return sortConfigurations(setArrayElementBy(
        state,
        getDeviceConfigurationId,
        action.payload.id,
        (configuration) => setFields(configuration, action.payload.configuration)));
  }
  return state;
};

export const deviceConfigurationReducer = (state: IApplicationState, action: ApplicationActions): IApplicationState => {
  switch (action.type) {
    case ActionType.ADD_CONFIGURATION: {
      const deviceId = querySelectedVirtualDeviceId(state);
      if (deviceId == null) {
        return state;
      }

      // If new configuration is added, new configuration is selected for the current device
      return setNestedField(
        state,
        ["deviceSet", "devices", deviceId, "transientParameters", "configurationId"],
        getDeviceConfigurationId(action.payload.configuration));
    }
    case ActionType.REMOVE_CONFIGURATION:
      // If configuration is removed, we have to unselect this configuration for all devices
      return setNestedField(
        state,
        ["deviceSet", "devices"],
        mapValues(
          state.deviceSet.devices,
          (device) => {
            const selectedId = device.transientParameters.configurationId;
            if (selectedId === action.payload.id) {
              return setNestedField(
                device,
                ["transientParameters", "configurationId"],
                DEFAULT_DEVICE_CONFIGURATION_ID);
            } else {
              return device;
            }
          }));
    default:
      return state;
  }
};

export default configurationsReducer;
