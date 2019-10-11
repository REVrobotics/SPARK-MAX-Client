import {ConfigParam, MotorType, SensorType} from "../models/proto-gen/SPARK-MAX-Types_dto_pb";

export enum DictionaryName {
  MotorTypes = "MotorTypes",
  SensorTypes = "SensorTypes",
  ConfigParams = "ConfigParams",
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
    [ConfigParam.kCanID]: "CAN ID",
    [ConfigParam.kMotorType]: "Select Motor Type",
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
  }
};

export function translateWord(name: string, key: any): string {
  return dictionarySet[name][key];
}
