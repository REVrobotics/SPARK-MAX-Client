import {forEach, groupBy, isEmpty, once, pull} from "lodash";
import {DeviceId, IDestination, ITelemetryDataItem, SignalId, VirtualDeviceId} from "./state";
import {waveformEngine} from "../display";
import {DataPoint, DataStream} from "../display/display-interfaces";
import {truncateByTime} from "../utils/object-utils";

/**
 * This file defines data buffers used to cache emitted data points
 */

export interface IBufferOptions {
  timeSpan: number;
}

interface IBufferRegistry {
  [virtualDeviceId: string]: {
    [signalId: number]: IBuffer;
  };
}

interface IBuffer {
  deviceId: DeviceId;
  data: DataPoint[];
  nextCallbacks: Array<(data: DataPoint[]) => void>;
  completeCallbacks: Array<() => void>;
  stale: boolean;
}

const bufferOptions: IBufferOptions = {
  timeSpan: 30000,
};

const buffers: IBufferRegistry = {};
const deviceIdToVirtualDeviceId: {[deviceId: number]: VirtualDeviceId} = {};

export const getDataSource = (virtualDeviceId: VirtualDeviceId, signalId: SignalId) =>
  waveformEngine.createDataSource(getDataStream(virtualDeviceId, signalId));

export const setDataBufferOptions = (options: IBufferOptions) => {
  Object.assign(bufferOptions, options);
};

export const addDataBuffer = ({virtualDeviceId, deviceId, signalId}: IDestination) => {
  const buffer = ensureDataBuffer(virtualDeviceId, signalId);
  buffer.deviceId = deviceId;
  deviceIdToVirtualDeviceId[deviceId] = virtualDeviceId;
};

export const changeDataBuffer = ({virtualDeviceId, deviceId, signalId}: IDestination) => {
  const buffer = getDataBuffer(virtualDeviceId, signalId);
  if (buffer.deviceId === deviceId) {
    return;
  }

  delete deviceIdToVirtualDeviceId[buffer.deviceId];
  buffer.deviceId = deviceId;
  deviceIdToVirtualDeviceId[deviceId] = virtualDeviceId;
};

export const removeDataBuffer = ({virtualDeviceId, deviceId, signalId}: IDestination) => {
  const deviceBuffers = buffers[virtualDeviceId];
  if (deviceBuffers) {
    const buffer = deviceBuffers[signalId];
    if (buffer) {
      disposeDataBuffer(buffer);
      delete deviceBuffers[signalId];
      if (isEmpty(deviceBuffers)) {
        delete buffers[virtualDeviceId];
        delete deviceIdToVirtualDeviceId[deviceId];
      }
    }
  }
};

export const markDataBufferAsStale = ({virtualDeviceId, signalId}: IDestination) => {
  const buffer = getDataBuffer(virtualDeviceId, signalId);
  buffer.stale = true;
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

/**
 * Writes data to subscribers
 */
const writeDataChunkByDestination = (deviceId: DeviceId, signalId: SignalId, items: ITelemetryDataItem[]) => {
  const virtualDeviceId = getVirtualDeviceId(deviceId);

  const byDevice = buffers[virtualDeviceId];
  if (byDevice == null) {
    throw new Error(`No buffer registered for "${virtualDeviceId}"`);
  }

  const buffer = byDevice[signalId];
  if (buffer == null) {
    throw new Error(`No buffer registered for "${virtualDeviceId}:${signalId}"`);
  }

  const points = items.map((item) => ({ x: new Date(item.timestampMs || 0), y: item.value || 0}));
  if (buffer.stale) {
    buffer.stale = false;
    buffer.data = [];
  }
  buffer.data.push(...points);
  truncateByTime(buffer.data, bufferOptions.timeSpan, (point) => point.x.getTime());
  buffer.nextCallbacks.forEach((cb) => cb(points));
};

const getVirtualDeviceId = (deviceId: DeviceId): VirtualDeviceId => {
  const virtualId = deviceIdToVirtualDeviceId[deviceId];
  if (virtualId == null) {
    throw new Error(`No any mapping registered for deviceId = "${deviceId}"`);
  }
  return virtualId;
};

const ensureDataBuffer = (virtualDeviceId: VirtualDeviceId, signalId: SignalId) => {
  const deviceBuffers = buffers[virtualDeviceId] || {};
  buffers[virtualDeviceId] = deviceBuffers;

  const buffer = deviceBuffers[signalId] || newDataBuffer();
  deviceBuffers[signalId] = buffer;
  return buffer;
};

const newDataBuffer = (deviceId: DeviceId = -1): IBuffer => ({
  deviceId,
  data: [],
  nextCallbacks: [],
  completeCallbacks: [],
  stale: false,
});

const disposeDataBuffer = (buffer: IBuffer) => {
  buffer.completeCallbacks.forEach((cb) => cb());
  buffer.nextCallbacks.length = 0;
  buffer.completeCallbacks.length = 0;
  buffer.data = [];
  buffer.deviceId = -1;
};

const getDataBuffer = (virtualDeviceId: VirtualDeviceId, signalId: SignalId): IBuffer => {
  const deviceBuffers = buffers[virtualDeviceId];
  if (deviceBuffers == null) {
    throw new Error(`Buffer was not found by virtual device id: ${virtualDeviceId}`);
  }

  const buffer = deviceBuffers[signalId];
  if (buffer == null) {
    throw new Error(`Buffer was not found by virtual device id and signal id: ${virtualDeviceId}, ${signalId}`);
  }

  return buffer;
};

const getDataStream = (virtualDeviceId: VirtualDeviceId, signalId: SignalId): DataStream<DataPoint[]> => (cb) => {
  ensureDataBuffer(virtualDeviceId, signalId);
  const buffer = getDataBuffer(virtualDeviceId, signalId);
  const unsubscribe = once(() => {
    pull(buffer.nextCallbacks, cb);
    pull(buffer.completeCallbacks, unsubscribe);
  });
  buffer.nextCallbacks.push(cb);
  buffer.completeCallbacks.push(unsubscribe);
  cb(buffer.data);
  return unsubscribe;
};
