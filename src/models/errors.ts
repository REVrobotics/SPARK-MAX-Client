/* tslint:disable:no-string-literal max-classes-per-file */
import {defaults, isObject, isString, omit} from "lodash";
import {Message} from "./Message";

interface ISystemErrorOptions {
  category: string;
  message: string;
  stack?: string;
  details?: any;
  originalError?: Error;
}

class SystemError extends Error {
  public static deserialize(serialized: any): SystemError {
    const options: ISystemErrorOptions = {category: "unknown", message: ""};

    if (isObject(serialized)) {
      options.message = options["message"];
      options.stack = options["stack"];
      options.details = omit(options, ["message", "stack"]);
    } else if (isString(serialized)) {
      options.message = serialized;
    }

    return new SystemError(options);
  }

  public static wrap(reason: any): SystemError {
    if (reason instanceof SystemError) {
      return reason;
    } else if (reason instanceof Error) {
      return new SystemError({
        category: "unknown",
        message: reason.message,
        stack: reason.stack,
        originalError: reason,
      });
    } else {
      return SystemError.deserialize(reason);
    }
  }

  public readonly category: string;
  public readonly details: any = {};
  public readonly originalError?: Error;

  constructor(options: ISystemErrorOptions) {
    super(options.message);

    this.category = options.category;
    this.stack = options.stack;
    this.details = options.details || {};
    this.originalError = options.originalError;
  }

  public specialize(transform: (options: ISystemErrorOptions) => Partial<ISystemErrorOptions>): SystemError {
    return new SystemError(defaults({}, transform({
      category: this.category,
      message: this.message,
      stack: this.stack,
      details: this.details,
    }), {
      category: this.category,
      message: this.message,
      stack: this.stack,
      details: this.details,
    }))
  }
}

class LogicError extends Error {
  public static from(message: Message): LogicError {
    return new LogicError(message.id, message.text);
  }

  public static create(key: string, text: string): LogicError {
    return new LogicError(key, text);
  }

  constructor(public key: string, public text: string) {
    super(text);
  }
}

export {
  SystemError,
  LogicError,
};
