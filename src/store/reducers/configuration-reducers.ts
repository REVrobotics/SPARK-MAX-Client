import {DEFAULT_DEVICE_CONFIGURATION, IDeviceConfiguration} from "../state";
import {ApplicationActions} from "../actions";

const initialConfigurationsState = [DEFAULT_DEVICE_CONFIGURATION, {id: "222", name: "222", parameters: []}];

const configurationsReducer = (state: IDeviceConfiguration[] = initialConfigurationsState,
                               action: ApplicationActions): IDeviceConfiguration[] => {
  return state;
};

export default configurationsReducer;
