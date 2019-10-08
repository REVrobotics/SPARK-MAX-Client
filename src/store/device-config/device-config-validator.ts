import {compact, get, keyBy, without} from "lodash";
import {Message, MessageSeverity} from "../state";
import * as Ajv from "ajv";
import {ErrorObject} from "ajv";
import {ConfigParam, configParamNames, getConfigParamName, getConfigParamValue} from "../../models/ConfigParam";
import {IRawDeviceConfigDto} from "../../models/device-config";
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

// tslint:disable-next-line:interface-over-type-literal
export type DeviceConfigValidationResult = {
  configuration: IRawDeviceConfigDto;
  violations: Violation[];
  fixedConfiguration?: IRawDeviceConfigDto;
  valid: boolean;
}

const messages = {
  required: createSchemaViolationFactory({
    text: "Configuration missing required field '${params.missingProperty}'",
    fixFactory: fixWhen(({params}) => params.missingProperty === "name")(fixConfigurationName),
  }),
  properties: {
    name: {
      type: createSchemaViolationFactory({
        text: "Property '$objectPath' should be a string",
        fixFactory: fixConfigurationName,
      }),
    },
    parameters: {
      type: createSchemaViolationFactory({text: "Property '$objectPath' should be an array of device parameters"}),
      items: {
        type: createSchemaViolationFactory({
          text: "Property '$objectPath' should specify device parameter. It should be an object with id, name and value fields",
          fixFactory: omitParameter,
        }),
        required: createSchemaViolationFactory({
          text: "Property '$objectPath' missing required field '${params.missingProperty}'",
          fixFactory: omitParameter,
        }),
        properties: {
          id: {
            type: createSchemaViolationFactory({
              text: "Property '$objectPath' should be a string and specify name of device parameter.",
              fixFactory: omitParameter,
            }),
            enum: createSchemaViolationFactory({
              text: "Property '$objectPath' has unknown value. It should specify name of device parameter. Look into the documentation for details",
              fixFactory: omitParameter,
            }),
          },
          name: {
            type: createSchemaViolationFactory({
              text: "Property '$objectPath' has wrong value. It should specify name of device parameter. Look into the documentation for details",
              severity: MessageSeverity.Warning,
              fixFactory: fixParameterName,
            }),
          },
          value: {
            type: createSchemaViolationFactory({
              text: "Property '$objectPath' should be a number value",
              fixFactory: omitParameter,
            }),
          },
        }
      }
    }
  }
};

const findViolationFactory = (schemaPath: string): ViolationFactory =>
  get(messages, schemaPath.substring(2).replace(/\//g, "."));

const createConfigValidator = () => {
  const ajv = new Ajv({allErrors: true, removeAdditional: true});
  return ajv.compile({
    additionalProperties: false,
    type: "object",
    required: ["name", "parameters"],
    properties: {
      fileName: {type: "string"},
      filePath: {type: "string"},
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

const validateConfigurationFormatBySchema = (config: any) => {
  const isValid = configValidator(config);
  return isValid ? [] : (configValidator.errors || []).map(errorToViolation);
};

const errorToViolation = (error: ErrorObject) => {
  const messageFactory = findViolationFactory(error.schemaPath);
  return messageFactory ? messageFactory(error) : defaultViolationFactory(error);
};

export const validateConfigurationFormat = (config: IRawDeviceConfigDto) => {
  const invalidConfiguration = config.error ? createMessageViolation(Message.error(config.error)) : undefined;

  const formatViolations = validateConfigurationFormatBySchema(config);

  return compact([invalidConfiguration].concat(formatViolations));
};

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
        objectPath:`parameters[${index}]`,
        fixFactory: omitParameter,
      });
    })
    .filter(Boolean) as Violation[];
};

const canFixViolations = (violations: Violation[]) => {
  if (violations.length === 0) {
    return true;
  }

  return violations.every((violation) => violation.fix != null);
};

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
