import {WaveformEngineChart} from "../../display/abstract-waveform-engine";
import {SparkAction} from "./action-types";
import {LogicError} from "../../models/errors";
import {Message} from "../../models/Message";
import SparkManager from "../../managers/SparkManager";
import {useErrorHandler} from "./error-actions";
import {ISignalInstanceState, ISignalState} from "../state";

export const exportAsPng = (chart: WaveformEngineChart): SparkAction<void> => {
  return (dispatch) => {
    chart.rasterize()
      .catch(() => Promise.reject(LogicError.from(Message.error("msg_rasterize_error"))))
      .then((blob) => SparkManager.saveAsFile("exported.png", blob))
      .catch(useErrorHandler(dispatch));
  };
};

export const exportAsCsv = (signalWithInstances: Array<[ISignalState, ISignalInstanceState]>): SparkAction<void> => {
  return (dispatch) => {
    // nothing to do
  };
};
