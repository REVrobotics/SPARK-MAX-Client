import {ConfigParam, enumValues, MotorType, ParamType, SensorType} from "../models/dto";
import {createRuleRegistry, overrideRuleRegistry} from "./param-rules/ConfigParamRule";
import {createNumericRule} from "./param-rules/NumericParamRule";
import {createEnumRule} from "./param-rules/EnumParamRule";
import {createBooleanRule} from "./param-rules/BooleanParamRule";
import {MOTOR_TYPES, SENSOR_TYPES} from "./dictionaries";
import {configParamNames, getConfigParamType} from "../models/ConfigParam";

/**
 * Generated rules for ALL parameters.
 * Here we rely on definitions generated based on proto files.
 */
const GENERATED_RULES = configParamNames.map((name) => {
  const type = getConfigParamType(name);
  const param = ConfigParam[name];

  switch (type) {
    case ParamType.int32:
      return createNumericRule(param, {
        default: 0,
      });
    case ParamType.uint32:
      return createNumericRule(param, {
        default: 0,
        constraints: {
          min: 0,
          integral: true,
        }
      });
    case ParamType.float32:
      return createNumericRule(param, {
        default: 0,
      });
    case ParamType.bool:
      return createBooleanRule(param, {
        default: 0,
      });
    default:
      throw new Error(`Unknown type of parameter '${name}': ${type}`);
  }
});

/**
 * Overridden rules for some parameters.
 * Sometimes type information (uint32, int32, float32, bool) is not enough to generate all constraints.
 * For example, kCanID has type uint32, but should allow only 0-62 values.
 */
const OVERRIDDEN_RULES = [
  createNumericRule(ConfigParam.kCanID, {
    default: 0,
    constraints: {
      min: 1,
      max: 62,
      integral: true,
    },
  }),
  createEnumRule(ConfigParam.kMotorType, {
    default: MotorType.Brushless,
    options: MOTOR_TYPES.seq(),
    values: enumValues(MotorType),
    restore: (ctx) => {
      const motorType = ctx.getParameter(ConfigParam.kMotorType);
      const sensorType = ctx.getParameter(ConfigParam.kSensorType);
      return sensorType === SensorType.HallSensor ? motorType : MotorType.Brushed;
    },
  }),
  createEnumRule(ConfigParam.kSensorType, {
    default: SensorType.HallSensor,
    options: SENSOR_TYPES.seq(),
    values: enumValues(SensorType),
    isDisabled: (ctx) => ctx.getParameter(ConfigParam.kMotorType) === MotorType.Brushless,
    restore: (ctx) => {
      const sensorType = ctx.getParameter(ConfigParam.kSensorType);
      const motorType = ctx.getParameter(ConfigParam.kMotorType);
      return motorType === MotorType.Brushless ? SensorType.HallSensor : sensorType;
    },
  }),
  createNumericRule(ConfigParam.kInputDeadband, {
    default: 0,
    constraints: {
      min: 0,
      max: 0.3,
    },
  }),
  createNumericRule(ConfigParam.kRampRate, {
    default: 0,
    constraints: {
      min: 0,
      max: 1024,
      integral: true,
    },
  }),
  createNumericRule(ConfigParam.kSmartCurrentStallLimit, {
    default: 80,
    constraints: {
      min: 0,
      integral: true,
    },
  }),
  createNumericRule(ConfigParam.kEncoderCountsPerRev, {
    default: 4096,
    constraints: {
      min: 1,
      integral: true,
    },
    isDisabled: (ctx) => {
      const motorType = ctx.getParameter(ConfigParam.kMotorType);
      const sensorType = ctx.getParameter(ConfigParam.kSensorType);
      return motorType === MotorType.Brushless || sensorType !== SensorType.Encoder;
    }
  }),
  createNumericRule(ConfigParam.kSoftLimitFwd, {
    default: 0,
    constraints: {
      min: 0,
    },
    isDisabled: (ctx) => !ctx.getParameter(ConfigParam.kSoftLimitFwdEn),
  }),
  createNumericRule(ConfigParam.kSoftLimitRev, {
    default: 0,
    constraints: {
      min: 0,
    },
    isDisabled: (ctx) => !ctx.getParameter(ConfigParam.kSoftLimitRevEn),
  }),
  createNumericRule(ConfigParam.kP_0, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
  }),
  createNumericRule(ConfigParam.kP_1, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
  }),
  createNumericRule(ConfigParam.kP_2, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
  }),
  createNumericRule(ConfigParam.kP_3, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
  }),
  createNumericRule(ConfigParam.kI_0, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
  }),
  createNumericRule(ConfigParam.kI_1, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
  }),
  createNumericRule(ConfigParam.kI_2, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
  }),
  createNumericRule(ConfigParam.kI_3, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
  }),
  createNumericRule(ConfigParam.kD_0, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
  }),
  createNumericRule(ConfigParam.kD_1, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
  }),
  createNumericRule(ConfigParam.kD_2, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
  }),
  createNumericRule(ConfigParam.kD_3, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
  }),
  createNumericRule(ConfigParam.kF_0, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
  }),
  createNumericRule(ConfigParam.kF_1, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
  }),
  createNumericRule(ConfigParam.kF_2, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
  }),
  createNumericRule(ConfigParam.kF_3, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
    },
  }),
];

export const getGeneratedConfigParamRule = createRuleRegistry(GENERATED_RULES);
export const getConfigParamRule = overrideRuleRegistry(getGeneratedConfigParamRule, OVERRIDDEN_RULES);
