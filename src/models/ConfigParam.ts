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

export const configParamGroups = enumValues(ConfigParamGroupName);
export const getConfigParamGroupName = (group: ConfigParamGroupName) => ConfigParamGroupName[group];
export const getConfigParamGroupReadableName = memoize((group: ConfigParamGroupName) => {
  const groupName = getConfigParamGroupName(group);
  return groupName.substring("GROUPNAME_".length).replace(/_/g, " ");
});

const configParamInGroups = groupBy(
  configParamValues,
  (param) => ConfigParamGroup[`GROUP_${getConfigParamName(param)}`]);

export const getConfigParamsInGroup = (groupId: ConfigParamGroupId) => configParamInGroups[groupId];
