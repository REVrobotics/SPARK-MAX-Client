/* tslint:disable:no-string-literal max-classes-per-file */
import {defaults, isObject, isString, omit} from "lodash";
import {Message, MessageSeverity} from "./Message";

interface ISystemErrorOptions {
  category: string;
  message: string;
  stack?: string;
  details?: any;
  originalError?: Error;
}

/**
 * Base class for all application-specific errors
 */
class ApplicationError extends Error {
  /**
   * Wraps any error to the instance of {@link ApplicationError}
   */
  public static from(reason: any): ApplicationError {
    if (reason instanceof ApplicationError) {
      return reason;
    } else {
      return SystemError.from(reason);
    }
  }

  private _handled = false;

  constructor(message: string) {
    super(message);

    // Restore prototype chain for Error
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }

  /**
   * Was this error handled or not
   */
  get handled(): boolean {
    return this._handled;
  }

  set handled(handled: boolean) {
    throw new Error("handled flag cannot be modified");
  }

  /**
   * Marks this error as handled
   */
  public setHandled(): void {
    this._handled = true;
  }
}

export const SYSTEM_ERROR_UNKNOWN_CATEGORY = "unknown";
export const SYSTEM_ERROR_SPARKMAX_CATEGORY = "sparkmax";
export const SYSTEM_ERROR_FILE_CATEGORY = "file";

/**
 * {@link SystemError} is an unexpected error like lost of connection, error reading from file system, etc.
 */
class SystemError extends ApplicationError {
  /**
   * Builds {@link SystemError} from serialized form.
   */
  public static deserialize(serialized: any): SystemError {
    const options: ISystemErrorOptions = {category: SYSTEM_ERROR_UNKNOWN_CATEGORY, message: ""};

    if (isObject(serialized)) {
      options.message = serialized["message"];
      options.stack = serialized["stack"];
      options.details = omit(serialized, ["message", "stack"]);
    } else if (isString(serialized)) {
      options.message = serialized;
    }

    return new SystemError(options);
  }

  /**
   * Creates {@link SystemError} from any object.
   */
  public static from(reason: any): SystemError {
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

  /**
   * Category allows to assign error to specific group of errors.
   * It is necessary to distinguish this one error from another one and allows more granular error handling.
   */
  public readonly category: string;
  /**
   * Some error-specific details
   */
  public readonly details: any = {};
  /**
   * Stores original error.
   */
  public readonly originalError?: Error;

  constructor(options: ISystemErrorOptions) {
    super(options.message);

    this.category = options.category;
    this.stack = options.stack;
    this.details = options.details || {};
    this.originalError = options.originalError;

    // Restore prototype chain for Error
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, SystemError.prototype);
  }

  /**
   * Builds new instance of error by transforming some properties.
   * This method allows to specify some details about this error
   */
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

/**
 * {@link LogicError} describes some "expected" error. Typically such kind of errors used in negative flows.
 */
class LogicError extends ApplicationError {
  public static from(message: Message): LogicError {
    return new LogicError(message.id, message.text, message.severity);
  }

  public static create(key: string, text: string, severity: MessageSeverity = MessageSeverity.Error): LogicError {
    return new LogicError(key, text, severity);
  }

  constructor(public key: string, public text: string, public severity: MessageSeverity = MessageSeverity.Error) {
    super(text);

    // Restore prototype chain for Error
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, LogicError.prototype);
  }
}

const isApplicationError = (error: any): error is ApplicationError => error instanceof ApplicationError;
const isSystemError = (error: any): error is SystemError => error instanceof SystemError;
const isLogicError = (error: any): error is LogicError => error instanceof LogicError;

export {
  ApplicationError,
  SystemError,
  LogicError,
  isApplicationError,
  isSystemError,
  isLogicError,
};
