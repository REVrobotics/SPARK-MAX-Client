import {onChangeReducer} from "../../utils/reducer-utils";
import {combineReducers} from "redux";
import contextReducer from "./context-reducers";
import logsReducer from "./logs-reducers";
import uiReducer from "./ui-reducers";
import deviceSetReducer, {parameterValidationReducer} from "./device-set-reducers";

const rootReducer = onChangeReducer(
  combineReducers({
    context: contextReducer,
    deviceSet: deviceSetReducer,
    logs: logsReducer,
    ui: uiReducer,
  }),
  parameterValidationReducer,
);

export default rootReducer;