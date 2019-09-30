import {keyBy, values, sortBy} from "lodash";
import {Reducer} from "redux";
import {
  DeviceId,
  getDeviceId,
  getDeviceParamValue,
  getTransientState,
  getVirtualDeviceId, IApplicationState, IDeviceParameterState,
  IDeviceSetState,
  IDeviceState
} from "../state";
import {ActionType, ApplicationActions} from "../actions";
import {removeFields, setArrayElement, setField, setFields} from "../../utils/object-utils";
import {ConfigParam} from "../../models/proto-gen/SPARK-MAX-Types_dto_pb";
import {getConfigParamRule} from "../config-param-rules";
import {ConfigParamMessageSeverity} from "../param-rules/ConfigParamRule";

const initialDeviceSetState: IDeviceSetState = {
  orderedDevices: [],
  devices: {},
};

// tslint:disable-next-line:no-bitwise
const getDeviceIdWithNewCanId = (device: DeviceId, newCanId: number) => (0xffff00 & device) | (newCanId & 0xff);

const deviceSetReducer: Reducer<IDeviceSetState> = (state: IDeviceSetState = initialDeviceSetState,
                                                    action: ApplicationActions): IDeviceSetState => {
  switch (action.type) {
    case ActionType.ADD_DEVICES: {
      const devices = setFields(state.devices, keyBy(action.payload.devices, getVirtualDeviceId));
      return setFields(state, {
        devices,
        orderedDevices: sortBy(values(devices), getDeviceId).map(getVirtualDeviceId),
      });
    }
    case ActionType.REPLACE_DEVICES: {
      const mainDeviceId = getVirtualDeviceId(action.payload.device);
      const withoutCanDevices = removeFields(state.devices, action.payload.replaceIds);
      const devices = setField(withoutCanDevices, mainDeviceId as any, action.payload.device);
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
    case ActionType.RECALCULATE_DEVICE_ID:
    case ActionType.SET_TRANSIENT_PARAMETER:
      return setField(
        state,
        "devices",
        setField(state.devices,
          action.payload.virtualDeviceId,
          deviceSetReducers(state.devices[action.payload.virtualDeviceId], action)));
    default:
      return state;
  }
};

const deviceSetReducers: Reducer<IDeviceState> = (state: IDeviceState, action: ApplicationActions): IDeviceState => {
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
            value: action.payload.updateValue ? action.payload.response.responseValue as number : param.value,
            lastResponse: action.payload.response,
          })),
      };
    case ActionType.SET_TRANSIENT_PARAMETER:
      return {
        ...state,
        transientParameters: setField(state.transientParameters, action.payload.field, action.payload.value),
      };
    case ActionType.RECALCULATE_DEVICE_ID: {
      const canId = getDeviceParamValue(state.currentParameters[ConfigParam.kCanID]);
      return setFields(state, {
        fullDeviceId: getDeviceIdWithNewCanId(state.fullDeviceId, canId),
        uniqueId: 0,
      });
    }
    default:
      return state;
  }
};

const parameterValidationReducer = (state: IApplicationState, action: ApplicationActions): IApplicationState => {
  switch (action.type) {
    case ActionType.SET_DEVICE_PARAMETER:
    case ActionType.SET_DEVICE_PARAMETER_RESPONSE:
    case ActionType.SET_PARAMETERS: {
      const currentParameters = state.deviceSet.devices[action.payload.virtualDeviceId].currentParameters;
      let validatedParameters;
      if (action.type === ActionType.SET_PARAMETERS) {
        validatedParameters = currentParameters.map((parameter, i) => validateDeviceParameter(state, i, parameter));
      } else {
        validatedParameters = setArrayElement(
          currentParameters,
          action.payload.parameter,
          validateDeviceParameter(
            state,
            action.payload.parameter,
            currentParameters[action.payload.parameter]));
      }

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
              validatedParameters))));
    }
    default:
      return state;
  }
};

const validateDeviceParameter = (state: IApplicationState,
                                 parameter: ConfigParam,
                                 parameterState: IDeviceParameterState): IDeviceParameterState => {
  const rule = getConfigParamRule(parameter);
  if (rule == null) {
    return parameterState;
  }

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

export { parameterValidationReducer };
export default deviceSetReducer;
