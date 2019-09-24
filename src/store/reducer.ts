import {combineReducers, Reducer} from "redux";
import {keyBy, sortBy, values} from "lodash";
import {
  getDeviceId,
  getTransientState,
  getVirtualDeviceId,
  IApplicationState,
  IContextState,
  IDeviceParameterState,
  IDeviceSetState,
  IDeviceState,
  IUiState
} from "./state";
import {setArrayElement, setField, setFields} from "../utils/object-utils";
import {ActionType, ApplicationActions} from "./actions";
import {onChangeReducer} from "../utils/reducer-utils";
import {ConfigParam} from "../models/ConfigParam";
import {getConfigParamRule} from "./config-param-rules";
import {ConfigParamMessageSeverity} from "./param-rules/ConfigParamRule";

export const initialState: IApplicationState = {
  context: {
    isProcessing: false,
    processStatus: "",
  },
  deviceSet: {
    orderedDevices: [],
    devices: {},
  },
  logs: [],
  ui: {
    confirmationOpened: false
  }
};

const contextReducer: Reducer<IContextState> = (state: IContextState = initialState.context,
                                                action: ApplicationActions): IContextState => {
  switch (action.type) {
    case ActionType.SELECT_DEVICE:
      return setField(state, "selectedVirtualDeviceId", action.payload.virtualDeviceId);
    case ActionType.SET_CONNECTED_DEVICE:
      return setField(state, "connectedVirtualDeviceId", action.payload.connected ? action.payload.virtualDeviceId : undefined);
    case ActionType.SET_GLOBAL_PROCESS_STATUS:
      return setField(state, "processStatus", action.payload.processStatus);
    case ActionType.SET_GLOBAL_PROCESSING:
      return setField(state, "isProcessing", action.payload.isProcessing);
    default:
      return state;
  }
};

const uiReducer: Reducer<IUiState> = (state: IUiState = initialState.ui, action: ApplicationActions): IUiState => {
  switch (action.type) {
    case ActionType.OPEN_CONFIRMATION:
      return {...state, confirmation: action.payload, confirmationOpened: true};
    case ActionType.ANSWER_CONFIRMATION:
      return {...state, confirmationOpened: false};
    default:
      return state;
  }
};

const deviceSetReducer: Reducer<IDeviceSetState> = (state: IDeviceSetState = initialState.deviceSet,
                                                    action: ApplicationActions): IDeviceSetState => {
  switch (action.type) {
    case ActionType.ADD_DEVICES: {
      const devices = setFields(state.devices, keyBy(action.payload.devices, getVirtualDeviceId));
      return setFields(state, {
        devices,
        orderedDevices: sortBy(values(devices), getDeviceId).map(getVirtualDeviceId),
      });
    }
    case ActionType.SET_DEVICE_LOADED:
    case ActionType.SET_DEVICE_PROCESS_STATUS:
    case ActionType.SET_DEVICE_PROCESSING:
    case ActionType.SET_PARAMETERS:
    case ActionType.SET_DEVICE_PARAMETER:
    case ActionType.SET_DEVICE_PARAMETER_RESPONSE:
    case ActionType.SET_TRANSIENT_PARAMETER:
      return setField(
        state,
        "devices",
        setField(state.devices,
          action.payload.virtualDeviceId,
          deviceReducer(state.devices[action.payload.virtualDeviceId], action)));
    default:
      return state;
  }
};

const deviceReducer: Reducer<IDeviceState> = (state: IDeviceState, action: ApplicationActions): IDeviceState => {
  switch (action.type) {
    case ActionType.SET_DEVICE_LOADED:
      return {...state, isLoaded: action.payload.loaded};
    case ActionType.SET_DEVICE_PROCESS_STATUS:
      return {...state, processStatus: action.payload.processStatus};
    case ActionType.SET_DEVICE_PROCESSING:
      return {...state, isProcessing: action.payload.isProcessing, processType: action.payload.processType};
    case ActionType.SET_PARAMETERS: {
      const parameterStates = action.payload.parameters.map((value) => ({value}));

      return {
        ...state,
        transientParameters: getTransientState(parameterStates),
        currentParameters: parameterStates,
        burnedParameters: action.payload.parameters,
      };
    }
    case ActionType.SET_DEVICE_PARAMETER:
      return {
        ...state,
        currentParameters: setArrayElement(
          state.currentParameters,
          action.payload.parameter,
          (param) => setField(param, "value", action.payload.value)),
      };
    case ActionType.SET_DEVICE_PARAMETER_RESPONSE:
      return {
        ...state,
        currentParameters: setArrayElement(
          state.currentParameters,
          action.payload.parameter,
          (param) => setFields(param, {
            value: action.payload.response.responseValue as number,
            lastResponse: action.payload.response,
          })),
      };
    case ActionType.SET_TRANSIENT_PARAMETER:
      return {
        ...state,
        transientParameters: setField(state.transientParameters, action.payload.field, action.payload.value),
      };
    default:
      return state;
  }
};

const parameterValidationReducer = (state: IApplicationState, action: ApplicationActions): IApplicationState => {
  switch (action.type) {
    case ActionType.SET_DEVICE_PARAMETER:
    case ActionType.SET_DEVICE_PARAMETER_RESPONSE:
      return setField(
        state,
        "deviceSet",
        setField(
          state.deviceSet,
          "devices",
          setField(
            state.deviceSet.devices,
            action.payload.virtualDeviceId,
            setField(
              state.deviceSet.devices[action.payload.virtualDeviceId],
              "currentParameters",
              setArrayElement(
                state.deviceSet.devices[action.payload.virtualDeviceId].currentParameters,
                action.payload.parameter,
                validateDeviceParameter(
                  state,
                  action.payload.parameter,
                  state.deviceSet.devices[action.payload.virtualDeviceId].currentParameters[action.payload.parameter]))))));
    default:
      return state;
  }
};

const validateDeviceParameter = (state: IApplicationState,
                                 parameter: ConfigParam,
                                 parameterState: IDeviceParameterState): IDeviceParameterState => {
  const rule = getConfigParamRule(parameter);
  const message = rule.validate(state);

  if (message == null) {
    return setFields(parameterState, {error: undefined, warning: undefined});
  }

  switch (message.severity) {
    case ConfigParamMessageSeverity.Error:
      return setFields(parameterState, {
        error: message.text,
        warning: undefined,
      });
    case ConfigParamMessageSeverity.Warning:
      return setFields(parameterState, {
        error: undefined,
        warning: message.text,
      });
    default:
      return parameterState;
  }
};

const logsReducer: Reducer<string[]> = (state: string[] = initialState.logs, action: ApplicationActions): string[] => {
  switch (action.type) {
    case ActionType.ADD_LOG:
      return [...state, action.payload.log];
    default:
      return state;
  }
};

const reducer = onChangeReducer(
  combineReducers({
    context: contextReducer,
    deviceSet: deviceSetReducer,
    logs: logsReducer,
    ui: uiReducer,
  }),
  parameterValidationReducer,
);

export default reducer;