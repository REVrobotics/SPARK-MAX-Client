import {constant, isFunction, keyBy} from "lodash";
import {IFieldConstraints, Message} from "../state";
import {IDictionaryWord} from "../dictionaries";
import {ConfigParam, configParamValues} from "../../models/ConfigParam";

export interface IConfigParamContext {
  getParameter(param: ConfigParam): number;
}

export interface IConfigParamRule {
  id: ConfigParam;
  default?: any;
  constraints?: IFieldConstraints;

  isDisabled(context: IConfigParamContext): boolean;

  validate(context: IConfigParamContext): Message|undefined;

  getMessage(context: IConfigParamContext): Message|undefined;

  getValue(context: IConfigParamContext): number;

  getOptions(context: IConfigParamContext): IDictionaryWord[];

  fromRawValue(raw: number): any;

  toRawValue(typed: any): number;
}

export type IConfigParamRuleRegistry = (param: ConfigParam) => IConfigParamRule;

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
      const rule = registry(id);
      const mappedRule = patch.map(ruleById[id] || rule);
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
