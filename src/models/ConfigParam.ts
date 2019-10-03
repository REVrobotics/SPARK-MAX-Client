import {negate} from "lodash";
import {ConfigParam, ConfigParamTypes, ParamType} from "./proto-gen/SPARK-MAX-Types_dto_pb";

export {ConfigParam} from './proto-gen/SPARK-MAX-Types_dto_pb';

const configParamKeys = Object.keys(ConfigParam);

const isDigitOnlyKey = (key: string) => /^\d+$/.test(key);

export const configParamValues = configParamKeys.filter(isDigitOnlyKey).map(Number);
export const configParamNames = configParamKeys.filter(negate(isDigitOnlyKey));

export const getConfigParamType = (param: string): ParamType => ConfigParamTypes[`${param}_t`];
