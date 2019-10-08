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
import {createRamConfigParamContext, getRamConfigParamRule, IRamConfigParamContext} from "../ram-config-param-rules";

const initialDeviceSetState: IDeviceSetState = {
  orderedDevices: [],
  devices: {},
};

// tslint:disable-next-line:no-bitwise
const getDeviceIdWithNewCanId = (deviceId: DeviceId, newCanId: number) => {
  const oldCanId = deviceId % 100;
  return (deviceId - oldCanId) + newCanId;
};

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
    case ActionType.RESET_TRANSIENT_STATE:
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
    case ActionType.RESET_TRANSIENT_STATE:
      return {
        ...state,
        transientParameters: setFields(state.transientParameters, {
          ...getTransientState(state.currentParameters),
          configurationId: state.transientParameters.configurationId,
        }),
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
      const ctx = createRamConfigParamContext(state);

      const currentParameters = state.deviceSet.devices[action.payload.virtualDeviceId].currentParameters;
      let validatedParameters;
      if (action.type === ActionType.SET_PARAMETERS) {
        validatedParameters = currentParameters.map((parameter, i) => validateDeviceParameter(ctx, i, parameter));
      } else {
        validatedParameters = setArrayElement(
          currentParameters,
          action.payload.parameter,
          validateDeviceParameter(
            ctx,
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

const validateDeviceParameter = (ctx: IRamConfigParamContext,
                                 parameter: ConfigParam,
                                 parameterState: IDeviceParameterState): IDeviceParameterState => {
  const rule = getRamConfigParamRule(parameter);
  if (rule == null) {
    return parameterState;
  }

  return setField(parameterState, "message", rule.validate(ctx));
};

export { parameterValidationReducer };
export default deviceSetReducer;
