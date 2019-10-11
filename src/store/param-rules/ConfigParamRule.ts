import {constant, isFunction, keyBy} from "lodash";
import {IFieldConstraints, Message} from "../state";
import {IDictionaryWord} from "../dictionaries";
import {ConfigParam, configParamValues} from "../../models/ConfigParam";

export interface IConfigParamContext {
  getParameter(param: ConfigParam): number;
}

export enum ConfigParamRuleType { Boolean, Numeric, Enum }

export interface IConfigParamRule {
  id: ConfigParam;
  default?: any;
  constraints?: IFieldConstraints;
  type: ConfigParamRuleType;

  isDisabled(context: IConfigParamContext): boolean;

  validate(context: IConfigParamContext): Message | undefined;

  getMessage(context: IConfigParamContext): Message | undefined;

  getValue(context: IConfigParamContext): number;

  getOptions(context: IConfigParamContext): IDictionaryWord[];

  restore?(context: IConfigParamContext): number;

  fromRawValue(raw: number): any;

  toRawValue(typed: any): number;
}

export type IConfigParamRuleRegistry = (param: ConfigParam) => IConfigParamRule;

export type ConfigParamRuleValidator = (context: IConfigParamContext) => Message | undefined;

export interface IConfigParamRuleRegistryPatch {
  visit(accept: (id: ConfigParam) => void): void;

  map(rule: IConfigParamRule): IConfigParamRule;
}

export const EMPTY_OPTIONS = constant([]);
export const VALIDATE_SUCCESS = constant(undefined);

export const getConfigParamRuleId = (rule: IConfigParamRule) => rule.id;

export const createRuleRegistry = (rules: IConfigParamRule[]): IConfigParamRuleRegistry => {
  const ruleById = keyBy(rules, getConfigParamRuleId);
  return (id) => ruleById[id];
};

export const overrideRuleRegistry = (registry: IConfigParamRuleRegistry,
                                     overriddenRules: IConfigParamRule[]): IConfigParamRuleRegistry => {
  const overriddenRuleById = keyBy(overriddenRules, getConfigParamRuleId);
  return (id) => overriddenRuleById[id] || registry(id);
};

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
