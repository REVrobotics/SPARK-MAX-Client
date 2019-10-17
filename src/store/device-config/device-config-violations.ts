// tslint:disable-next-line:interface-over-type-literal
import {ErrorObject} from "ajv";
import {IRawDeviceConfigDto} from "../../models/device-config.dto";
import {removeField, setArrayElement, setField} from "../../utils/object-utils";
import {Message, MessageSeverity} from "../../models/Message";

/**
 * This type describes a single violation of configuration file.
 */
// tslint:disable-next-line:interface-over-type-literal
export type Violation = {
  message: Message;
  objectPath: string;
  params: { [name: string]: any };
  fix?: ViolationFix;
};
/**
 * Builds {@link ViolationFix} based on the given {@link Violation}.
 */
// tslint:disable-next-line:interface-over-type-literal
export type ViolationFixFactory = (violation: Violation) => ViolationFix | undefined;
/**
 * Builds {@link Violation} based on ajv {@link ErrorObject}
 */
export type ViolationFactory = (error: ErrorObject) => Violation;
/**
 * ViolationContext allows to decouple fix from the context where it is used.
 */
// tslint:disable-next-line:interface-over-type-literal
export type ViolationContext = {
  existsConfigName(name: string): boolean;
};
/**
 * Defines how to fix given `config`.
 */
export type ViolationFix = (config: IRawDeviceConfigDto, context: ViolationContext) => IRawDeviceConfigDto;

const getObjectPath = (error: ErrorObject) => error.dataPath.substring(1);

// tslint:disable-next-line:interface-over-type-literal
type SchemaViolationFactoryOptions = {
  text: string;
  severity?: MessageSeverity;
  fixFactory?: ViolationFixFactory;
};

// tslint:disable-next-line:interface-over-type-literal
type ViolationOptions = {
  message: Message;
  objectPath: string;
  fixFactory?: ViolationFixFactory;
};

/**
 * Creates message-only {@link Violation}
 */
export const createMessageViolation = (message: Message): Violation =>
  ({objectPath: "", params: {}, message});

/**
 * Creates generic violation
 */
export const createViolation = ({message, objectPath, fixFactory}: ViolationOptions): Violation => {
  const violation = {
    objectPath,
    params: {},
    message,
  };

  return {
    ...violation,
    fix: fixFactory ? fixFactory(violation) : undefined,
  };
};

/**
 * Creates format violation
 */
export const createSchemaViolationFactory = ({text, severity, fixFactory}: SchemaViolationFactoryOptions): ViolationFactory =>
  (error) => {
    const objectPath = getObjectPath(error);
    return createViolation({
      message: Message.create(severity || MessageSeverity.Error, text, {objectPath, params: error.params}),
      objectPath,
      fixFactory,
    });
  };

/**
 * Default format {@link ViolationFactory}
 */
export const defaultViolationFactory: ViolationFactory = (error) => ({
  objectPath: getObjectPath(error),
  params: error.params,
  message: Message.errorFromText(error.message || ""),
});

/**
 * This method generates unique name of configuration.
 * It relies on {@link ViolationContext} to check that name is unique.
 */
const generateUniqueConfigurationName = (context: ViolationContext) => {
  const baseName = tt("lbl_unnamed");

  let index = 0;
  let name: string;
  do {
    index++;
    name = `${baseName} (${index})`;
  } while (context.existsConfigName(name));

  return name;
};

const getParameterIndex = (objectPath: string) => {
  const match = /^parameters\[(\d+)]/.exec(objectPath);
  return match ? Number(match[1]) : NaN;
};

/**
 * Allows to build fix, only when given `predicate` returns true.
 */
export const fixWhen = (predicate: (violation: Violation) => boolean): (factory: ViolationFixFactory) => ViolationFixFactory =>
  (factory) => ((source) => predicate(source) ? factory(source) : undefined);

/**
 * Fix name of configuration: if name is invalid, this fix generates a new configuration name
 */
export const fixConfigurationName = (violation: Violation) =>
  (config: IRawDeviceConfigDto, context: ViolationContext) =>
    setField(config, "name", generateUniqueConfigurationName(context));

/**
 * Fix parameter name: if parameter name is invalid, this fix removes it at all.
 */
export const fixParameterName = (violation: Violation) => {
  const index = getParameterIndex(violation.objectPath);
  if (isNaN(index)) {
    return;
  }
  return (config: IRawDeviceConfigDto) =>
    setField(
      config,
      "parameters",
      setArrayElement(config.parameters, index, (parameter) => removeField(parameter, "name")));
};

/**
 * Fix that removes parameter.
 * Sometimes if something is wrong in parameter, the only possible fix is to remove this parmeter at all.
 */
export const omitParameter = (violation: Violation) => {
  const index = getParameterIndex(violation.objectPath);
  if (isNaN(index)) {
    return;
  }
  return (config: IRawDeviceConfigDto) =>
    setField(
      config,
      "parameters",
      setArrayElement(config.parameters, index, undefined as any));
};

/**
 * Removes empty parameters in the given `config`
 */
export const compactFixedDeviceConfig = (config: IRawDeviceConfigDto) =>
  setField(config, "parameters", config.parameters.filter(Boolean));
