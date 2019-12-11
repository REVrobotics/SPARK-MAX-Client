import {onChangeReducer} from "../../utils/reducer-utils";
import {combineReducers} from "redux";
import contextReducer, {rootContextReducer} from "./context-reducers";
import logsReducer from "./logs-reducers";
import uiReducer from "./ui-reducers";
import deviceSetReducer, {rootDeviceSetReducer} from "./device-set-reducers";
import networkReducer from "./network-reducers";
import firmwareReducer from "./firmware-reducers";
import displayReducer, {rootDisplayReducer} from "./display-reducers";
import configurationsReducer, {rootConfigurationsReducer} from "./configuration-reducers";

const rootReducer = onChangeReducer(
  combineReducers({
    context: contextReducer,
    deviceSet: deviceSetReducer,
    logs: logsReducer,
    ui: uiReducer,
    network: networkReducer,
    firmware: firmwareReducer,
    configurations: configurationsReducer,
    display: displayReducer,
  }),
  rootDeviceSetReducer,
  rootConfigurationsReducer,
  rootContextReducer,
  rootDisplayReducer,
);

export default rootReducer;
