import {forEach, groupBy, isEmpty, once, pull} from "lodash";
import {DeviceId, IDestination, ITelemetryDataItem, SignalId, VirtualDeviceId} from "./state";
import {waveformEngine} from "../display";
import {DataPoint, DataStream} from "../display/display-interfaces";
import {truncateByTime} from "../utils/object-utils";

export interface IStreamOptions {
  timeSpan: number;
}

interface IStreamRegistry {
  [virtualDeviceId: string]: {
    [signalId: number]: IStream;
  };
}

interface IStream {
  deviceId: DeviceId;
  data: DataPoint[];
  nextCallbacks: Array<(data: DataPoint[]) => void>;
  completeCallbacks: Array<() => void>;
}

const streamOptions: IStreamOptions = {
  timeSpan: 30000,
};

const streams: IStreamRegistry = {};
const deviceIdToVirtualDeviceId: {[deviceId: number]: VirtualDeviceId} = {};

export const getDataSource = (virtualDeviceId: VirtualDeviceId, signalId: SignalId) =>
  waveformEngine.createDataSource(getDataStream(virtualDeviceId, signalId));

export const setStreamOptions = (options: IStreamOptions) => {
  Object.assign(streamOptions, options);
};

export const addDestination = ({virtualDeviceId, deviceId, signalId}: IDestination) => {
  const destination = ensureDestination(virtualDeviceId, signalId);
  destination.deviceId = deviceId;
  deviceIdToVirtualDeviceId[deviceId] = virtualDeviceId;
};

export const changeDestination = ({virtualDeviceId, deviceId, signalId}: IDestination) => {
  const destination = getDestination(virtualDeviceId, signalId);
  if (destination.deviceId === deviceId) {
    return;
  }

  delete deviceIdToVirtualDeviceId[destination.deviceId];
  destination.deviceId = deviceId;
  deviceIdToVirtualDeviceId[deviceId] = virtualDeviceId;
};

export const removeDestination = ({virtualDeviceId, deviceId, signalId}: IDestination) => {
  const deviceDestinations = streams[virtualDeviceId];
  if (deviceDestinations) {
    const destination = deviceDestinations[signalId];
    if (destination) {
      closeDestination(destination);
      delete deviceDestinations[signalId];
      if (isEmpty(deviceDestinations)) {
        delete streams[virtualDeviceId];
        delete deviceIdToVirtualDeviceId[deviceId];
      }
    }
  }
};

export const writeDataChunk = (mixedItems: ITelemetryDataItem[]) => {
  const byDevice = groupBy(mixedItems, (item) => item.deviceId);
  forEach(byDevice, (signals, deviceId) => {
    const bySignal = groupBy(signals, (signal) => signal.id);

    forEach(bySignal, (items, signalId) => {
      writeDataChunkByDestination(Number(deviceId), Number(signalId), items);
    });
  });
};

const writeDataChunkByDestination = (deviceId: DeviceId, signalId: SignalId, items: ITelemetryDataItem[]) => {
  const virtualDeviceId = getVirtualDeviceId(deviceId);

  const byDevice = streams[virtualDeviceId];
  if (byDevice == null) {
    throw new Error(`No destination registered for "${virtualDeviceId}"`);
  }

  const bySignal = byDevice[signalId];
  if (bySignal == null) {
    throw new Error(`No destination registered for "${virtualDeviceId}:${signalId}"`);
  }

  const points = items.map((item) => ({ x: new Date(item.timestamp_ms), y: item.value}));
  bySignal.data.push(...points);
  truncateByTime(bySignal.data, streamOptions.timeSpan, (point) => point.x.getTime());
  bySignal.nextCallbacks.forEach((cb) => cb(points));
};

const getVirtualDeviceId = (deviceId: DeviceId): VirtualDeviceId => {
  const virtualId = deviceIdToVirtualDeviceId[deviceId];
  if (virtualId == null) {
    throw new Error(`No any mapping registered for deviceId = "${deviceId}"`);
  }
  return virtualId;
};

const ensureDestination = (virtualDeviceId: VirtualDeviceId, signalId: SignalId) => {
  const deviceDestinations = streams[virtualDeviceId] || {};
  streams[virtualDeviceId] = deviceDestinations;

  const destination = deviceDestinations[signalId] || openDestination();
  deviceDestinations[signalId] = destination;
  return destination;
};

const openDestination = (deviceId: DeviceId = -1): IStream => ({
  deviceId,
  data: [],
  nextCallbacks: [],
  completeCallbacks: [],
});

const closeDestination = (destination: IStream) => {
  destination.completeCallbacks.forEach((cb) => cb());
  destination.nextCallbacks.length = 0;
  destination.completeCallbacks.length = 0;
  destination.data = [];
  destination.deviceId = -1;
};

const getDestination = (virtualDeviceId: VirtualDeviceId, signalId: SignalId): IStream => {
  const deviceDestinations = streams[virtualDeviceId];
  if (deviceDestinations == null) {
    throw new Error(`Destination was not found by virtual device id: ${virtualDeviceId}`);
  }

  const destination = deviceDestinations[signalId];
  if (destination == null) {
    throw new Error(`Destination was not found by virtual device id and signal id: ${virtualDeviceId}, ${signalId}`);
  }

  return destination;
};

const getDataStream = (virtualDeviceId: VirtualDeviceId, signalId: SignalId): DataStream<DataPoint[]> => (cb) => {
  ensureDestination(virtualDeviceId, signalId);
  const destination = getDestination(virtualDeviceId, signalId);
  const unsubscribe = once(() => {
    pull(destination.nextCallbacks, cb);
    pull(destination.completeCallbacks, unsubscribe);
  });
  destination.nextCallbacks.push(cb);
  destination.completeCallbacks.push(unsubscribe);
  return unsubscribe;
};
