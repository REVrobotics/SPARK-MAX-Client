import {isString, keyBy} from "lodash";
import {ControlType, IdleMode, MotorType, SensorType} from "../models/proto-gen/SPARK-MAX-Types_dto_pb";
import {DictionaryName, translateWord} from "../mls/dictionaries";
import {LegendPosition} from "../display/display-interfaces";
import {enumValues} from "../models/dto-utils";

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

export const IDLE_MODES = Dictionary.from(
  DictionaryName.IdleModes,
  [IdleMode.Coast, IdleMode.Brake]);

export const SENSOR_TYPES = Dictionary.from(
  DictionaryName.SensorTypes,
  [SensorType.NoSensor, SensorType.HallSensor, SensorType.Encoder]);

export const LEGEND_POSITIONS = Dictionary.from(
  DictionaryName.LegendPositions,
  [LegendPosition.Top, LegendPosition.Right, LegendPosition.Inside]);

export const CONTROL_MODES = Dictionary.from(
  DictionaryName.ControlModes,
  enumValues(ControlType),
);

export const PID_PROFILES = Dictionary.from(
  DictionaryName.PidProfiles,
  [0, 1, 2, 3],
)

export const DATA_PORT_CONFIGS = Dictionary.from(
  DictionaryName.DataPortConfigs,
  [0, 1],
)
