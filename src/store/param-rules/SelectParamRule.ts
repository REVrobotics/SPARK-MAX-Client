import {constant, identity, stubFalse} from "lodash";
import {IApplicationState} from "../state";
import {ConfigParamMessage, IConfigParamRule} from "./ConfigParamRule";
import {EMPTY_DEPENDENCIES, EMPTY_TEXT, VALIDATE_SUCCESS} from "./config-param-helpers";
import {IDictionaryWord} from "../dictionaries";

export interface ISelectRuleOptions {
  default: any;
  title: string;
  options: IDictionaryWord[];

  value(state: IApplicationState): number;

  isDisabled?(state: IApplicationState): boolean;

  isDirty?(state: IApplicationState): boolean;

  validate?(state: IApplicationState): ConfigParamMessage|undefined;

  hasError?(state: IApplicationState): boolean;

  getErrorText?(state: IApplicationState): string|undefined;

  hasWarning?(state: IApplicationState): boolean;

  getWarningText?(state: IApplicationState): string|undefined;
}

export const createSelectRule = (options: ISelectRuleOptions,
                                 dependencies?: (state: IApplicationState) => any[]): IConfigParamRule => ({
  default: options.default,
  getTitle: constant(options.title),
  getConstraints: constant(undefined),
  getValue: options.value,
  getDependencies: dependencies || EMPTY_DEPENDENCIES,
  isDisabled: options.isDisabled || stubFalse,
  isDirty: options.isDirty || stubFalse,
  validate: options.validate || VALIDATE_SUCCESS,
  hasError: options.hasError || stubFalse,
  getErrorText: options.getErrorText || EMPTY_TEXT,
  hasWarning: options.hasWarning || stubFalse,
  getWarningText: options.getWarningText || EMPTY_TEXT,
  toRawValue: identity,
  fromRawValue: identity,
  getOptions: constant(options.options),
});
