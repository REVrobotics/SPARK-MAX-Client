import {filter, fromPairs, keyBy, sortBy, values} from "lodash";
import {Reducer} from "redux";
import {
  DeviceId,
  getDeviceId,
  getDeviceParamValue,
  getTransientState,
  getVirtualDeviceId,
  IApplicationState,
  IDeviceParameterState,
  IDeviceSetState,
  IDeviceState,
  VirtualDeviceId
} from "../state";
import {ActionType, ApplicationActions} from "../actions";
import {setArrayElement, setField, setFields, setNestedField} from "../../utils/object-utils";
import {ConfigParam} from "../../models/proto-gen/SPARK-MAX-Types_dto_pb";
import {createRamConfigParamContext, getRamConfigParamRule, IRamConfigParamContext} from "../ram-config-param-rules";
import {composeReducers} from "../../utils/reducer-utils";
import {queryDescriptorIndex} from "../selectors";

const initialDeviceSetState: IDeviceSetState = {
  orderedDescriptors: [],
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
        orderedDescriptors: action.payload.descriptors || state.orderedDescriptors,
        devices,
      });
    }
    case ActionType.REPLACE_DEVICES:
      return setFields(state, {
        devices: fromPairs(action.payload.devices.map((device) => [getVirtualDeviceId(device), device])),
        orderedDescriptors: action.payload.descriptors || state.orderedDescriptors,
      });
    case ActionType.SET_PROCESSING_BY_DESCRIPTOR:
    case ActionType.SET_PROCESS_STATUS_BY_DESCRIPTOR: {
      // Find all devices having the same descriptor
      const devices = filter(state.devices, (device) => device.descriptor === action.payload.descriptor);
      return setField(
        state,
        "devices",
        setFields(
          state.devices,
          fromPairs(devices.map((device) => [getVirtualDeviceId(device), deviceReducer(device, action)]))));
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
    case ActionType.SET_ADVANCED_SEARCH_STRING:
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
    case ActionType.SET_PROCESS_STATUS_BY_DESCRIPTOR:
      return {...state, processStatus: action.payload.processStatus};
    case ActionType.SET_DEVICE_PROCESSING:
    case ActionType.SET_PROCESSING_BY_DESCRIPTOR:
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
        // Enable ramp rate if value != 0
        transientParameters: action.payload.parameter === ConfigParam.kRampRate && !state.transientParameters.rampRateEnabled ?
          setField(state.transientParameters, "rampRateEnabled", action.payload.value !== 0)
          : state.transientParameters,
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
    case ActionType.SET_ADVANCED_SEARCH_STRING:
      return setField(state, "advanced", setField(state.advanced, "search", action.payload.search));
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

const deviceOrderingReducer = (state: IApplicationState, action: ApplicationActions): IApplicationState =>
  setNestedField(
    state,
    ["deviceSet", "orderedDevices"],
    orderedDevicesReducer(state, action));

const orderedDevicesReducer = (state: IApplicationState, action: ApplicationActions): VirtualDeviceId[] => {
  switch (action.type) {
    case ActionType.ADD_DEVICES:
    case ActionType.REPLACE_DEVICES:
    case ActionType.SET_CONNECTED_DESCRIPTOR: {
      const devices = values(state.deviceSet.devices);
      const connectedDescriptor = state.context.connectedDescriptor;

      // Sort devices in the order of descriptor
      // Always put connected devices to the top
      return sortBy(
        devices,
        (device) => {
          const index = device.descriptor === connectedDescriptor ? 0 : queryDescriptorIndex(state, device.descriptor);
          return `${index}:${getDeviceId(device)}`;
        })
        .map(getVirtualDeviceId);
    }
    default:
      return state.deviceSet.orderedDevices;
  }
};

export const rootDeviceSetReducer = composeReducers(parameterValidationReducer, deviceOrderingReducer);

export default deviceSetReducer;
