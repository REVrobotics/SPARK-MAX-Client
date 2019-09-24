import {IApplicationState, IFieldConstraints} from "../state";
import {IDictionaryWord} from "../dictionaries";

export interface IConfigParamRule {
  readonly default?: any;

  getTitle(state: IApplicationState): string;

  isDirty(state: IApplicationState): boolean;

  isDisabled(state: IApplicationState): boolean;

  validate(state: IApplicationState): ConfigParamMessage|undefined;

  getConstraints(state: IApplicationState): IFieldConstraints|undefined;

  getValue(state: IApplicationState): number;

  getDependencies(state: IApplicationState): any[];

  hasError(state: IApplicationState): boolean;

  getErrorText(state: IApplicationState): string|undefined;

  hasWarning(state: IApplicationState): boolean;

  getWarningText(state: IApplicationState): string|undefined;

  getOptions(state: IApplicationState): IDictionaryWord[];

  fromRawValue(raw: number): any;

  toRawValue(typed: any): number;
}

export enum ConfigParamMessageSeverity {
  Error = "Error",
  Warning = "Warning"
}

export class ConfigParamMessage {
  public static error(text: string): ConfigParamMessage {
    return new ConfigParamMessage(ConfigParamMessageSeverity.Error, text);
  }

  public static warning(text: string): ConfigParamMessage {
    return new ConfigParamMessage(ConfigParamMessageSeverity.Warning, text);
  }

  private constructor(readonly severity: ConfigParamMessageSeverity, readonly text: string) {
  }
}
