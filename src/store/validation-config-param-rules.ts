/**
 * This file defines more restrictive validations rather than defined in `ram-config-param-rules.ts`.
 * The primary usage of these validations is to validate device configuration files.
 */

import {keyBy} from "lodash";
import {
  ConfigParamRuleType, ConfigParamRuleValidator,
  IConfigParamContext,
  IConfigParamRule,
  mapRule,
  mapRuleRegistry, mergeValidator
} from "./param-rules/ConfigParamRule";
import {ConfigParam, MotorType, SensorType} from "../models/proto-gen/SPARK-MAX-Types_dto_pb";
import {IRawDeviceConfigDto} from "../models/device-config.dto";
import {getConfigParamName, getConfigParamValue} from "../models/ConfigParam";
import {getConfigParamRule} from "./config-param-rules";
import {IEnumFieldConstraints, INumericFieldConstraints} from "./state";
import {substitute} from "../utils/string-utils";
import {MOTOR_TYPES, SENSOR_TYPES} from "./dictionaries";
import {Message} from "../models/Message";

export interface IValidationConfigParamContext extends IConfigParamContext {
  config: IRawDeviceConfigDto;
}

export const createFileConfigParamContext = (config: IRawDeviceConfigDto): IValidationConfigParamContext => {
  const paramById = keyBy(config.parameters, (param) => getConfigParamValue(param.id));
  return {
    config,
    getParameter: (id: ConfigParam) => {
      const param = paramById[id];
      return param ? param.value : undefined as any;
    }
  }
};

const createEnumRuleValidate = (rule: IConfigParamRule): ConfigParamRuleValidator => {
  const values = (rule.constraints as IEnumFieldConstraints).values;
  return (context) => {
    const currentValue = context.getParameter(rule.id);
    if (currentValue == null) {
      return;
    }

    return !values.includes(currentValue) ?
      Message.error("msg_param_validate_enum", {
        name: getConfigParamName(rule.id),
        values: values.join(", "),
        value: currentValue,
      })
      : undefined;
  };
};

const createNumericRuleValidate = (rule: IConfigParamRule): ConfigParamRuleValidator | undefined => {
  if (rule.constraints == null) {
    return;
  }

  const constraints = rule.constraints as INumericFieldConstraints;

  let minMaxMessageId: string;
  if (constraints.min != null && constraints.max != null) {
    minMaxMessageId = "msg_param_validate_numeric_range";
  } else if (constraints.min != null) {
    if (constraints.min === 0) {
      minMaxMessageId = "msg_param_validate_numeric_positive";
    } else {
      minMaxMessageId = "msg_param_validate_numeric_min";
    }
  } else if (constraints.max != null) {
    if (constraints.max === 0) {
      minMaxMessageId = "msg_param_validate_numeric_negative";
    } else {
      minMaxMessageId = "msg_param_validate_numeric_max";
    }
  }

  let integralMessageId: string;
  if (constraints.integral) {
    integralMessageId = "msg_param_validate_numeric_integral";
  }

  return (context) => {
    const currentValue = context.getParameter(rule.id);
    if (currentValue == null) {
      return;
    }

    if (constraints.min != null && currentValue < constraints.min
      || constraints.max != null && currentValue > constraints.max) {
      return Message.error(substitute(minMaxMessageId, {
        name: getConfigParamName(rule.id),
        value: currentValue,
        min: constraints.min,
        max: constraints.max,
      }));
    }

    if (constraints.integral && currentValue !== Math.round(currentValue)) {
      return Message.error(substitute(integralMessageId, {
        name: getConfigParamName(rule.id),
        value: currentValue,
      }));
    }

    return;
  };
};

const createBooleanRuleValidate = (rule: IConfigParamRule): ConfigParamRuleValidator => {
  return (context) => {
    const currentValue = context.getParameter(rule.id);
    if (currentValue == null) {
      return;
    }

    return currentValue !== 0 && currentValue !== 1 ?
      Message.error("msg_param_validate_boolean", { name: getConfigParamName(rule.id), value: currentValue })
      : undefined;
  };
};

const createTypedRuleValidate = (rule: IConfigParamRule): ConfigParamRuleValidator | undefined => {
  switch (rule.type) {
    case ConfigParamRuleType.Enum:
      return createEnumRuleValidate(rule);
    case ConfigParamRuleType.Numeric:
      return createNumericRuleValidate(rule);
    case ConfigParamRuleType.Boolean:
      return createBooleanRuleValidate(rule);
    default:
      return;
  }
};

const dependencyValidators: { [id: number]: ConfigParamRuleValidator } = {
  [ConfigParam.kMotorType]: (ctx) => {
    const motorType = ctx.getParameter(ConfigParam.kMotorType);
    const sensorType = ctx.getParameter(ConfigParam.kSensorType);
    if (sensorType == null) {
      return;
    }

    return motorType === MotorType.Brushless && sensorType !== SensorType.HallSensor ?
      Message.error("msg_param_validate_motor_type", {
        motorTypeTextValue: MOTOR_TYPES.get(motorType).text,
        motorTypeValue: motorType,
        sensorTypeTextValue: MOTOR_TYPES.get(sensorType).text,
        sensorTypeValue: sensorType,
        hallSensorTextValue: SENSOR_TYPES.get(SensorType.HallSensor).text,
        hallSensorValue: SensorType.HallSensor,
      })
      : undefined;
  },
  [ConfigParam.kSensorType]: (ctx) => {
    const sensorType = ctx.getParameter(ConfigParam.kSensorType);
    const motorType = ctx.getParameter(ConfigParam.kMotorType);
    if (motorType == null) {
      return;
    }

    return sensorType !== SensorType.HallSensor && motorType === MotorType.Brushless ?
      Message.error("msg_param_validate_motor_type", {
        sensorTypeTextValue: MOTOR_TYPES.get(sensorType).text,
        sensorTypeValue: sensorType,
        motorTypeTextValue: MOTOR_TYPES.get(motorType).text,
        motorTypeValue: motorType,
        brushedTextValue: MOTOR_TYPES.get(MotorType.Brushed).text,
        brushedValue: SensorType.HallSensor,
      })
      : undefined;
  }
};

/**
 * Returns registry for {@link IConfigParamRule}s with type-based validations.
 * These config rules validate that
 * * enumeration-based parameter has one of allowed values
 * * numeric-based parameter has value satisfying min, max and other parameters
 * * boolean-based parameter has either 0 or 1 value
 */
export const getTypeValidationConfigParamRule = mapRuleRegistry(getConfigParamRule, [
  mapRule((rule) => mergeValidator(rule, createTypedRuleValidate(rule))),
]);

/**
 * Returns registry for {@link IConfigParamRule}s with dependency validations
 */
export const getDependencyValidationConfigParamRule = mapRuleRegistry(getConfigParamRule, [
  mapRule((rule) => mergeValidator(rule, dependencyValidators[rule.id])),
]);
