
export * from "./proto-gen/SPARK-MAX-Types_dto_pb";
export * from "./proto-gen/SPARK-MAX-Commands_dto_pb";
export * from "./dto-utils";

export interface SignalDto {
  id: number;
  name: string;
  units: string;
  expectedMin: number;
  expectedMax: number;
  deviceId: number;
}

export interface TelemetryDataItemDto {
  id: number;
  deviceId: number;
  value: number;
  timestamp_ms: number;
  name: string;
  units: string;
  expectedMin: number;
  expectedMax: number;
  updateRate_ms: number;
}
