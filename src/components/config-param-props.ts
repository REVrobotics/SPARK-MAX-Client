import {ConfigParam} from "../models/proto-gen/SPARK-MAX-Types_dto_pb";
import {IFieldConstraints} from "../store/state";
import {IDictionaryWord} from "../store/dictionaries";
import {Message} from "../models/Message";

export interface IConfigParamProps {
  parameter: ConfigParam;
  value: number;

  constraints?: IFieldConstraints;
  isDirty?: boolean;
  disabled?: boolean;
  message?: Message;
  options?: IDictionaryWord[];

  onValueChange(parameter: ConfigParam, value: number): void;
}

export const getParameterId = (parameter: ConfigParam) => ConfigParam[parameter];
