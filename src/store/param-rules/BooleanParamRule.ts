import {constant, identity, stubFalse} from "lodash";
import {IApplicationState} from "../state";
import {IConfigParamRule} from "./ConfigParamRule";
import {EMPTY_DEPENDENCIES, EMPTY_OPTIONS, EMPTY_TEXT, VALIDATE_SUCCESS} from "./config-param-helpers";

export interface IBooleanRuleOptions {
  default: number;
  title?: string;

  value(state: IApplicationState): number;

  isDisabled?(state: IApplicationState): boolean;

  isDirty?(state: IApplicationState): boolean;
}

export const createBooleanRule = (options: IBooleanRuleOptions,
                                  dependencies?: (state: IApplicationState) => any[]): IConfigParamRule => ({
  default: options.default,
  getTitle: constant(options.title || ""),
  getConstraints: constant(undefined),
  getValue: options.value,
  getDependencies: dependencies || EMPTY_DEPENDENCIES,
  isDisabled: options.isDisabled || stubFalse,
  isDirty: options.isDirty || stubFalse,
  validate: VALIDATE_SUCCESS,
  hasError: stubFalse,
  getErrorText: EMPTY_TEXT,
  hasWarning: stubFalse,
  getWarningText: EMPTY_TEXT,
  toRawValue: identity,
  fromRawValue: identity,
  getOptions: EMPTY_OPTIONS,
});
