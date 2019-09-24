import {ConfigParam} from "../models/proto-gen/SPARK-MAX-Types_dto_pb";
import {IFieldConstraints} from "../store/state";
import {IDictionaryWord} from "../store/dictionaries";

export interface IParamSourceProps {
  parameter: ConfigParam;
  value: number;

  title?: string;
  constraints?: IFieldConstraints;
  isDirty?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  errorText?: string;
  hasWarning?: boolean;
  warningText?: string;
  options?: IDictionaryWord[];

  onValueChange(parameter: ConfigParam, value: number): void;
}

export const getParameterId = (parameter: ConfigParam) => ConfigParam[parameter];
