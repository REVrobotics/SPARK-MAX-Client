import {ReactNode, Ref} from "react";

/**
 * This module declares interface that should be implemented by underlying chart implementation.
 */

/**
 * Common chart options
 */
export interface WaveformChartOptions {
  showLegend: boolean;
  legendPosition: LegendPosition;
  timeSpan: number;
}

/**
 * Position of legend
 */
export enum LegendPosition {
  Top = "top",
  Right = "right",
  Inside = "inside",
}

/**
 * Scale/Axis settings
 */
export interface WaveformScaleOptions {
  id?: string;
  autoScale?: boolean;
  min?: number;
  max?: number;
  suggestedMin?: number;
  suggestedMax?: number;
  color?: string;
  label?: string;
}

/**
 * Options for data set
 */
export interface DataSetOptions {
  /**
   * What scale/axis to use
   */
  scaleId?: string;
  label: string;
  dataSource: DataSource<DataPoint>;
  color?: string;
}

export type ChartId = any;
export type ScaleId = any;
export type DataSetId = any;

/**
 * The main idea around integration of chart library is to avoid too much imperative logic required
 * to use specific library.
 *
 * All charting is wrapped in the set of components (declared under `components/` directory).
 * These React components provide simple declarative interface to use chart library.
 * But anyway we have to **translate declarative React language to the imperative updates** for specific library.
 * To do this all imperative updates are delegated to the underlying `WaveformEngine`.
 */
export interface WaveformEngine {
  addChart(): ChartId;

  removeChart(chart: ChartId): void;

  createChart(chart: ChartId, element: HTMLElement): void;

  updateChart(chart: ChartId, options: WaveformChartOptions): void;

  destroyChart(chart: ChartId): void;

  flushChart(chart: ChartId): void;

  createScale(chart: ChartId, scaleId?: ScaleId): ScaleId;

  updateScale(chart: ChartId, scaleId: ScaleId, scale: WaveformScaleOptions): void;

  destroyScale(chart: ChartId, scaleId: ScaleId): void;

  createDataSet(chart: ChartId): DataSetId;

  updateDataSet(chart: ChartId, dataSetId: DataSetId, dataSet: DataSetOptions): void;

  destroyDataSet(chart: ChartId, dataSetId: DataSetId): void;

  createDataSource(stream: DataStream): DataSource<any>;

  createRoot(ref: Ref<HTMLElement>): ReactNode;
}

export type Unsubscribe = () => void;

export enum DataStreamEventType {Settings, Append, Fill}

export interface DataStreamDataEvent {
  type: DataStreamEventType.Fill | DataStreamEventType.Append;
  data: DataPoint[];
}

export interface DataStreamSettingsEvent {
  type: DataStreamEventType.Settings;
  startTime: Date;
  stale: boolean;
}

export type DataStreamEvent = DataStreamDataEvent | DataStreamSettingsEvent;

/**
 * DataStream allows to subscribe to data updates
 */
export type DataStream = (cb: (event: DataStreamEvent) => void) => Unsubscribe;

/**
 * DataSource returns stream that emits sets of points to be displayed in the chart
 */
export type DataSource<T> = (options: any) => DataStream;

export interface DataPoint {
  y: number;
  x: Date;
}
