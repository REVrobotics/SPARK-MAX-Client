import {uniq, concat, without} from "lodash";
import {ConfigParam, ConfigParamTypes, ParamType} from "./proto-gen/SPARK-MAX-Types_dto_pb";
import {enumNames, enumValues} from "./dto-utils";

export {ConfigParam} from './proto-gen/SPARK-MAX-Types_dto_pb';

export const configParamValues = enumValues(ConfigParam);
export const configParamNames = enumNames(ConfigParam);

export const getConfigParamType = (param: string): ParamType => ConfigParamTypes[`${param}_t`];
export const getConfigParamValue = (name: string): ConfigParam => ConfigParam[name];
export const getConfigParamName = (param: ConfigParam): string => ConfigParam[param];

// We have to track all groups of parameters which depend each other
export const configParamDependencyGroups: ConfigParam[][] = [
  [ConfigParam.kMotorType, ConfigParam.kSensorType],
];

const buildConfigParamDependencyIndex = () => {
  const index = {};
  configParamDependencyGroups.forEach((group) => {
    group.forEach((param) => {
      index[param] = uniq(concat(index[param] || [], without(group, param)));
    });
  });
  return index;
};

const configParamDependencyIndex = buildConfigParamDependencyIndex();

/**
 * Returns {@link ConfigParam}s given parameter depends on
 * @param param
 */
export const getDependentParams = (param: ConfigParam) => configParamDependencyIndex[param] || [];
