import {first, flatMap, fromPairs, last, remove} from "lodash";
import {WaveformEngineChart} from "../../display/abstract-waveform-engine";
import {SparkAction} from "./action-types";
import {LogicError} from "../../models/errors";
import {Message} from "../../models/Message";
import {useErrorHandler} from "./error-actions";
import {IDisplayCsvExportSettings, ISignalInstanceState, ISignalState} from "../state";
import {getDataPoints} from "../data-stream";
import {showAlert} from "./ui-actions";
import {Intent} from "@blueprintjs/core";
import {queryDisplayExportSettings} from "../selectors";
import FileManager from "../../managers/FileManager";
import {roundDecimal} from "../../utils/number-utils";
import {setCsvExportDialogOpened} from "./atom-actions";

interface DataEvent {
  type: string;
  time: Date;
  index: number;
}

interface ReadingState {
  streamIndex: number;
  itemIndex: number;
}

const MAX_BUFFER_CAPACITY = 1000;

export const exportAsPng = (chart: WaveformEngineChart): SparkAction<void> => {
  return (dispatch) => {
    chart.rasterize()
      .catch(() => Promise.reject(LogicError.from(Message.error("msg_rasterize_error"))))
      .then((blob) => FileManager.saveAs({
        fileName: "exported.png",
        data: blob,
        filters: [{name: "Images (PNG)", extensions: ["png"]}]
      }))
      .catch(useErrorHandler(dispatch));
  };
};

export const exportAsCsv = (signalWithInstances: Array<[ISignalState, ISignalInstanceState]>): SparkAction<void> => {
  return (dispatch, getState) => {
    // Take only signals having some data
    const nonEmptySignals = getNonEmptySignals(signalWithInstances);
    const events = createDataEvents(nonEmptySignals);

    if (events.length === 0) {
      dispatch(showAlert({
        intent: Intent.WARNING,
        text: tt("msg_no_data_to_export"),
        okLabel: tt("lbl_ok"),
      }));
      return;
    }

    FileManager.openStream({
      type: "csv",
      fileName: "exported.csv",
      filters: [{name: "CSV (csv)", extensions: ["csv"]}]
    }).then((id) => {
        if (id == null) {
          return Promise.resolve();
        }

        return exportCsvData(queryDisplayExportSettings(getState()).csv, id, events, nonEmptySignals)
          .then(() => {
            dispatch(setCsvExportDialogOpened(false));
          })
          .finally(() => FileManager.closeStream(id));
      })
      .catch(useErrorHandler(dispatch));
  };
};

const takeNextDataEvents = (events: DataEvent[]) => {
  const firstEvent = events.pop()!;
  const nextEvents = [firstEvent];
  while (events.length) {
    const nextEvent = events[events.length - 1];
    if (nextEvent.type === firstEvent.type && nextEvent.time.getTime() === firstEvent.time.getTime()) {
      events.pop();
      nextEvents.push(nextEvent);
    } else {
      break;
    }
  }
  return nextEvents;
};

const exportCsvData = async (settings: IDisplayCsvExportSettings,
                             id: string,
                             events: DataEvent[],
                             signalWithInstances: Array<[ISignalState, ISignalInstanceState]>) => {
  const dataPoints = signalWithInstances.map(([_, instance]) =>
    getDataPoints(instance.virtualDeviceId, instance.signalId));

  const readingState: ReadingState[] = [];
  let lastEvent: DataEvent | undefined;
  // let lastTime: Date;

  await writeHead();

  while (events.length) {
    const nextEvents = takeNextDataEvents(events);
    const firstEvent = first(nextEvents)!;

    if (firstEvent.type === "start") {
      if (readingState.length === 0) {
        if (lastEvent) {
          await writeGapTo(firstEvent.time);
        } else {
          setStartTime(firstEvent.time);
        }
      }
      await writeTo(firstEvent.time);
      nextEvents.forEach((nextEvent) => {
        readingState.push({
          itemIndex: 0,
          streamIndex: nextEvent.index,
        });
      });
    } else {
      await writeTo(firstEvent.time);
      remove(readingState, (state) => nextEvents.some((event) => event.index === state.streamIndex));
    }

    lastEvent = firstEvent;
  }

  function setStartTime(time: Date) {
    // lastTime = time;
    // nothing to do
  }

  async function writeHead() {
    const meta = signalWithInstances.map(([signal, instance]) => ({
      id: instance.scaleId,
      title: `ID ${signal.deviceId}, ${signal.name}`,
    }));
    if (settings.includeTimeColumn) {
      meta.unshift({id: "time", title: "Time"});
    }
    await FileManager.writeChunk(id, {type: "meta", meta});
  }

  async function writeTo(time: Date) {
    const maxRowCount = Math.floor(MAX_BUFFER_CAPACITY / readingState.length);
    const rows = [];

    do {
      let nextTime: Date | undefined;

      // Find next timestamp (the smallest date from all subsequent data points)
      for (const {streamIndex, itemIndex} of readingState) {
        const dataPoint = dataPoints[streamIndex][itemIndex];
        if (dataPoint && dataPoint.x <= time) {
          if (nextTime == null || dataPoint.x < nextTime) {
            nextTime = dataPoint.x;
          }
        }
      }

      if (nextTime) {
        // Create row for the next date
        const readingStateForNextTime = readingState.filter(({streamIndex, itemIndex}) => {
          const dataPoint = dataPoints[streamIndex][itemIndex];
          return dataPoint && dataPoint.x.getTime() === nextTime!.getTime();
        });
        const row = fromPairs(readingStateForNextTime.map(({streamIndex, itemIndex}) => [
          signalWithInstances[streamIndex][1].scaleId,
          roundDecimal(dataPoints[streamIndex][itemIndex].y, 4),
        ]));
        if (settings.includeTimeColumn) {
          row.time = nextTime.getTime();
        }
        rows.push(row);

        readingStateForNextTime.forEach((state) => state.itemIndex++);

        if (rows.length === maxRowCount) {
          await FileManager.writeChunk(id, {type: "data", data: rows});
          rows.length = 0;
        }
      } else {
        break;
      }
    } while(true);

    if (rows.length) {
      await FileManager.writeChunk(id, {type: "data", data: rows});
    }
  }

  async function writeGapTo(time: Date) {
    // nothing to do
  }
};

const getNonEmptySignals = (signalWithInstances: Array<[ISignalState, ISignalInstanceState]>) =>
  signalWithInstances.filter(([_, instance]) =>
    getDataPoints(instance.virtualDeviceId, instance.signalId).length > 0);

const createDataEvents = (signalWithInstances: Array<[ISignalState, ISignalInstanceState]>): DataEvent[] => {
  const events = flatMap(
    signalWithInstances,
    // Build start/end events for each data stream
    ([_, instance], i) => {
      const dataPoints = getDataPoints(instance.virtualDeviceId, instance.signalId);
      const firstPoint = first(dataPoints)!;
      const lastPoint = last(dataPoints)!;

      return [{
        type: "start",
        time: firstPoint.x,
        index: i,
      }, {
        type: "end",
        time: lastPoint.x,
        index: i,
      }];
    });

  // Sort events in descending order (to make the earliest date available on the top).
  // "end" events should go before "start" (when traversed from the top of the stack)
  events.sort((a, b) => {
    const diff = b.time.getTime() - a.time.getTime();
    if (diff) {
      return diff;
    }
    const aEnd = a.type === "end";
    const bEnd = b.type === "end";
    if (aEnd && bEnd) {
      return 0;
    } else if (aEnd) {
      return 1;
    } else if (bEnd) {
      return -1;
    } else {
      return 0;
    }
  });
  return events;
};
