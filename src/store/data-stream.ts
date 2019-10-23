import {forEach, groupBy, isEmpty, once, pull} from "lodash";
import {DeviceId, ITelemetryDataItem, SignalId, VirtualDeviceId} from "./state";
import {waveformEngine} from "../display";
import {DataPoint, DataStream} from "../display/display-interfaces";
import {truncateByTime} from "../utils/object-utils";

export interface IStreamOptions {
  timeSpan: number;
}

interface IDestinationRegistry {
  [virtualDeviceId: string]: {
    [signalId: number]: IDestination;
  };
}

interface IDestination {
  data: DataPoint[];
  nextCallbacks: Array<(data: DataPoint[]) => void>;
  completeCallbacks: Array<() => void>;
}

const streamOptions: IStreamOptions = {
  timeSpan: 30000,
};

const destinations: IDestinationRegistry = {};
const deviceIdToVirtualDeviceId: {[deviceId: number]: VirtualDeviceId} = {};

export const getDataSource = (virtualDeviceId: VirtualDeviceId, signalId: SignalId) =>
  waveformEngine.createDataSource(getDataStream(virtualDeviceId, signalId));

export const setStreamOptions = (options: IStreamOptions) => {
  Object.assign(streamOptions, options);
};

export const addDestination = (virtualDeviceId: VirtualDeviceId, device: DeviceId, signalId: SignalId) => {
  const deviceDestinations = destinations[virtualDeviceId] || {};
  deviceDestinations[signalId] = openDestination();
  destinations[virtualDeviceId] = deviceDestinations;
  deviceIdToVirtualDeviceId[device] = virtualDeviceId;
};

export const removeDestination = (virtualDeviceId: VirtualDeviceId, device: DeviceId, signalId: SignalId) => {
  const deviceDestinations = destinations[virtualDeviceId];
  if (deviceDestinations) {
    const destination = deviceDestinations[signalId];
    if (destination) {
      closeDestination(destination);
      delete deviceDestinations[signalId];
      if (isEmpty(deviceDestinations)) {
        delete destinations[virtualDeviceId];
        delete deviceIdToVirtualDeviceId[device];
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

  const byDevice = destinations[virtualDeviceId];
  if (byDevice == null) {
    return;
  }

  const bySignal = byDevice[signalId];
  if (bySignal == null) {
    return;
  }

  const points = items.map((item) => ({ x: new Date(item.timestamp_ms), y: item.value}));
  bySignal.data.push(...points);
  truncateByTime(bySignal.data, streamOptions.timeSpan, (point) => point.x.getTime());
  bySignal.nextCallbacks.forEach((cb) => cb(points));
};

const getVirtualDeviceId = (deviceId: DeviceId): VirtualDeviceId => deviceIdToVirtualDeviceId[deviceId];

const openDestination = (): IDestination => ({
  data: [],
  nextCallbacks: [],
  completeCallbacks: [],
});

const closeDestination = (destination: IDestination) => {
  destination.completeCallbacks.forEach((cb) => cb());
  destination.nextCallbacks.length = 0;
  destination.completeCallbacks.length = 0;
  destination.data = [];
};

const ensureDestination = (virtualDeviceId: VirtualDeviceId, signalId: SignalId): IDestination => {
  const deviceDestinations = destinations[virtualDeviceId] || {};
  destinations[virtualDeviceId] = deviceDestinations;

  const destination = deviceDestinations[signalId] || openDestination();
  deviceDestinations[signalId] = destination;

  return destination;
};

// const getDestination = (virtualDeviceId: VirtualDeviceId, signalId: SignalId): IDestination => {
//   const deviceDestinations = destinations[virtualDeviceId];
//   if (deviceDestinations == null) {
//     throw new Error(`Destination was not found by virtual device id: ${virtualDeviceId}`);
//   }
//
//   const destination = deviceDestinations[signalId];
//   if (destination == null) {
//     throw new Error(`Destination was not found by virtual device id and signal id: ${virtualDeviceId}, ${signalId}`);
//   }
//
//   return destination;
// };

const getDataStream = (virtualDeviceId: VirtualDeviceId, signalId: SignalId): DataStream<DataPoint[]> => (cb) => {
  const destination = ensureDestination(virtualDeviceId, signalId);
  const unsubscribe = once(() => {
    pull(destination.nextCallbacks, cb);
    pull(destination.completeCallbacks, unsubscribe);
  });
  destination.nextCallbacks.push(cb);
  destination.completeCallbacks.push(unsubscribe);
  return unsubscribe;
};
