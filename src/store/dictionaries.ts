import {keyBy} from "lodash";
import {MotorType, SensorType} from "../models/proto-gen/SPARK-MAX-Types_dto_pb";

export interface IDictionaryWord {
  id: any;
  text: string;
}

/**
 * Dictionary describes immutable and ordered set of `id`/`text` entries.
 * Typically, it is used to represent entries in select, like sensor types, motor types, etc.
 */
export class Dictionary {
  public static from(words: IDictionaryWord[]): Dictionary {
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

export const MOTOR_TYPES = Dictionary.from([
  {id: MotorType.Brushless, text: "Brushless"},
  {id: MotorType.Brushed, text: "Brushed"},
]);

export const SENSOR_TYPES = Dictionary.from([
  {id: SensorType.NoSensor, text: "No Sensor"},
  {id: SensorType.HallSensor, text: "Hall Effect"},
  {id: SensorType.Encoder, text: "Encoder"},
]);
