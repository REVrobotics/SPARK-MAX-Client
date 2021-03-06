import {ConfigParam, enumValues, IdleMode, MotorType, ParamType, SensorType, DataPortConfigTypes} from "../models/dto";
import {createRuleRegistry, overrideRuleRegistry} from "./param-rules/ConfigParamRule";
import {createNumericRule} from "./param-rules/NumericParamRule";
import {createEnumRule} from "./param-rules/EnumParamRule";
import {createBooleanRule} from "./param-rules/BooleanParamRule";
import {IDLE_MODES, MOTOR_TYPES, SENSOR_TYPES, DATA_PORT_CONFIGS} from "./dictionaries";
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
      // We have to guarantee that if kSensorType is not HallSensor, then kMotorType=Brushed
      const motorType = ctx.getParameter(ConfigParam.kMotorType);
      const sensorType = ctx.getParameter(ConfigParam.kSensorType);
      return sensorType === SensorType.HallSensor ? motorType : MotorType.Brushed;
    },
  }),
  createEnumRule(ConfigParam.kIdleMode, {
    default: IdleMode.Coast,
    options: IDLE_MODES.seq(),
    values: enumValues(IdleMode),
  }),
  createEnumRule(ConfigParam.kSensorType, {
    default: SensorType.HallSensor,
    options: SENSOR_TYPES.seq(),
    values: enumValues(SensorType),
    isDisabled: (ctx) => ctx.getParameter(ConfigParam.kMotorType) === MotorType.Brushless,
    restore: (ctx) => {
      // We have to guarantee that if kMotorType=Brushelss, then kSensorType=HallSensor
      const sensorType = ctx.getParameter(ConfigParam.kSensorType);
      const motorType = ctx.getParameter(ConfigParam.kMotorType);
      return motorType === MotorType.Brushless ? SensorType.HallSensor : sensorType;
    },
  }),
  createEnumRule(ConfigParam.kDataPortConfig, {
    default: 0,
    options: DATA_PORT_CONFIGS.seq(),
    values: enumValues(DataPortConfigTypes),
  }),
  createNumericRule(ConfigParam.kInputDeadband, {
    default: 0,
    constraints: {
      min: 0,
      max: 0.3,
      stepSize: 0.01,
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
    isDisabled: (ctx) => !ctx.getParameter(ConfigParam.kSoftLimitFwdEn),
  }),
  createNumericRule(ConfigParam.kSoftLimitRev, {
    default: 0,
    isDisabled: (ctx) => !ctx.getParameter(ConfigParam.kSoftLimitRevEn),
  }),
  createNumericRule(ConfigParam.kP_0, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
      stepSize: 0.1,
    },
  }),
  createNumericRule(ConfigParam.kP_1, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
      stepSize: 0.1,
    },
  }),
  createNumericRule(ConfigParam.kP_2, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
      stepSize: 0.1,
    },
  }),
  createNumericRule(ConfigParam.kP_3, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
      stepSize: 0.1,
    },
  }),
  createNumericRule(ConfigParam.kI_0, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
      stepSize: 0.1,
    },
  }),
  createNumericRule(ConfigParam.kI_1, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
      stepSize: 0.1,
    },
  }),
  createNumericRule(ConfigParam.kI_2, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
      stepSize: 0.1,
    },
  }),
  createNumericRule(ConfigParam.kI_3, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
      stepSize: 0.1,
    },
  }),
  createNumericRule(ConfigParam.kD_0, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
      stepSize: 0.1,
    },
  }),
  createNumericRule(ConfigParam.kD_1, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
      stepSize: 0.1,
    },
  }),
  createNumericRule(ConfigParam.kD_2, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
      stepSize: 0.1,
    },
  }),
  createNumericRule(ConfigParam.kD_3, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
      stepSize: 0.1,
    },
  }),
  createNumericRule(ConfigParam.kF_0, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
      stepSize: 0.1,
    },
  }),
  createNumericRule(ConfigParam.kF_1, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
      stepSize: 0.1,
    },
  }),
  createNumericRule(ConfigParam.kF_2, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
      stepSize: 0.1,
    },
  }),
  createNumericRule(ConfigParam.kF_3, {
    default: 0,
    constraints: {
      min: 0,
      max: 3,
      stepSize: 0.1,
    },
  }),
];

export const getGeneratedConfigParamRule = createRuleRegistry(GENERATED_RULES);
export const getConfigParamRule = overrideRuleRegistry(getGeneratedConfigParamRule, OVERRIDDEN_RULES);
export const toConfigParamDefaultValue = (param: ConfigParam, value?: number) => {
  if (value == null || isNaN(value)) {
    return getConfigParamRule(param).default;
  } else {
    return value;
  }
};
