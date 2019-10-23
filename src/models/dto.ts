import {LegendPosition} from "../display/display-interfaces";

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

export interface TelemetryListResponseDto {
  signalsAvailable: SignalDto[];
}

export interface DisplaySettingsDto {
  timeSpan: number;
  singleChart: boolean;
  showLegend: boolean;
  legendPosition: LegendPosition;
}

export interface DisplayConfigDto {
  settings: DisplaySettingsDto;
  devices: {[deviceId: number]: DisplayDeviceDto};
}

export interface DisplayDeviceDto {
  quickBar: number[];
  signals: {[signalId: number]: DisplayDeviceSignalDto};
}

export interface DisplayDeviceSignalDto {
  autoScaled: boolean;
  min: number;
  max: number;
}
