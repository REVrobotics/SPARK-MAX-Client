import {identity} from "lodash";
import {Middleware} from "redux";
import {isThenable} from "./promise-utils";
import {isApplicationError, SystemError} from "../models/errors";
import LogManager from "../managers/LogManager";
import {SparkDispatch} from "../store/actions";
import {handleError} from "../store/actions/error-actions";

/**
 * This middleware tries to do its best to handle all unhandled errors
 */
export const errorHandler: Middleware = (store) => (next: SparkDispatch) => (action) => {
  try {
    const result = next(action);
    if (isThenable(result)) {
      return result.then(identity, (reason) => onUnhandledError(next, reason));
    }
    return result;
  } catch (err) {
    onUnhandledError(next, err);
  }
};

const onUnhandledError = (next: SparkDispatch, reason: any) => {
  if (isApplicationError(reason)) {
    if (reason.handled) {
      // Application error was already handled => do nothing
      if (process.env.NODE_ENV === "development") {
        console.log("Handled application error:", reason.message);
      }
      return;
    }
    // If we see ApplicationError here, this means that developer forgot to add useErrorHandler() somewhere
    console.error("ApplicationError was not handled. Handle this error in the action, please");
    throw reason;
  }

  // Here we see only BAD errors, like access to unexisting object, etc...
  const error = SystemError.from(reason);
  // We have to log all such errors, send error to the main process to write it into the corresponding log file
  LogManager.logUiError(error.message, error.stack);
  // Run generic error handling flow, to notify user that something bad was happened
  next(handleError(error));
  error.setHandled();
  throw error;
};
