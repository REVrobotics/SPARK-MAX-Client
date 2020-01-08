import {concat, groupBy, memoize, uniq, without} from "lodash";
import {
  ConfigParam,
  ConfigParamGroup,
  ConfigParamGroupName,
  ConfigParamTypes,
  ParamType
} from "./proto-gen/SPARK-MAX-Types_dto_pb";
import {enumNames, enumValues} from "./dto-utils";
import {DictionaryName, translateWord} from "../mls/dictionaries";

export {ConfigParam} from './proto-gen/SPARK-MAX-Types_dto_pb';

export type ConfigParamGroupId = ConfigParamGroupName;

/**
 * Set of ConfigParam values
 */
export const configParamValues = enumValues(ConfigParam);
/**
 * Set of ConfigParam names
 */
export const configParamNames = enumNames(ConfigParam);

/**
 * Returns type ({@link ParamType}) of the given parameter.
 */
export const getConfigParamType = (param: string): ParamType => ConfigParamTypes[`${param}_t`];
/**
 * Returns value ({@link ConfigParam}) of the given parameter.
 */
export const getConfigParamValue = (name: string): ConfigParam => ConfigParam[name];
/**
 * Returns name of the given parameter
 */
export const getConfigParamName = (param: ConfigParam): string => ConfigParam[param];

/**
 * Returns readable name of parameter
 */
export const getConfigParamReadableName = (param: ConfigParam) => translateWord(DictionaryName.ConfigParams, param);

// Track all groups of parameters which depend each other.
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

/**
 * All groups
 */
export const configParamGroups = enumValues(ConfigParamGroupName);

/**
 * All visible groups
 */
export const configParamVisibleGroups = configParamGroups.filter((group) => group !== ConfigParamGroupName.GROUPNAME_Hidden);

/**
 * Returns group name
 */
export const getConfigParamGroupName = (group: ConfigParamGroupName) => ConfigParamGroupName[group];
/**
 * Returns readable group name
 */
export const getConfigParamGroupReadableName = memoize((group: ConfigParamGroupName) => {
  const groupName = getConfigParamGroupName(group);
  return groupName.substring("GROUPNAME_".length).replace(/_/g, " ");
});

const configParamInGroups = groupBy(
  configParamValues,
  (param) => ConfigParamGroup[`GROUP_${getConfigParamName(param)}`]);

/**
 * Returns parameters that belongs to specific group
 */
export const getConfigParamsInGroup = (groupId: ConfigParamGroupId) => configParamInGroups[groupId];

/**
 * Returns true if given parameter is one of P, I, D, F, or iZone, otherwise false
 */
export const isMainPidParameter = (parameter: ConfigParam) => {
  switch (parameter) {
    case ConfigParam.kP_0:
    case ConfigParam.kP_1:
    case ConfigParam.kP_2:
    case ConfigParam.kP_3:
    case ConfigParam.kI_0:
    case ConfigParam.kI_1:
    case ConfigParam.kI_2:
    case ConfigParam.kI_3:
    case ConfigParam.kD_0:
    case ConfigParam.kD_1:
    case ConfigParam.kD_2:
    case ConfigParam.kD_3:
    case ConfigParam.kF_0:
    case ConfigParam.kF_1:
    case ConfigParam.kF_2:
    case ConfigParam.kF_3:
    case ConfigParam.kIZone_0:
    case ConfigParam.kIZone_1:
    case ConfigParam.kIZone_2:
    case ConfigParam.kIZone_3:
      return true;
    default:
      return false;
  }
};
