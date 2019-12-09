import {uniqueId} from "lodash";
import {
  ChartId,
  DataSetId,
  DataSetOptions,
  DataSource, DataStream, ScaleId,
  WaveformChartOptions,
  WaveformEngine,
  WaveformScaleOptions,
} from "./display-interfaces";
import {ReactNode, Ref} from "react";

export interface WaveformEngineChart {
  create(element: HTMLElement): void;
  update(options: WaveformChartOptions): void;
  flush(): void;
  destroy(): void;

  createDataSet(): DataSetId;
  destroyDataSet(dataSetId: DataSetId): void;
  updateDataSet(dataSetId: DataSetId, dataSet: DataSetOptions): void;

  createScale(scaleId?: ScaleId): ScaleId;
  destroyScale(scaleId: ScaleId): void;
  updateScale(scaleId: ScaleId, scale: WaveformScaleOptions): void;
}

export abstract class AbstractWaveformEngine implements WaveformEngine {
  private charts: { [id: string]: WaveformEngineChart } = {};

  public addChart(): ChartId {
    const chartId = uniqueId("chart:");
    this.charts[chartId] = this.createEngineChart();
    return chartId;
  }

  public removeChart(chartId: ChartId): void {
    delete this.charts[chartId];
  }

  public createChart(chartId: ChartId, element: HTMLElement): void {
    const chart = this.getChart(chartId);
    chart.create(element);
  }

  public destroyChart(chartId: ChartId): void {
    const chart = this.getChart(chartId);
    chart.destroy();
  }

  public updateChart(chartId: ChartId, options: WaveformChartOptions): void {
    const chart = this.getChart(chartId);
    chart.update(options);
  }

  public flushChart(chartId: ChartId): void {
    const chart = this.getChart(chartId);
    chart.flush();
  }

  public createDataSet(chartId: ChartId): DataSetId {
    const chart = this.getChart(chartId);
    return chart.createDataSet();
  }

  public destroyDataSet(chartId: ChartId, dataSetId: DataSetId): void {
    const chart = this.getChart(chartId);
    if (chart) {
      chart.destroyDataSet(dataSetId);
    }
  }

  public updateDataSet(chartId: ChartId, dataSetId: DataSetId, dataSet: DataSetOptions): void {
    const chart = this.getChart(chartId);
    chart.updateDataSet(dataSetId, dataSet);
  }

  public createScale(chartId: ChartId, scaleId?: ScaleId): ScaleId {
    const chart = this.getChart(chartId);
    return chart.createScale(scaleId);
  }

  public destroyScale(chartId: ChartId, scaleId: ScaleId): void {
    const chart = this.getChart(chartId);
    if (chart) {
      chart.destroyScale(scaleId);
    }
  }

  public updateScale(chartId: ChartId, scaleId: ScaleId, scale: WaveformScaleOptions): void {
    const chart = this.getChart(chartId);
    chart.updateScale(scaleId, scale);
  }

  public abstract createDataSource(stream: DataStream): DataSource<any>;

  public abstract createRoot(ref: Ref<HTMLElement>): ReactNode;

  protected abstract createEngineChart(): WaveformEngineChart;

  private getChart(chartId: ChartId): WaveformEngineChart {
    return this.charts[chartId];
  }
}
