import {constant, identity, stubFalse} from "lodash";
import {ConfigParamRuleType, IConfigParamContext, IConfigParamRule, VALIDATE_SUCCESS} from "./ConfigParamRule";
import {IDictionaryWord} from "../dictionaries";
import {ConfigParam} from "../../models/ConfigParam";
import {Message} from "../state";

export interface IEnumRuleOptions {
  default: any;
  values: number[];
  options: IDictionaryWord[];

  restore?(ctx: IConfigParamContext): number;

  isDisabled?(ctx: IConfigParamContext): boolean;

  validate?(ctx: IConfigParamContext): Message | undefined;

  getMessage?(ctx: IConfigParamContext): Message | undefined;
}

export const createEnumRule = (param: ConfigParam, options: IEnumRuleOptions): IConfigParamRule => ({
  id: param,
  type: ConfigParamRuleType.Enum,
  default: options.default,
  constraints: {values: options.values},
  getValue: (ctx) => ctx.getParameter(param),
  restore: options.restore,
  isDisabled: options.isDisabled || stubFalse,
  validate: options.validate || VALIDATE_SUCCESS,
  getMessage: options.getMessage || VALIDATE_SUCCESS,
  toRawValue: identity,
  fromRawValue: identity,
  getOptions: constant(options.options),
});
