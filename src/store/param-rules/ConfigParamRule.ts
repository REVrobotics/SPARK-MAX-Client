import {constant, isFunction, keyBy} from "lodash";
import {IFieldConstraints} from "../state";
import {IDictionaryWord} from "../dictionaries";
import {ConfigParam, configParamValues} from "../../models/ConfigParam";
import {Message} from "../../models/Message";

/**
 * This interface allows to decouple logic in {@link IConfigParamRule} from the context where it is used.
 */
export interface IConfigParamContext {
  getParameter(param: ConfigParam): number;
}

export enum ConfigParamRuleType { Boolean, Numeric, Enum }

/**
 * Rule to manage {@link ConfigParam}.
 * Rule allows to
 * * manage parameter validations
 * * availability of parameter (enabled/disable state on UI)
 * * manage list of available actions
 *
 * The main idea of {@link IConfigParamRule} is to provide centralized storфпу of all parameter-specific logic
 * and generate this logic from the protobuf definitions as much as possible.
 */
export interface IConfigParamRule {
  id: ConfigParam;
  default: number;
  constraints?: IFieldConstraints;
  type: ConfigParamRuleType;

  /**
   * Returns true if this parameter should be disabled, otherwise false.
   */
  isDisabled(context: IConfigParamContext): boolean;

  /**
   * Returns validation {@link Message} if parameter is invalid
   */
  validate(context: IConfigParamContext): Message | undefined;

  /**
   * Returns current validation {@link Message} associated with parameter
   * @param context
   */
  getMessage(context: IConfigParamContext): Message | undefined;

  /**
   * Returns value of parameter
   */
  getValue(context: IConfigParamContext): number;

  /**
   * Return list of available options
   * @param context
   */
  getOptions(context: IConfigParamContext): IDictionaryWord[];

  /**
   * Restores value of the parameter.
   * This method is necessary if value of parameter depends on values of other parameters.
   */
  restore?(context: IConfigParamContext): number;

  fromRawValue(raw: number): any;

  toRawValue(typed: any): number;
}

/**
 * Registry allows to retrieve rule for specific {@link ConfigParam}.
 */
export type IConfigParamRuleRegistry = (param: ConfigParam) => IConfigParamRule;

export type ConfigParamRuleValidator = (context: IConfigParamContext) => Message | undefined;

/**
 * Allows to patch {@link IConfigParamRuleRegistry} by mapping specific rules.
 */
export interface IConfigParamRuleRegistryPatch {
  /**
   * This patch is applied ONLY for parameters `accept` function was called for.
   * @param accept
   */
  visit(accept: (id: ConfigParam) => void): void;

  /**
   * Applies this patch to the specific `rule`
   */
  map(rule: IConfigParamRule): IConfigParamRule;
}

export const EMPTY_OPTIONS = constant([]);
export const VALIDATE_SUCCESS = constant(undefined);

export const getConfigParamRuleId = (rule: IConfigParamRule) => rule.id;

/**
 * Creates {@link IConfigParamRuleRegistry} for the set of `rules`
 */
export const createRuleRegistry = (rules: IConfigParamRule[]): IConfigParamRuleRegistry => {
  const ruleById = keyBy(rules, getConfigParamRuleId);
  return (id) => ruleById[id];
};

/**
 * Creates new registry by substituting some rules in the base `registry`..
 */
export const overrideRuleRegistry = (registry: IConfigParamRuleRegistry,
                                     overriddenRules: IConfigParamRule[]): IConfigParamRuleRegistry => {
  const overriddenRuleById = keyBy(overriddenRules, getConfigParamRuleId);
  return (id) => overriddenRuleById[id] || registry(id);
};

/**
 * Creates new registry by applying set of patch to the base `registry`
 */
export const mapRuleRegistry = (registry: IConfigParamRuleRegistry,
                                patches: IConfigParamRuleRegistryPatch[]): IConfigParamRuleRegistry => {
  const ruleById = {};

  patches.forEach((patch) => {
    patch.visit((id) => {
      const rule = ruleById[id] || registry(id);
      const mappedRule = patch.map(rule);
      if (mappedRule !== rule) {
        ruleById[id] = mappedRule;
      }
    });
  });

  return (id) => ruleById[id] || registry(id);
};

/**
 * Creates a patch to modify some or all {@link IConfigParamRule}s.
 */
export function mapRule(id: ConfigParam,
                        map: (rule: IConfigParamRule) => IConfigParamRule): IConfigParamRuleRegistryPatch;

export function mapRule(map: (rule: IConfigParamRule) => IConfigParamRule): IConfigParamRuleRegistryPatch;

export function mapRule(idOrMap: ConfigParam | ((rule: IConfigParamRule) => IConfigParamRule),
                        optionalMap?: (rule: IConfigParamRule) => IConfigParamRule): IConfigParamRuleRegistryPatch {
  const map: any = optionalMap || idOrMap;
  const paramsToVisit = isFunction(idOrMap) ? configParamValues : [idOrMap as number];

  return {
    visit: (accept) => paramsToVisit.forEach(accept),
    map,
  };
}

/**
 * Creates new rule by merging existing `rule` validator with the provided one (`validator`).
 */
export const mergeValidator = (rule: IConfigParamRule,
                               validator?: ConfigParamRuleValidator): IConfigParamRule => {
  if (validator == null) {
    return rule;
  }

  const validate = (context: IConfigParamContext) => {
    // Run default validation flow
    const message = rule.validate(context);
    if (message) {
      return message;
    }

    return validator(context);
  };

  return {
    ...rule,
    validate,
  };
};
