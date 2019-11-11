import {SparkAction, SparkDispatch} from "./action-types";
import {
  isApplicationError,
  isLogicError,
  isSystemError,
  SYSTEM_ERROR_SPARKMAX_CATEGORY,
  SystemError
} from "../../models/errors";
import {showToast, showToastError} from "./ui-actions";
import {severityToIntent} from "../../models/Message";
import {addLog} from "./atom-actions";

/**
 * Constructs error handler to be used in catch clause of Promise chain.
 * Typically this handler should be added at the end of the chain.
 *
 * ```ts
 * somePromise
 *   .then(...)
 *   .catch(useErrorHandler(dispatch));
 * ```
 */
export const useErrorHandler = <T = any>(dispatch: SparkDispatch) =>
  (reason: any): Promise<T> => dispatch(handleError<T>(reason, true));

/**
 * Handles some generic error.
 */
export const handleError = <T>(reason: any,
                               onlyExpectedErrors: boolean = true): SparkAction<Promise<T>> => (dispatch) => {
  // If error was already handled, do not handle it one more time
  if (isApplicationError(reason) && reason.handled) {
    return Promise.reject(reason);
  }

  if (isLogicError(reason)) {
    // All logic errors should be shown as toast notifications
    showToast(severityToIntent(reason.severity), reason.text);
    reason.setHandled();
    dispatch(addLog(reason.text));
    return Promise.reject(reason);
  } else if (isSystemError(reason) || !onlyExpectedErrors) {
    // All system errors should be shown as toast notifications
    const error = SystemError.from(reason);
    handleSystemError(error);
    error.setHandled();
    dispatch(addLog(error.message));
    return Promise.reject(error);
  } else {
    return Promise.reject(reason);
  }
};

/**
 * Constructs callback to be used in catch clause of Promise chain.
 * This function is necessary for convenience to avoid typical error in handling of Promise rejected flow.
 *
 * Frequently developer writes something like
 * ```ts
 * somePromise
 *   .then(...)
 *   .catch(() => {
 *     stopLoading(...);
 *     showMessage(...);
 *   })
 *   .then((...));
 * ```
 * Typically rejected Promise flow should stop processing of all `then`s.
 * But in the example above the second `then` will be executed, even if `somePromise` was rejected.
 *
 * `onError` builds callback which continues reject flow until developer returns something.
 *
 * ```ts
 * somePromise
 *   .then(...)
 *   .catch(onError(() => {
 *     stopLoading(...);
 *     showMessage(...);
 *   }))
 *   .then((...));
 * ```
 */
export const onError = <T = any, E = any>(cb: (reason: E) => Promise<T> | T | void): (reason: E) => Promise<T> | T =>
  (reason) => {
    const result = cb(reason);
    if (result == null) {
      return Promise.reject(reason);
    }
    return result;
  };

/**
 * Specific handling of {@link SystemError}s
 */
const handleSystemError = (error: SystemError) => {
  if (error.category === SYSTEM_ERROR_SPARKMAX_CATEGORY) {
    if (error.details.code === 14) {
      showToastError(tt("msg_sparkmax_connection_error"));
    } else {
      showToastError(tt("msg_sparkmax_error", {message: error.details.details || error.message}));
    }
  } else {
    showToastError(tt("msg_system_error"));
  }
};
