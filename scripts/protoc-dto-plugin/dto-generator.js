const _ = require('lodash');
const { protoToFileName } = require ("./util");

// types taken from https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.h
const FIELD_TYPE_DOUBLE = 1;
const FIELD_TYPE_FLOAT = 2;
const FIELD_TYPE_INT64 = 3;
const FIELD_TYPE_UINT64 = 4;
const FIELD_TYPE_INT32 = 5;
const FIELD_TYPE_FIXED64 = 6;
const FIELD_TYPE_FIXED32 = 7;
const FIELD_TYPE_BOOL = 8;
const FIELD_TYPE_STRING = 9;
const FIELD_TYPE_GROUP = 10;
const FIELD_TYPE_MESSAGE = 11;
const FIELD_TYPE_BYTES = 12;
const FIELD_TYPE_UINT32 = 13;
const FIELD_TYPE_ENUM = 14;
const FIELD_TYPE_SFIXED32 = 15;
const FIELD_TYPE_SFIXED64 = 16;
const FIELD_TYPE_SINT32 = 17;
const FIELD_TYPE_SINT64 = 18;

const FIELD_LABEL_OPTIONAL = 1;
const FIELD_LABEL_REPEATED = 3;
const FIELD_LABEL_REQUIRED = 2;

function fileToNsName(text, suffix = "") {
  return toVariableName(`${text}${_.upperFirst(suffix)}`.replace(".proto", ""));
}

function isUppercasedFieldName(text) {
  return /^[A-Z_]+$/.test(text);
}

function toDtoFieldName(text) {
  if (isUppercasedFieldName(text)) {
    return text;
  } else {
    return _.camelCase(text);
  }
}

function toVariableName(text) {
  return text.replace(/-/g, "_");
}

function toTypeName(text) {
  return _.upperFirst(text);
}

function toEnumTypeName(text) {
  return toTypeName(text);
}

function toStdEnumTypeName(text) {
  return text;
}

function toMessageTypeName(text) {
  return toTypeName(`${text}Dto`);
}

function toStdMessageTypeName(text) {
  return text;
}

function toFunctionName(text) {
  return text;
}

function toMapperName(text, direction) {
  return toFunctionName(`${_.camelCase(text)}${_.upperFirst(direction)}Dto`);
}

function toMessageFieldSetter(text, label) {
  const suffix = label === FIELD_LABEL_REPEATED ? 'List' : '';

  if (isUppercasedFieldName(text)) {
    return `set${_.upperFirst(_.camelCase(text))}${suffix}`
  } else {
    return `set${_.upperFirst(_.camelCase(text.toLowerCase()))}${suffix}`;
  }
}

function toMessageFieldGetter(text, label) {
  const suffix = label === FIELD_LABEL_REPEATED ? 'List' : '';

  if (isUppercasedFieldName(text)) {
    return `get${_.upperFirst(_.camelCase(text))}${suffix}`
  } else {
    return `get${_.upperFirst(_.camelCase(text.toLowerCase()))}${suffix}`;
  }
}

function getFullTypeName(packageName, typeName) {
  return `.${packageName}.${typeName}`;
}

class DtoGenerator {
  constructor() {
    this._buffer = null;
    this._currentDtoNsName = null;
    this._typeRegistry = {};
  }

  generate(proto, options) {
    this._currentDtoNsName = fileToNsName(proto.name, "dto");
    this._initTypeRegistry(proto);

    this._buffer = [];

    this._emitTsLintDisable();

    proto.dependencyList.forEach((dependency) => {
      this._emitImport(dependency, "dto");
      this._emitEol()
    });

    if (options.mappers) {
      this._emitImport(proto.name);
      this._emitEol();

      proto.dependencyList.forEach((dependency) => {
        this._emitImport(dependency);
        this._emitEol()
      });
    }

    this._emitEol();

    if (options.dto) {
      this._emitDtos(proto);
    }

    if (options.mappers) {
      this._emitMappers(proto);
    }

    this._emitEol();

    const content = this._buffer.join("");
    this._currentDtoNsName = null;
    this._buffer = null;
    return content;
  }

  _emitDtos(proto) {
    proto.enumTypeList.forEach((enumType) => {
      this._emitEnum(enumType);
      this._emitEol(2);
    });

    proto.messageTypeList.forEach((messageType) => {
      this._emitMessage(messageType);
      this._emitEol(2);
    });
  }

  _emitMappers(proto) {
    proto.enumTypeList.forEach((enumType) => {
      this._emitEnumMappers(proto.pb_package, enumType);
      this._emitEol(2);
    });

    proto.messageTypeList.forEach((messageType) => {
      this._emitMessageMapper(proto.pb_package, messageType);
      this._emitEol(2);
    });
  }

  _emitTsLintDisable() {
    this._emit("// tslint:disable");
    this._emitEol();
  }

  _emitImport(dependency, suffix = "") {
    this._emit("// @ts-ignore");
    this._emitEol();

    this._emit("import * as ");
    this._emitNsName(fileToNsName(dependency, suffix));
    this._emit(" from ");
    this._emitString(`./${protoToFileName(dependency, suffix, false)}`);
    this._emitEos();
  }

  _emitString(str) {
    this._emit("\"", str.replace(/"/g, "\\\""), "\"");
  }

  _emitNsName(str) {
    this._emit(str);
  }

  _emitVariableName(str) {
    this._emit(str);
  }

  _emitEos() {
    this._emit(";");
  }

  _emitEol(n = 1) {
    this._emit(_.repeat("\n", n));
  }

  _emitEnumMappers(packageName, enumType) {
    this._emitEnumFromDtoMapper(packageName, enumType);
    this._emitEol(2);
    this._emitEnumToDtoMapper(packageName, enumType);
  }

  _emitEnumFromDtoMapper(packageName, enumType) {
    const typeEntry = this._getRegisteredType(getFullTypeName(packageName, enumType.name));

    // from dto mapper
    this._emit("export function ");
    this._emitFunctionName(toMapperName(enumType.name, 'from'));
    this._emit("(value: ");
    this._emitTypeName(toEnumTypeName(enumType.name));
    this._emit("): ");
    this._emitNsName(typeEntry.pbNs);
    this._emit(".");
    this._emitTypeName(toStdEnumTypeName(enumType.name));
    this._emit(" {");
    this._emitEol();

    this._emitIndent();
    this._emit("return value as unknown as ");
    this._emitNsName(typeEntry.pbNs);
    this._emit(".");
    this._emitTypeName(toStdEnumTypeName(enumType.name));
    this._emitEos();
    this._emitEol();

    this._emit("}");
  }

  _emitEnumToDtoMapper(packageName, enumType) {
    const typeEntry = this._getRegisteredType(getFullTypeName(packageName, enumType.name));

    // to dto mapper
    this._emit("export function ");
    this._emitFunctionName(toMapperName(enumType.name, 'to'));
    this._emit("(value: ");
    this._emitNsName(typeEntry.pbNs);
    this._emit(".");
    this._emitTypeName(toStdEnumTypeName(enumType.name));
    this._emit("): ");
    this._emitTypeName(toEnumTypeName(enumType.name));
    this._emit(" {");
    this._emitEol();

    this._emitIndent();
    this._emit("return value as unknown as ");
    this._emitTypeName(toEnumTypeName(enumType.name));
    this._emitEos();
    this._emitEol();

    this._emit("}");
  }

  _emitMessageMapper(packageName, messageType) {
    this._emitMessageFromDtoMapper(packageName, messageType);
    this._emitEol(2);
    this._emitMessageToDtoMapper(packageName, messageType);
  }

  _emitMessageFromDtoMapper(packageName, messageType) {
    const typeEntry = this._getRegisteredType(getFullTypeName(packageName, messageType.name));

    // from dto mapper
    this._emit("export function ");
    this._emitFunctionName(toMapperName(messageType.name, 'from'));
    this._emit("(dto: ");
    this._emitTypeName(toMessageTypeName(messageType.name));
    this._emit("): ");
    this._emitNsName(typeEntry.pbNs);
    this._emit(".");
    this._emitTypeName(toStdMessageTypeName(messageType.name));
    this._emit(" {");
    this._emitEol();

    this._emitIndent();
    this._emit("const message = new ");
    this._emitNsName(typeEntry.pbNs);
    this._emit(".");
    this._emitTypeName(toStdMessageTypeName(messageType.name));
    this._emit("()");
    this._emitEos();
    this._emitEol();

    messageType.fieldList.forEach((field) => {
      this._emitIndent();
      this._emit("if (");
      this._emit("dto.");
      this._emitFieldName(toDtoFieldName(field.name));
      this._emit(" != null");
      this._emit(") {");
      this._emitEol();

      this._emitIndent(2);
      this._emit("message.");
      this._emitFunctionName(toMessageFieldSetter(field.name, field.label));
      this._emit("(");
      switch (field.type) {
        case FIELD_TYPE_MESSAGE:
        case FIELD_TYPE_ENUM: {
          const isArray = field.label === FIELD_LABEL_REPEATED;
          if (isArray) {
            this._emit("dto.");
            this._emitFieldName(toDtoFieldName(field.name));
            this._emit(".map((item) => ");
          }

          const typeEntry = this._getRegisteredType(field.typeName);
          if (typeEntry.dtoNs !== this._currentDtoNsName) {
            this._emitNsName(typeEntry.dtoNs);
            this._emit(".");
          }
          this._emitFunctionName(toMapperName(typeEntry.pbTypeName, "from"));
          this._emit("(");
          if (isArray) {
            this._emit("item");
          } else {
            this._emit("dto.");
            this._emitFieldName(toDtoFieldName(field.name));
          }
          this._emit(")");

          if (isArray) {
            this._emit(")");
          }
          break;
        }
        case FIELD_TYPE_GROUP:
          throw new Error("Field type 'group' is not supported");
        default:
          this._emit("dto.");
          this._emitFieldName(toDtoFieldName(field.name));
          break;
      }
      this._emit(")");
      this._emitEos();
      this._emitEol();

      this._emitIndent();
      this._emit("}");
      this._emitEol();
    });

    this._emitIndent();
    this._emit("return message");
    this._emitEos();
    this._emitEol();

    this._emit("}");
  }

  _emitMessageToDtoMapper(packageName, messageType) {
    const typeEntry = this._getRegisteredType(getFullTypeName(packageName, messageType.name));

    // from dto mapper
    this._emit("export function ");
    this._emitFunctionName(toMapperName(messageType.name, 'to'));
    this._emit("(message: ");
    this._emitNsName(typeEntry.pbNs);
    this._emit(".");
    this._emitTypeName(toStdMessageTypeName(messageType.name));
    this._emit("): ");
    this._emitTypeName(toMessageTypeName(messageType.name));
    this._emit(" {");
    this._emitEol();

    this._emitIndent();
    this._emit("const dto: ");
    this._emitTypeName(toMessageTypeName(messageType.name));
    this._emit(" = {} as any");
    this._emitEos();
    this._emitEol();

    messageType.fieldList.forEach((field, i) => {
      const varName = `field${i}`;

      this._emitIndent();
      this._emit("const ");
      this._emitVariableName(varName);
      this._emit(" = message.");
      this._emitFunctionName(toMessageFieldGetter(field.name, field.label));
      this._emit("()");
      this._emitEos();
      this._emitEol();

      this._emitIndent();
      this._emit("if (");
      this._emitVariableName(varName);
      this._emit(" != null");
      this._emit(") {");
      this._emitEol();

      this._emitIndent(2);
      this._emit("dto.");
      this._emitFieldName(toDtoFieldName(field.name));
      this._emit(" = ");
      // this._emitFunctionName(toMessageFieldSetter(field.name, field.label));
      switch (field.type) {
        case FIELD_TYPE_MESSAGE:
        case FIELD_TYPE_ENUM: {
          const isArray = field.label === FIELD_LABEL_REPEATED;
          if (isArray) {
            this._emitVariableName(varName);
            this._emit(".map((item) => ");
          }

          const typeEntry = this._getRegisteredType(field.typeName);
          if (typeEntry.dtoNs !== this._currentDtoNsName) {
            this._emitNsName(typeEntry.dtoNs);
            this._emit(".");
          }
          this._emitFunctionName(toMapperName(typeEntry.pbTypeName, "to"));
          this._emit("(");
          if (isArray) {
            this._emit("item");
          } else {
            this._emitVariableName(varName);
          }
          this._emit(")");

          if (isArray) {
            this._emit(")");
          }
          break;
        }
        case FIELD_TYPE_GROUP:
          throw new Error("Field type 'group' is not supported");
        default:
          this._emit("message.");
          this._emitFunctionName(toMessageFieldGetter(field.name, field.label));
          this._emit("()");
          break;
      }
      this._emitEos();
      this._emitEol();

      this._emitIndent();
      this._emit("}");
      this._emitEol();
    });

    this._emitIndent();
    this._emit("return dto");
    this._emitEos();
    this._emitEol();

    this._emit("}");
  }

  _emitEnum(enumType) {
    this._emit("export enum ");
    this._emitTypeName(toEnumTypeName(enumType.name));
    this._emit(" {");
    this._emitEol();
    enumType.valueList.map((field) => {
      this._emitIndent();
      this._emitEnumValue(field);
      this._emitEol();
    });
    this._emit("}");
  }

  _emitEnumValue(value) {
    this._emit(value.name, " = ", value.number, ",");
  }

  _emitMessage(messageType) {
    this._emit("export interface ");
    this._emitTypeName(toMessageTypeName(messageType.name));
    this._emit(" {");
    this._emitEol();
    messageType.fieldList.map((field) => {
      this._emitIndent();
      this._emitField(field);
      this._emitEol();
    });
    this._emit("}");
  }

  _emitField(field) {
    this._emitFieldName(toDtoFieldName(field.name));
    if (field.label === FIELD_LABEL_OPTIONAL) {
      this._emit("?");
    }
    this._emit(": ");
    this._emitFieldType(field.type, field.typeName);
    if (field.label === FIELD_LABEL_REPEATED) {
      this._emit("[]");
    }
    this._emitEos();
  }

  _emitFieldName(name) {
    this._emit(name);
  }

  _emitFieldType(type, typeName) {
    switch (type) {
      case FIELD_TYPE_BOOL:
        this._emit("boolean");
        break;
      case FIELD_TYPE_STRING:
        this._emit("string");
        break;
      case FIELD_TYPE_MESSAGE:
      case FIELD_TYPE_ENUM: {
        const typeEntry = this._getRegisteredType(typeName);
        if (typeEntry.dtoNs !== this._currentDtoNsName) {
          this._emitNsName(typeEntry.dtoNs);
          this._emit(".");
        }
        this._emitTypeName(typeEntry.dtoTypeName);
        break;
      }
      case FIELD_TYPE_GROUP:
        throw new Error("Field type 'group' is not supported");
      default:
        this._emit("number");
        break;
    }
  }

  _emitFunctionName(name) {
    this._emit(name);
  }

  _emitTypeName(name) {
    this._emit(name);
  }

  _emitIndent(n = 1) {
    this._emit(_.repeat("  ", n));
  }

  _emit(...content) {
    this._buffer.push(...content);
  }

  _initTypeRegistry(proto) {
    const pbNs = fileToNsName(proto.name);
    const dtoNs = fileToNsName(proto.name, "dto");

    proto.enumTypeList.forEach((type) => {
      this._typeRegistry[getFullTypeName(proto.pb_package, type.name)] = {
        pbNs,
        dtoNs,
        pbTypeName: type.name,
        dtoTypeName: toEnumTypeName(type.name),
      };
    });

    proto.messageTypeList.forEach((type) => {
      this._typeRegistry[getFullTypeName(proto.pb_package, type.name)] = {
        pbNs,
        dtoNs,
        pbTypeName: type.name,
        dtoTypeName: toMessageTypeName(type.name),
      };
    });
  }

  _getRegisteredType(typeName) {
    const typeEntry = this._typeRegistry[typeName];
    if (typeEntry == null) {
      throw new Error(`Unknown typeName '${typeName}'`)
    }
    return typeEntry;
  }
}

module.exports = DtoGenerator;
