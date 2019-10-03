import {constant, identity, stubFalse} from "lodash";
import {IConfigParamContext, IConfigParamRule, VALIDATE_SUCCESS} from "./ConfigParamRule";
import {IDictionaryWord} from "../dictionaries";
import {ConfigParam} from "../../models/ConfigParam";
import {Message} from "../state";

export interface ISelectRuleOptions {
  default: any;
  options: IDictionaryWord[];

  isDisabled?(ctx: IConfigParamContext): boolean;

  validate?(ctx: IConfigParamContext): Message | undefined;

  getMessage?(ctx: IConfigParamContext): Message | undefined;
}

export const createSelectRule = (param: ConfigParam, options: ISelectRuleOptions): IConfigParamRule => ({
  id: param,
  default: options.default,
  getValue: (ctx) => ctx.getParameter(param),
  isDisabled: options.isDisabled || stubFalse,
  validate: options.validate || VALIDATE_SUCCESS,
  getMessage: options.getMessage || VALIDATE_SUCCESS,
  toRawValue: identity,
  fromRawValue: identity,
  getOptions: constant(options.options),
});
