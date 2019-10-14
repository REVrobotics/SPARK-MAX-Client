import {onChangeReducer} from "../../utils/reducer-utils";
import {combineReducers} from "redux";
import contextReducer from "./context-reducers";
import logsReducer from "./logs-reducers";
import uiReducer from "./ui-reducers";
import deviceSetReducer, {parameterValidationReducer} from "./device-set-reducers";
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
  deviceConfigurationReducer,
);

export default rootReducer;
