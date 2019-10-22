import {ConfirmationAnswer, createSignalInstance, ISignalInstanceState, SignalId, VirtualDeviceId} from "../state";
import {SparkAction} from "./action-types";
import {forSelectedDevice} from "./action-creators";
import {querySignal, querySignalNewStyle} from "../selectors";
import {addSignalInstance, removeSignalInstance, setSelectedSignal, setSignalInstanceField} from "./atom-actions";
import {showConfirmation} from "./ui-actions";
import {Intent} from "@blueprintjs/core";

export const addSignal = (virtualDeviceId: VirtualDeviceId, signalId: SignalId): SparkAction<void> =>
  (dispatch, getState) => {
    const signal = querySignal(getState(), signalId);
    const color = querySignalNewStyle(getState(), virtualDeviceId, signalId);
    if (signal) {
      dispatch(addSignalInstance(createSignalInstance(virtualDeviceId, signal, color)));
      dispatch(setSelectedSignal(virtualDeviceId, signalId));
    }
  };

export const removeSignal = (virtualDeviceId: VirtualDeviceId, signalId: SignalId): SparkAction<void> =>
  (dispatch, getState) => {
    dispatch(showConfirmation({
      intent: Intent.SUCCESS,
      text: tt("msg_remove_signal"),
      yesLabel: tt("lbl_yes"),
      cancelLabel: tt("lbl_no"),
    }))
      .then((answer) => {
        if (answer === ConfirmationAnswer.Yes) {
          dispatch(removeSignalInstance(virtualDeviceId, signalId));
        }
      });
  };

export const setSignalField = (virtualDeviceId: VirtualDeviceId,
                               signalId: SignalId,
                               key: keyof ISignalInstanceState,
                               value: any): SparkAction<void> =>
  (dispatch, getState) => {
    dispatch(setSignalInstanceField(virtualDeviceId, signalId, key, value));
  };

export const addSelectedDeviceSignal = forSelectedDevice(addSignal);
export const removeSelectedDeviceSignal = forSelectedDevice(removeSignal);
export const setSelectedDeviceSignalField = forSelectedDevice(setSignalField);
