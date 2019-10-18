import {onChangeReducer} from "../../utils/reducer-utils";
import {combineReducers} from "redux";
import contextReducer, {syncSelectedVirtualDeviceIdReducer} from "./context-reducers";
import logsReducer from "./logs-reducers";
import uiReducer from "./ui-reducers";
import deviceSetReducer, {deviceOrderingReducer, parameterValidationReducer} from "./device-set-reducers";
import networkReducer from "./network-reducers";
import firmwareReducer from "./firmware-reducers";
import configurationsReducer, {deviceConfigurationReducer} from "./configuration-reducers";

const rootReducer = onChangeReducer(
  combineReducers({
    context: contextReducer,
    deviceSet: deviceSetReducer,
    logs: logsReducer,
    ui: uiReducer,
    network: networkReducer,
    firmware: firmwareReducer,
    configurations: configurationsReducer,
  }),
  parameterValidationReducer,
  deviceOrderingReducer,
  deviceConfigurationReducer,
  syncSelectedVirtualDeviceIdReducer,
);

export default rootReducer;
