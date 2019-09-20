import {
  ActionType,
  ConfirmationAnswer,
  IConfirmationDialogConfig,
  SparkAction
} from "./types";
import {deferred, IDeferred} from "../utils/promise-utils";

let currentDialog: IDeferred<ConfirmationAnswer> | undefined;

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
