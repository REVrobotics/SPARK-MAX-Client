import {
  ActionType,
  SparkAction
} from "./action-types";
import {deferred, IDeferred} from "../../utils/promise-utils";
import {ConfirmationAnswer, IConfirmationDialogConfig} from "../state";

let currentDialog: IDeferred<ConfirmationAnswer> | undefined;

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
    if (currentDialog) {
      currentDialog.reject();
      currentDialog = undefined;
    }

    dispatch(({ type: ActionType.OPEN_CONFIRMATION, payload: config }));

    currentDialog = deferred();
    return currentDialog.promise;
  };

export const answerConfirmation = (answer: ConfirmationAnswer): SparkAction<void> =>
  (dispatch) => {
    if (currentDialog == null) {
      throw new Error("No confirmation dialog is opened");
    }
    try {
      dispatch(({ type: ActionType.ANSWER_CONFIRMATION, payload: answer }));

      currentDialog.resolve(answer);
    } finally {
      currentDialog = undefined;
    }
  };

export const closeConfirmation = (): SparkAction<void> =>
  () => {
    if (currentDialog == null) {
      return;
    }

    currentDialog.reject();
    currentDialog = undefined;
  };
