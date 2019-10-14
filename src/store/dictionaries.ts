import {isString, keyBy} from "lodash";
import {MotorType, SensorType} from "../models/proto-gen/SPARK-MAX-Types_dto_pb";
import {DictionaryName, translateWord} from "../mls/dictionaries";

export interface IDictionaryWord {
  id: any;
  text: string;
}

/**
 * Dictionary describes immutable and ordered set of `id`/`text` entries.
 * Typically, it is used to represent entries in select, like sensor types, motor types, etc.
 */
export class Dictionary {
  public static from(name: string, values: any[]): Dictionary;
  public static from(words: IDictionaryWord[]): Dictionary;
  public static from(nameOrWords: string | IDictionaryWord[], optionalValues?: any[]): Dictionary {
    const words = isString(nameOrWords) ?
      optionalValues!.map((id) => ({ id, text: translateWord(nameOrWords as any, id) }))
      : nameOrWords;
    return new Dictionary(words);
  }

  private index: {[key: string]: IDictionaryWord} = {};

  constructor(
    private words: IDictionaryWord[]) {
    this.index = keyBy(words as any[], ({id}) => id);
  }

  /**
   * Returns ordered entries
   */
  public seq(): IDictionaryWord[] {
    return this.words;
  }

  /**
   * Returns text of entry by the given ID
   */
  public get(id: any): IDictionaryWord {
    return this.index[id];
  }
}

export const getWordText = (option: IDictionaryWord) => option.text;

// Some dictionaries defines here

export const MOTOR_TYPES = Dictionary.from(
  DictionaryName.MotorTypes,
  [MotorType.Brushless, MotorType.Brushed]);

export const SENSOR_TYPES = Dictionary.from(
  DictionaryName.SensorTypes,
  [SensorType.NoSensor, SensorType.HallSensor, SensorType.Encoder]);
