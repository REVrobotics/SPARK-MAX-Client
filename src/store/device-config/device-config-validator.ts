import {compact, get, keyBy, without} from "lodash";
import * as Ajv from "ajv";
import {ErrorObject} from "ajv";
import {ConfigParam, configParamNames, getConfigParamName, getConfigParamValue} from "../../models/ConfigParam";
import {IRawDeviceConfigDto} from "../../models/device-config.dto";
import {
  compactFixedDeviceConfig,
  createMessageViolation,
  createSchemaViolationFactory,
  createViolation,
  defaultViolationFactory,
  fixConfigurationName,
  fixParameterName,
  fixWhen,
  omitParameter,
  Violation,
  ViolationContext,
  ViolationFactory
} from "./device-config-violations";
import {
  createFileConfigParamContext,
  getDependencyValidationConfigParamRule,
  getTypeValidationConfigParamRule
} from "../validation-config-param-rules";
import {IConfigParamRuleRegistry} from "../param-rules/ConfigParamRule";
import {Message, MessageSeverity} from "../../models/Message";

// tslint:disable-next-line:interface-over-type-literal
export type DeviceConfigValidationResult = {
  configuration: IRawDeviceConfigDto;
  violations: Violation[];
  fixedConfiguration?: IRawDeviceConfigDto;
  valid: boolean;
}

/**
 * Defines custom format errors and fixes.
 * Each entry corresponds to separate ajv error and allows to define
 * * how to display error
 * * how to fix error, if any (if error cannot be fixed, configuration is considered invalid)
 */
const messages = {
  required: createSchemaViolationFactory({
    text: "msg_config_field_required",
    fixFactory: fixWhen(({params}) => params.missingProperty === "name")(fixConfigurationName),
  }),
  properties: {
    name: {
      type: createSchemaViolationFactory({
        text: "msg_config_type_string",
        fixFactory: fixConfigurationName,
      }),
    },
    parameters: {
      type: createSchemaViolationFactory({text: "msg_config_parameters_type"}),
      items: {
        type: createSchemaViolationFactory({
          text: "msg_config_parameters_items_type",
          fixFactory: omitParameter,
        }),
        required: createSchemaViolationFactory({
          text: "msg_config_required",
          fixFactory: omitParameter,
        }),
        properties: {
          id: {
            type: createSchemaViolationFactory({
              text: "msg_config_parameter_item_id_type",
              fixFactory: omitParameter,
            }),
            enum: createSchemaViolationFactory({
              text: "msg_config_parameter_item_id_enum",
              fixFactory: omitParameter,
            }),
          },
          name: {
            type: createSchemaViolationFactory({
              text: "msg_config_parameter_item_name_type",
              severity: MessageSeverity.Warning,
              fixFactory: fixParameterName,
            }),
          },
          value: {
            type: createSchemaViolationFactory({
              text: "msg_config_parameter_item_value_type",
              fixFactory: omitParameter,
            }),
          },
        }
      }
    }
  }
};

/**
 * Finds {@link ViolationFactory} in format error registry
 */
const findViolationFactory = (schemaPath: string): ViolationFactory =>
  get(messages, schemaPath.substring(2).replace(/\//g, "."));

/**
 * Creates ajv validator to validate JSON file format.
 */
const createConfigValidator = () => {
  const ajv = new Ajv({allErrors: true, removeAdditional: true});
  return ajv.compile({
    additionalProperties: false,
    type: "object",
    required: ["name", "parameters"],
    properties: {
      fileName: {type: "string"},
      filePath: {type: "string"},
      template: {type: "boolean"},
      name: {type: "string"},
      parameters: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "value"],
          properties: {
            id: {
              type: "string",
              enum: without(configParamNames, getConfigParamName(ConfigParam.kCanID)),
            },
            name: {type: "string"},
            value: {type: "number"}
          }
        }
      }
    },
  });
};

const configValidator = createConfigValidator();

/**
 * Validates configuration file format using ajv library.
 * This method returns set of {@link Violation}s defined by format error registry.
 */
const validateConfigurationFormatBySchema = (config: any) => {
  const isValid = configValidator(config);
  return isValid ? [] : (configValidator.errors || []).map((error) => errorToViolation(error, config));
};

/**
 * Converts ajv {@link ErrorObject} to {@link Violation} using format error registry.
 * Entry from format error registry is found using {@link ErrorObject.schemaPath} field.
 * @param error
 * @param config
 */
const errorToViolation = (error: ErrorObject, config: any) => {
  const messageFactory = findViolationFactory(error.schemaPath);
  return messageFactory ? messageFactory(error, config) : defaultViolationFactory(error, config);
};

/**
 * Validates configuration file format and returns set of {@link Violation}s.
 */
export const validateConfigurationFormat = (config: IRawDeviceConfigDto) => {
  const invalidConfiguration = config.error ? createMessageViolation(Message.errorFromText(config.error)) : undefined;

  const formatViolations = validateConfigurationFormatBySchema(config);

  return compact([invalidConfiguration].concat(formatViolations));
};

/**
 * Creates configuration file validator based on given {@link IConfigParamRuleRegistry}.
 */
const validateConfigurationRules = (registry: IConfigParamRuleRegistry) => (config: IRawDeviceConfigDto) => {
  const context = createFileConfigParamContext(config);
  return config.parameters
    .map((param, index) => {
      const message = registry(getConfigParamValue(param.id)).validate(context);
      if (message == null) {
        return;
      }
      return createViolation({
        message,
        objectPath: `parameters[${index}]`,
        fixFactory: omitParameter,
      });
    })
    .filter(Boolean) as Violation[];
};

/**
 * Returns whether given set of {@link Violation}s can be fixed.
 */
const canFixViolations = (violations: Violation[]) => {
  if (violations.length === 0) {
    return true;
  }

  return violations.every((violation) => violation.fix != null);
};

/**
 * Fixes {@link Violation}s of the provided `config`
 */
const fixDeviceConfigViolations = (config: IRawDeviceConfigDto,
                                   violations: Violation[],
                                   context: ViolationContext) => {
  return compactFixedDeviceConfig(violations.reduce(
    (lastConfig, violation) => violation.fix!(lastConfig, context),
    config));
};

const createViolationContext = (configs: IRawDeviceConfigDto[]): ViolationContext => {
  const configByKey = keyBy(configs, ({name}) => name);
  return {
    existsConfigName: (name) => configByKey[name] != null,
  };
};

/**
 * This function is an entry point to validation of device configurations.
 * It validates configuration files, returns fixed configurations and set of violations.
 */
export const validateAndFixConfigurationSet = (configs: IRawDeviceConfigDto[]): DeviceConfigValidationResult[] => {
  // Generate format violations for each configuration
  const validationResultSet: DeviceConfigValidationResult[] = configs.map((configuration) => ({
    configuration,
    violations: [],
    valid: true,
  }));

  validateResultSet(validationResultSet, validateConfigurationFormat);
  validateResultSet(validationResultSet, validateConfigurationRules(getTypeValidationConfigParamRule));
  validateResultSet(validationResultSet, validateConfigurationRules(getDependencyValidationConfigParamRule));

  return validationResultSet;
};

/**
 * Validates configuration files according by the given function
 */
const validateResultSet = (resultSet: DeviceConfigValidationResult[],
                           validate: (config: IRawDeviceConfigDto) => Violation[]): void => {
  const fixedConfigurations: IRawDeviceConfigDto[] = [];

  resultSet.filter(({valid}) => valid).forEach((result) => {
    const violations = validate(result.fixedConfiguration || result.configuration);
    result.violations = result.violations.concat(violations);
    if (canFixViolations(violations)) {
      const fixed = fixDeviceConfigViolations(
        result.fixedConfiguration || result.configuration,
        violations,
        createViolationContext(fixedConfigurations));

      result.fixedConfiguration = fixed;
      fixedConfigurations.push(fixed);
    } else {
      result.fixedConfiguration = undefined;
      result.valid = false;
    }
  });
};
