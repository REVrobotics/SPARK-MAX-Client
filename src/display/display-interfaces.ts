import {ReactNode, Ref} from "react";

export interface WaveformChartOptions {
  showLegend: boolean;
  legendPosition: LegendPosition;
  timeSpan: number;
}

export enum LegendPosition {
  Top = "top",
  Right = "right",
  Inside = "inside",
}

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

export interface DataSetOptions {
  scaleId?: string;
  label: string;
  dataSource: DataSource<DataPoint>;
  color?: string;
}

export type ChartId = any;
export type ScaleId = any;
export type DataSetId = any;

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

  createDataSource(stream: DataStream<any>): DataSource<any>;

  createRoot(ref: Ref<HTMLElement>): ReactNode;
}

export type Unsubscribe = () => void;

export type DataStream<T> = (cb: (data: T) => void) => Unsubscribe;

export type DataSource<T> = (options: any) => DataStream<T[]>;

export interface DataPoint {
  y: number;
  x: Date;
}
