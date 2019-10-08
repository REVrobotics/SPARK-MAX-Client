// tslint:disable-next-line:interface-over-type-literal
import {Message, MessageSeverity} from "../state";
import {ErrorObject} from "ajv";
import {substitute} from "../../utils/string-utils";
import {IRawDeviceConfigDto} from "../../models/device-config";
import {removeField, setArrayElement, setField} from "../../utils/object-utils";

// tslint:disable-next-line:interface-over-type-literal
export type Violation = {
  message: Message;
  objectPath: string;
  params: { [name: string]: any };
  fix?: ViolationFix;
};
// tslint:disable-next-line:interface-over-type-literal
export type ViolationFixFactory = (violation: Violation) => ViolationFix | undefined;
export type ViolationFactory = (error: ErrorObject) => Violation;
// tslint:disable-next-line:interface-over-type-literal
export type ViolationContext = {
  existsConfigName(name: string): boolean;
};
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

export const createMessageViolation = (message: Message): Violation =>
  ({objectPath: "", params: {}, message});

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

export const createSchemaViolationFactory = ({text, severity, fixFactory}: SchemaViolationFactoryOptions): ViolationFactory =>
  (error) => {
    const objectPath = getObjectPath(error);
    return createViolation({
      message: Message.create(severity || MessageSeverity.Error, substitute(text, {objectPath, params: error.params})),
      objectPath,
      fixFactory,
    });
  };

export const defaultViolationFactory: ViolationFactory = (error) => ({
  objectPath: getObjectPath(error),
  params: error.params,
  message: Message.error(error.message || ""),
});

const generateUniqueConfigurationName = (context: ViolationContext) => {
  const baseName = "Unnamed";

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

export const fixWhen = (predicate: (violation: Violation) => boolean): (factory: ViolationFixFactory) => ViolationFixFactory =>
  (factory) => ((source) => predicate(source) ? factory(source) : undefined);

export const fixConfigurationName = (violation: Violation) =>
  (config: IRawDeviceConfigDto, context: ViolationContext) =>
    setField(config, "name", generateUniqueConfigurationName(context));

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

export const compactFixedDeviceConfig = (config: IRawDeviceConfigDto) =>
  setField(config, "parameters", config.parameters.filter(Boolean));
