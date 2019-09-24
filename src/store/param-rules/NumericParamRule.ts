import {constant, identity, stubFalse} from "lodash";
import {IApplicationState, INumericFieldConstraints} from "../state";
import {ConfigParamMessage, IConfigParamRule} from "./ConfigParamRule";
import {EMPTY_DEPENDENCIES, EMPTY_OPTIONS, EMPTY_TEXT, VALIDATE_SUCCESS} from "./config-param-helpers";

export interface INumericRuleOptions {
  default: number;
  title?: string;
  constraints?: INumericFieldConstraints;

  value(state: IApplicationState): number;

  isDisabled?(state: IApplicationState): boolean;

  isDirty?(state: IApplicationState): boolean;

  validate?(state: IApplicationState): ConfigParamMessage|undefined;

  hasError?(state: IApplicationState): boolean;

  getErrorText?(state: IApplicationState): string|undefined;

  hasWarning?(state: IApplicationState): boolean;

  getWarningText?(state: IApplicationState): string|undefined;
}

export const createNumericRule = (options: INumericRuleOptions,
                                  dependencies?: (state: IApplicationState) => any[]): IConfigParamRule => ({
  default: options.default,
  getTitle: constant(options.title || ""),
  getConstraints: constant(options.constraints),
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
  getOptions: EMPTY_OPTIONS,
});
