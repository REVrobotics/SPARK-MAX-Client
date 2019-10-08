import {DEFAULT_DEVICE_CONFIGURATION, IDeviceConfiguration} from "../state";
import {ActionType, ApplicationActions} from "../actions";

const initialConfigurationsState = [DEFAULT_DEVICE_CONFIGURATION];

const configurationsReducer = (state: IDeviceConfiguration[] = initialConfigurationsState,
                               action: ApplicationActions): IDeviceConfiguration[] => {
  switch (action.type) {
    case ActionType.SET_CONFIGURATIONS:
      return [DEFAULT_DEVICE_CONFIGURATION].concat(action.payload.configurations);
  }
  return state;
};

export default configurationsReducer;
