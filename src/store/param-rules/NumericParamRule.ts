import {identity, stubFalse} from "lodash";
import {INumericFieldConstraints, Message} from "../state";
import {EMPTY_OPTIONS, IConfigParamContext, IConfigParamRule, VALIDATE_SUCCESS} from "./ConfigParamRule";
import {ConfigParam} from "../../models/ConfigParam";

export interface INumericRuleOptions {
  default: number;
  constraints?: INumericFieldConstraints;

  isDisabled?(ctx: IConfigParamContext): boolean;

  validate?(ctx: IConfigParamContext): Message | undefined;

  getMessage?(ctx: IConfigParamContext): Message | undefined;
}

export const createNumericRule = (param: ConfigParam, options: INumericRuleOptions): IConfigParamRule => ({
  id: param,
  default: options.default,
  constraints: options.constraints,
  getValue: (ctx) => ctx.getParameter(param),
  isDisabled: options.isDisabled || stubFalse,
  validate: options.validate || VALIDATE_SUCCESS,
  getMessage: options.getMessage || VALIDATE_SUCCESS,
  toRawValue: identity,
  fromRawValue: identity,
  getOptions: EMPTY_OPTIONS,
});
