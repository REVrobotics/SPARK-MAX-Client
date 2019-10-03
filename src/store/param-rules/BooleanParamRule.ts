import {identity, stubFalse} from "lodash";
import {EMPTY_OPTIONS, IConfigParamContext, IConfigParamRule, VALIDATE_SUCCESS} from "./ConfigParamRule";
import {ConfigParam} from "../../models/ConfigParam";

export interface IBooleanRuleOptions {
  default: number;

  isDisabled?(ctx: IConfigParamContext): boolean;

  isDirty?(ctx: IConfigParamContext): boolean;
}

export const createBooleanRule = (param: ConfigParam, options: IBooleanRuleOptions): IConfigParamRule => ({
  id: param,
  default: options.default,
  getValue: (ctx) => ctx.getParameter(param),
  isDisabled: options.isDisabled || stubFalse,
  validate: VALIDATE_SUCCESS,
  getMessage: VALIDATE_SUCCESS,
  toRawValue: identity,
  fromRawValue: identity,
  getOptions: EMPTY_OPTIONS,
});
