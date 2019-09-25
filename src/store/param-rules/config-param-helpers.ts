import {constant, flow} from "lodash";
import {ConfigParam, ParamStatus} from "../../models/proto-gen/SPARK-MAX-Types_dto_pb";
import {getDeviceParamValue, IApplicationState, IDeviceParameterState} from "../state";
import {querySelectedDeviceBurnedConfig, querySelectedDeviceCurrentConfig} from "../selectors";
import {getConfigParamRule} from "../config-param-rules";
import {ConfigParamMessage} from "./ConfigParamRule";

export const EMPTY_DEPENDENCIES = constant([]);
export const EMPTY_OPTIONS = constant([]);
export const VALIDATE_SUCCESS = constant(undefined);
export const EMPTY_TEXT = constant(undefined);

export const configParamAccessor = (parameter: ConfigParam,
                                    validate?: (value: number, state: IApplicationState) => ConfigParamMessage|undefined) => {
  const mapDeviceParam = (config: IDeviceParameterState[]): IDeviceParameterState =>
    getDeviceParamOrDefault(config, parameter);
  const mapDeviceParamValue = flow(mapDeviceParam, getDeviceParamValue);
  const mapCurrentParam = flow(querySelectedDeviceCurrentConfig, mapDeviceParam);
  const mapCurrentParamValue = flow(querySelectedDeviceCurrentConfig, mapDeviceParamValue);
  const mapBurnedParamValue = flow(
    querySelectedDeviceBurnedConfig,
    (parameters) => parameters && parameters[parameter] != null ?
      parameters[parameter]
      : getConfigParamRule(parameter).default);

  return {
    value: (state: IApplicationState) => mapCurrentParamValue(state),
    isDirty: (state: IApplicationState) => mapCurrentParamValue(state) !== mapBurnedParamValue(state),
    validate: (state: IApplicationState) => {
      let warning: ConfigParamMessage|undefined;

      // Validate using provided function
      const message = validate && validate(mapCurrentParamValue(state), state);
      if (message) {
        return message;
      }

      // Otherwise run default parameter validation flow
      const param = mapCurrentParam(state);
      const {lastResponse} = param;
      if (lastResponse && lastResponse.status === ParamStatus.Invalid) {
        warning = ConfigParamMessage.warning(`Your requested value of ${lastResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${lastResponse.responseValue}.`);
      }

      return warning;
    },
    hasError: (state: IApplicationState) => {
      const param = mapCurrentParam(state);
      return !!param.error;
    },
    getErrorText: (state: IApplicationState) => {
      const param = mapCurrentParam(state);
      return param.error;
    },
    hasWarning: (state: IApplicationState) => {
      const param = mapCurrentParam(state);
      return !!param.warning;
    },
    getWarningText: (state: IApplicationState) => {
      const param = mapCurrentParam(state);
      return param.warning;
    },
  };
};

export const getDeviceParamOrDefault = (config: IDeviceParameterState[]|undefined,
                                        parameter: ConfigParam): IDeviceParameterState =>
  config && config[parameter] || {value: getConfigParamRule(parameter).default};

export const getDeviceParamValueOrDefault = (config: IDeviceParameterState[]|undefined, parameter: ConfigParam) => {
  const state = config && config[parameter];
  return state ? state.value : getConfigParamRule(parameter).default;
};

/**
 * Returns state of parameter for selected device if it exists, otherwise returns default state
 *
 * @param state
 * @param parameter
 */
export const getSelectedDeviceParamOrDefault = (state: IApplicationState, parameter: ConfigParam) =>
  getDeviceParamOrDefault(querySelectedDeviceCurrentConfig(state), parameter);

/**
 * Returns value for selected device if it exists, otherwise returns default value
 *
 * @param state
 * @param parameter
 */
export const getSelectedDeviceParamValueOrDefault = (state: IApplicationState, parameter: ConfigParam) =>
  getDeviceParamValueOrDefault(querySelectedDeviceCurrentConfig(state), parameter);
