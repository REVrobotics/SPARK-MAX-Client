import {ConfigParam} from "../../models/proto-gen/SPARK-MAX-Types_dto_pb";
import {IDeviceParameterState} from "../state";
import {getConfigParamRule} from "../config-param-rules";

export const getDeviceParamOrDefault = (config: IDeviceParameterState[]|undefined,
                                        parameter: ConfigParam): IDeviceParameterState =>
  config && config[parameter] || {value: getConfigParamRule(parameter).default};

export const getDeviceParamValueOrDefault = (config: IDeviceParameterState[]|undefined, parameter: ConfigParam) => {
  const state = config && config[parameter];
  return state ? state.value : getConfigParamRule(parameter).default;
};

export const getDeviceBurnedParamOrDefault = (config: number[]|undefined, parameter: ConfigParam) =>
  config && config[parameter] || getConfigParamRule(parameter).default;
