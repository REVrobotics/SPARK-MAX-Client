import {identity, stubFalse} from "lodash";
import {INumericFieldConstraints} from "../state";
import {
  ConfigParamRuleType,
  EMPTY_OPTIONS,
  IConfigParamContext,
  IConfigParamRule,
  VALIDATE_SUCCESS
} from "./ConfigParamRule";
import {ConfigParam} from "../../models/ConfigParam";
import {Message} from "../../models/Message";

export interface INumericRuleOptions {
  default: number;
  constraints?: INumericFieldConstraints;

  restore?(ctx: IConfigParamContext): number;

  isDisabled?(ctx: IConfigParamContext): boolean;

  validate?(ctx: IConfigParamContext): Message | undefined;

  getMessage?(ctx: IConfigParamContext): Message | undefined;
}

export const createNumericRule = (param: ConfigParam, options: INumericRuleOptions): IConfigParamRule => ({
  id: param,
  type: ConfigParamRuleType.Numeric,
  default: options.default,
  constraints: options.constraints,
  getValue: (ctx) => ctx.getParameter(param),
  restore: options.restore,
  isDisabled: options.isDisabled || stubFalse,
  validate: options.validate || VALIDATE_SUCCESS,
  getMessage: options.getMessage || VALIDATE_SUCCESS,
  toRawValue: identity,
  fromRawValue: identity,
  getOptions: EMPTY_OPTIONS,
});
