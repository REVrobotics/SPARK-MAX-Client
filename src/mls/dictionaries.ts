import {fromPairs} from "lodash";
import {ConfigParam, MotorType, SensorType} from "../models/proto-gen/SPARK-MAX-Types_dto_pb";
import {LegendAlignment} from "../store/state";
import {enumValues} from "../models/dto-utils";

export enum DictionaryName {
  MotorTypes = "MotorTypes",
  SensorTypes = "SensorTypes",
  ConfigParams = "ConfigParams",
  LegendAlignments = "LegendAlignments",
}

const dictionarySet = {
  [DictionaryName.MotorTypes]: {
    [MotorType.Brushed]: "Brushed",
    [MotorType.Brushless]: "Brushless",
  },
  [DictionaryName.SensorTypes]: {
    [SensorType.NoSensor]: "No Sensor",
    [SensorType.HallSensor]: "Hall Effect",
    [SensorType.Encoder]: "Encoder",
  },
  [DictionaryName.ConfigParams]: {
    ...fromPairs(enumValues(ConfigParam).map((value) => [value, ConfigParam[value]])),
    [ConfigParam.kCanID]: "CAN ID",
    [ConfigParam.kMotorType]: "Motor Type",
    [ConfigParam.kSensorType]: "Sensor Type",
    [ConfigParam.kIdleMode]: "Idle Mode",
    [ConfigParam.kInputDeadband]: "PWM Input Deadband",
    [ConfigParam.kRampRate]: "Rate (seconds to full speed)",
    [ConfigParam.kSmartCurrentStallLimit]: "Smart Current Limit",
    [ConfigParam.kEncoderCountsPerRev]: "Encoder CPR",
    [ConfigParam.kHardLimitFwdEn]: "Forward Limit",
    [ConfigParam.kHardLimitRevEn]: "Reverse Limit",
    [ConfigParam.kSoftLimitFwdEn]: "Forward Limit",
    [ConfigParam.kSoftLimitRevEn]: "Reverse Limit",
    [ConfigParam.kSoftLimitFwd]: "Forward Limit (value)",
    [ConfigParam.kSoftLimitRev]: "Reverse Limit (value)",
  },
  [DictionaryName.LegendAlignments]: {
    [LegendAlignment.Top]: "On Top",
    [LegendAlignment.Right]: "On Right",
  },
};

export function translateWord(name: string, key: any): string {
  const translation = dictionarySet[name][key];
  if (translation != null) {
    return translation;
  }
  return `${name}:${key}`;
}
