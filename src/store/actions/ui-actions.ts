import {
  ActionType,
  SparkAction
} from "./action-types";
import {deferred, IDeferred} from "../../utils/promise-utils";
import {ConfirmationAnswer, IAlertDialogConfig, IConfirmationDialogConfig} from "../state";
import {Intent, Toaster} from "@blueprintjs/core";
import {resetMessageQueue} from "./atom-actions";
import {queryIsMessageQueueOpened} from "../selectors";

let currentConfirmation: IDeferred<ConfirmationAnswer> | undefined;
let currentAlert: IDeferred<void> | undefined;
let toaster: Toaster;
let waitForMessageQueue: IDeferred<any> | undefined;


export const setToasterRef = (t: Toaster) => {
  toaster = t;
};

/**
 * Shows toast message on the top of a screen.
 */
export const showToast = (intent: Intent, text: string) =>
  toaster.show({
    intent,
    message: text,
  });

/**
 * Shows success message on the top of a screen
 */
export const showToastSuccess = (text: string) => showToast(Intent.SUCCESS, text);
/**
 * Shows error message on the top of a screen
 */
export const showToastError = (text: string) => showToast(Intent.DANGER, text);
/**
 * Shows warning message on the top of a screen
 */
export const showToastWarning = (text: string) => showToast(Intent.WARNING, text);

/**
 * Show alert using provided config.
 * When this action is dispatched, it returns {@link Promise}
 * which is resolved as soon as user closes alert.
 *
 * ```ts
 * const promise = dispatch(showAlert(...));
 * promise.then(() => {
 *   ...
 * });
 * ```
 * @param config
 */
export const showAlert = (config: IAlertDialogConfig): SparkAction<Promise<void>> =>
  (dispatch) => {
    if (currentAlert) {
      currentAlert.reject();
      currentAlert = undefined;
    }

    dispatch(({ type: ActionType.OPEN_ALERT, payload: config }));

    currentAlert = deferred();
    return currentAlert.promise;
  };

export const closeAlert = (): SparkAction<void> =>
  (dispatch) => {
    if (currentAlert == null) {
      return;
    }

    try {
      dispatch(({ type: ActionType.CLOSE_ALERT }));

      currentAlert.resolve();
    } finally {
      currentAlert = undefined;
    }
  };

/**
 * Show confirmation using provided config.
 * When this action is dispatched, it returns {@link Promise}
 * which is resolved as soon as user makes a choice in the dialog.
 *
 * {@link Promise} is resolved with value of {@link ConfirmationAnswer} type.
 * ```ts
 * const promise = dispatch(showConfirmation(...));
 * promise.then((answer) => {
 *   if (answer === ConfirmationAnswer.Yes) {
 *     ...
 *   }
 * });
 * ```
 * @param config
 */
export const showConfirmation = (config: IConfirmationDialogConfig): SparkAction<Promise<ConfirmationAnswer>> =>
  (dispatch) => {
    if (currentConfirmation) {
      currentConfirmation.reject();
      currentConfirmation = undefined;
    }

    dispatch(({ type: ActionType.OPEN_CONFIRMATION, payload: config }));

    currentConfirmation = deferred();
    return currentConfirmation.promise;
  };

export const answerConfirmation = (answer: ConfirmationAnswer): SparkAction<void> =>
  (dispatch) => {
    if (currentConfirmation == null) {
      throw new Error("No confirmation dialog is opened");
    }
    try {
      dispatch(({ type: ActionType.ANSWER_CONFIRMATION, payload: answer }));

      currentConfirmation.resolve(answer);
    } finally {
      currentConfirmation = undefined;
    }
  };

export const closeConfirmation = (): SparkAction<void> =>
  () => {
    if (currentConfirmation == null) {
      return;
    }

    currentConfirmation.reject();
    currentConfirmation = undefined;
  };

/**
 * This action returns {@link Promise} resolved as soon as user closes message queue.
 * This action allows to implement flow when developer needs to wait until message queue is closed.
 */
export const whenMessageQueueClosed = (): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    if (queryIsMessageQueueOpened(getState())) {
      if (waitForMessageQueue == null) {
        waitForMessageQueue = deferred();
      }
      return waitForMessageQueue.promise;
    } else {
      return Promise.resolve();
    }
  };

export const closeMessageQueue = (): SparkAction<void> => (dispatch, getState) => {
  if (queryIsMessageQueueOpened(getState())) {
    dispatch(resetMessageQueue());
    if (waitForMessageQueue) {
      waitForMessageQueue.resolve(undefined);
      waitForMessageQueue = undefined;
    }
  }
};
