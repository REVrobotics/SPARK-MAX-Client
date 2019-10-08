import {identity, stubFalse} from "lodash";
import {
  ConfigParamRuleType,
  EMPTY_OPTIONS,
  IConfigParamContext,
  IConfigParamRule,
  VALIDATE_SUCCESS
} from "./ConfigParamRule";
import {ConfigParam} from "../../models/ConfigParam";

export interface IBooleanRuleOptions {
  default: number;

  restore?(ctx: IConfigParamContext): number;
  isDisabled?(ctx: IConfigParamContext): boolean;
}

export const createBooleanRule = (param: ConfigParam, options: IBooleanRuleOptions): IConfigParamRule => ({
  id: param,
  type: ConfigParamRuleType.Boolean,
  default: options.default,
  getValue: (ctx) => ctx.getParameter(param),
  restore: options.restore,
  isDisabled: options.isDisabled || stubFalse,
  validate: VALIDATE_SUCCESS,
  getMessage: VALIDATE_SUCCESS,
  toRawValue: identity,
  fromRawValue: identity,
  getOptions: EMPTY_OPTIONS,
});
