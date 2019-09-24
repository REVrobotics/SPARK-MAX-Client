import {ConfigParam, IdleMode, MotorType, SensorType} from "../models/dto";
import {ConfigParamMessage, IConfigParamRule} from "./param-rules/ConfigParamRule";
import {configParamAccessor, getSelectedDeviceParamValueOrDefault} from "./param-rules/config-param-helpers";
import {createNumericRule} from "./param-rules/NumericParamRule";
import {createSelectRule} from "./param-rules/SelectParamRule";
import {createBooleanRule} from "./param-rules/BooleanParamRule";
import {MOTOR_TYPES, SENSOR_TYPES} from "./dictionaries";

const RULES: {[param: number]: IConfigParamRule} = {
  [ConfigParam.kCanID]: createNumericRule({
    default: 0,
    title: "CAN ID",
    constraints: {
      min: 1,
      max: 62,
      integral: true,
    },
    ...configParamAccessor(
      ConfigParam.kCanID,
      (value) => value === 0 ?
        ConfigParamMessage.error("For proper operation of the SPARK MAX, please change all SPARK MAX CAN IDs from 0 to any unused ID from 1 to 62.")
        : undefined),
  }),
  [ConfigParam.kMotorType]: createSelectRule({
    default: MotorType.Brushless,
    title: "Select Motor Type",
    options: MOTOR_TYPES.seq(),
    ...configParamAccessor(ConfigParam.kMotorType),
  }),
  [ConfigParam.kSensorType]: createSelectRule({
    default: SensorType.HallSensor,
    title: "Sensor Type",
    options: SENSOR_TYPES.seq(),
    ...configParamAccessor(ConfigParam.kSensorType),
    isDisabled: (state) => getSelectedDeviceParamValueOrDefault(state, ConfigParam.kMotorType) === MotorType.Brushless,
  }),
  [ConfigParam.kIdleMode]: createBooleanRule({
    default: IdleMode.Coast,
    title: "Idle Mode",
    ...configParamAccessor(ConfigParam.kIdleMode),
  }),
  [ConfigParam.kInputDeadband]: createNumericRule({
    default: 0,
    title: "PWM Input Deadband",
    constraints: {
      min: 0,
      max: 0.3,
    },
    ...configParamAccessor(ConfigParam.kInputDeadband),
  }),
  [ConfigParam.kRampRate]: createNumericRule({
    default: 0,
    title: "Rate (seconds to full speed)",
    constraints: {
      min: 0,
      max: 1024,
      integral: true,
    },
    ...configParamAccessor(ConfigParam.kRampRate),
  }),
  [ConfigParam.kSmartCurrentStallLimit]: createNumericRule({
    default: 80,
    title: "Smart Current Limit",
    constraints: {
      min: 0,
      integral: true,
    },
    ...configParamAccessor(ConfigParam.kSmartCurrentStallLimit),
  }),
  [ConfigParam.kEncoderCountsPerRev]: createNumericRule({
    default: 4096,
    title: "Encoder CPR",
    constraints: {
      min: 1,
      integral: true,
    },
    ...configParamAccessor(ConfigParam.kEncoderCountsPerRev),
    isDisabled: (state) => {
      const motorType = getSelectedDeviceParamValueOrDefault(state, ConfigParam.kMotorType);
      const sensorType = getSelectedDeviceParamValueOrDefault(state, ConfigParam.kSensorType);
      return motorType === MotorType.Brushless || sensorType !== SensorType.Encoder;
    }
  }),
  [ConfigParam.kHardLimitFwdEn]: createBooleanRule({
    default: 0,
    title: "Forward Limit",
    ...configParamAccessor(ConfigParam.kHardLimitFwdEn),
  }),
  [ConfigParam.kHardLimitRevEn]: createBooleanRule({
    default: 0,
    title: "Reverse Limit",
    ...configParamAccessor(ConfigParam.kHardLimitRevEn),
  }),
  [ConfigParam.kLimitSwitchFwdPolarity]: createBooleanRule({
    default: 0,
    ...configParamAccessor(ConfigParam.kLimitSwitchFwdPolarity),
  }),
  [ConfigParam.kLimitSwitchRevPolarity]: createBooleanRule({
    default: 0,
    ...configParamAccessor(ConfigParam.kLimitSwitchRevPolarity),
  }),
  [ConfigParam.kSoftLimitFwdEn]: createBooleanRule({
    default: 0,
    title: "Forward Limit",
    ...configParamAccessor(ConfigParam.kSoftLimitFwdEn),
  }),
  [ConfigParam.kSoftLimitRevEn]: createBooleanRule({
    default: 0,
    title: "Reverse Limit",
    ...configParamAccessor(ConfigParam.kSoftLimitRevEn),
  }),
  [ConfigParam.kSoftLimitFwd]: createNumericRule({
    default: 0,
    title: "Forward Limit (value)",
    constraints: {
      min: 0,
    },
    ...configParamAccessor(ConfigParam.kSoftLimitFwd),
    isDisabled: (state) => !getSelectedDeviceParamValueOrDefault(state, ConfigParam.kSoftLimitFwdEn),
  }),
  [ConfigParam.kSoftLimitRev]: createNumericRule({
    default: 0,
    title: "Reverse Limit (value)",
    constraints: {
      min: 0,
    },
    ...configParamAccessor(ConfigParam.kSoftLimitRev),
    isDisabled: (state) => !getSelectedDeviceParamValueOrDefault(state, ConfigParam.kSoftLimitRevEn),
  }),
  [ConfigParam.kP_0]: createNumericRule({
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
    ...configParamAccessor(ConfigParam.kP_0),
  }),
  [ConfigParam.kI_0]: createNumericRule({
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
    ...configParamAccessor(ConfigParam.kI_0),
  }),
  [ConfigParam.kD_0]: createNumericRule({
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
    ...configParamAccessor(ConfigParam.kD_0),
  }),
  [ConfigParam.kF_0]: createNumericRule({
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
    ...configParamAccessor(ConfigParam.kF_0),
  }),
  [ConfigParam.kP_1]: createNumericRule({
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
    ...configParamAccessor(ConfigParam.kP_1),
  }),
  [ConfigParam.kI_1]: createNumericRule({
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
    ...configParamAccessor(ConfigParam.kI_1),
  }),
  [ConfigParam.kD_1]: createNumericRule({
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
    ...configParamAccessor(ConfigParam.kD_1),
  }),
  [ConfigParam.kF_1]: createNumericRule({
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
    ...configParamAccessor(ConfigParam.kF_1),
  }),
  [ConfigParam.kP_2]: createNumericRule({
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
    ...configParamAccessor(ConfigParam.kP_2),
  }),
  [ConfigParam.kI_2]: createNumericRule({
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
    ...configParamAccessor(ConfigParam.kI_2),
  }),
  [ConfigParam.kD_2]: createNumericRule({
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
    ...configParamAccessor(ConfigParam.kD_2),
  }),
  [ConfigParam.kF_2]: createNumericRule({
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
    ...configParamAccessor(ConfigParam.kF_2),
  }),
  [ConfigParam.kP_3]: createNumericRule({
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
    ...configParamAccessor(ConfigParam.kP_3),
  }),
  [ConfigParam.kI_3]: createNumericRule({
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
    ...configParamAccessor(ConfigParam.kI_3),
  }),
  [ConfigParam.kD_3]: createNumericRule({
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
    ...configParamAccessor(ConfigParam.kD_3),
  }),
  [ConfigParam.kF_3]: createNumericRule({
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
    ...configParamAccessor(ConfigParam.kF_3),
  }),
};

export const getConfigParamRule = (parameter: ConfigParam) => RULES[parameter];
