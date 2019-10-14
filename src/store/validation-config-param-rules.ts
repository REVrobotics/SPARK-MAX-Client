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
import {IEnumFieldConstraints, INumericFieldConstraints, Message} from "./state";
import {substitute} from "../utils/string-utils";
import {MOTOR_TYPES, SENSOR_TYPES} from "./dictionaries";

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
      Message.error(`Parameter '${getConfigParamName(rule.id)}' should be set to one of the following values: ${values.join(", ")}. Current value is ${currentValue}`)
      : undefined;
  };
};

const createNumericRuleValidate = (rule: IConfigParamRule): ConfigParamRuleValidator | undefined => {
  if (rule.constraints == null) {
    return;
  }

  const constraints = rule.constraints as INumericFieldConstraints;

  let minMaxMessageText: string;
  if (constraints.min != null && constraints.max != null) {
    minMaxMessageText = "Parameter '$name' should have value between $min and $max. Current value is $value";
  } else if (constraints.min != null) {
    if (constraints.min === 0) {
      minMaxMessageText = "Parameter '$name' should be positive. Current value is $value";
    } else {
      minMaxMessageText = "Parameter '$name' should be more than $min. Current value is $value";
    }
  } else if (constraints.max != null) {
    if (constraints.max === 0) {
      minMaxMessageText = "Parameter '$name' should be negative. Current value is $value";
    } else {
      minMaxMessageText = "Parameter '$name' should be less than $max. Current value is $value";
    }
  }

  let integralMessageText: string;
  if (constraints.integral) {
    integralMessageText = "Parameter '$name' allows only integral values. Current value is $value";
  }

  return (context) => {
    const currentValue = context.getParameter(rule.id);
    if (currentValue == null) {
      return;
    }

    if (constraints.min != null && currentValue < constraints.min
      || constraints.max != null && currentValue > constraints.max) {
      return Message.error(substitute(minMaxMessageText, {
        name: getConfigParamName(rule.id),
        value: currentValue,
        min: constraints.min,
        max: constraints.max,
      }));
    }

    if (constraints.integral && currentValue !== Math.round(currentValue)) {
      return Message.error(substitute(integralMessageText, {
        name: getConfigParamName(rule.id),
        value: currentValue,
      }));
    }

    return;
  };
};

const createBooleanRuleValidate = (rule: IConfigParamRule): ConfigParamRuleValidator => {
  const values = [0, 1];
  return (context) => {
    const currentValue = context.getParameter(rule.id);
    if (currentValue == null) {
      return;
    }

    return !values.includes(currentValue) ?
      Message.error(`Parameter '${getConfigParamName(rule.id)}' should be set to one of the following values: ${values.join(", ")}. Current value is ${currentValue}`)
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
      Message.error(`Parameter 'kMotorType' can be set to '${MOTOR_TYPES.get(motorType).text}' (${motorType}) only when 'kSensorType' equals to '${SENSOR_TYPES.get(SensorType.HallSensor).text}' (${SensorType.HallSensor}). Current value of 'kMotorType' parameter is '${MOTOR_TYPES.get(motorType).text}' (${motorType}) and 'kSensorType' is '${SENSOR_TYPES.get(sensorType).text}' (${sensorType})`)
      : undefined;
  },
  [ConfigParam.kSensorType]: (ctx) => {
    const sensorType = ctx.getParameter(ConfigParam.kSensorType);
    const motorType = ctx.getParameter(ConfigParam.kMotorType);
    if (motorType == null) {
      return;
    }

    return sensorType !== SensorType.HallSensor && motorType === MotorType.Brushless ?
      Message.error(`Parameter 'kSensorType' can be set to '${SENSOR_TYPES.get(sensorType).text}' (${sensorType}) only when 'kMotorType' is set to '${MOTOR_TYPES.get(MotorType.Brushed).text}' (${MotorType.Brushed}). Current value of 'kSensorType' parameter is '${SENSOR_TYPES.get(sensorType).text}' (${sensorType}) and 'kMotorType' is '${MOTOR_TYPES.get(motorType).text}' (${motorType})`)
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
