// tslint:disable:max-classes-per-file

import {findIndex, maxBy, noop, padStart, pullAt, uniqueId} from "lodash";
import {AbstractWaveformEngine, WaveformEngineChart} from "./abstract-waveform-engine";
import {
  DataPoint,
  DataSetId,
  DataSetOptions,
  DataSource,
  DataStream,
  DataStreamEvent,
  DataStreamEventType,
  LegendPosition,
  ScaleId,
  Unsubscribe,
  WaveformChartOptions,
  WaveformScaleOptions
} from "./display-interfaces";
import * as React from "react";
import {ReactNode, Ref} from "react";
import * as Chart from "chart.js";
import {ChartConfiguration, ChartDataSets, ChartPoint, ChartXAxe, ChartYAxe, PositionType} from "chart.js";
import {setArrayElement, truncateByTime} from "../utils/object-utils";
import {subtractSeconds} from "../utils/date-utils";

Chart.defaults.global.legend!.onClick = noop;

const N_TICKS = 6;

export interface DataStreamSettings {
  startTime: Date;
  stale: boolean;
}

const createEmptyConfiguration = ({toTimeLabel}: {toTimeLabel(n: number): string}): ChartConfiguration => ({
  type: "line",
  options: {
    // responsive: true,
    maintainAspectRatio: false,
    // Styles of displayed primitives
    elements: {
      line: {
        tension: 0,
      },
      point: {
        radius: 0,
      },
    },
    tooltips: {
      enabled: false,
      mode: "index",
      intersect: false,
      callbacks: {
        title: ([item], data) => {
          const point = data.datasets![item.datasetIndex!].data![item.index!]! as ChartPoint;
          return toTimeLabel((point.x! as Date).getTime());
        },
        label: (tooltipItem, data) => {
          let label = data.datasets![tooltipItem.datasetIndex!].label || '';

          if (label) {
            label += ': ';
          }
          label += Number(tooltipItem.yLabel).toFixed(4);
          return label;
        },
      },
    },
    legend: {
      position: "right",
      labels: {
        usePointStyle: true,
      },
    },
    scales: {
      xAxes: [{
        type: "time",
        time: {
          displayFormats: {
            second: "mm:ss",
          },
          tooltipFormat: "mm:ss",
          // distribution: "series",
        },
        ticks: {
          source: "labels",
          callback: (_, index, values) => toTimeLabel(values[index].value),
        },
      }],
      yAxes: [],
    },
  },
  data: {
    labels: [],
    datasets: [],
  },
});

/**
 * Configures X axes for given set of data
 */
const fitIntoXAxe = (axe: ChartXAxe, maxTime: Date, timeScale: number): ChartXAxe => {
  const currentMin = axe.time && axe.time.min ? Number(axe.time.min) : Number.POSITIVE_INFINITY;
  const currentMax = axe.time && axe.time.max ? Number(axe.time.max) : Number.NEGATIVE_INFINITY;
  const rightBound = maxTime.getTime();
  const leftBound = rightBound - timeScale * 1000;
  if (leftBound >= currentMin && rightBound <= currentMax) {
    return axe;
  }

  return {
    ...axe,
    time: {
      ...axe.time,
      min: leftBound,
      max: rightBound,
    } as any,
  };
};

const createEmptyYAxe = (id: string): ChartYAxe => ({
  id,
  display: true,
  scaleLabel: {
    display: true,
    labelString: "",
  },
});

/**
 * Configures Y axes for given set of data
 */
const updateYAxe = (axe: ChartYAxe, options: WaveformScaleOptions): ChartYAxe => ({
  ...axe,
  scaleLabel: options.label ?
    {
      display: true,
      labelString: options.label,
      fontColor: options.color,
    }
    : {},
  ticks: options.autoScale ?
    {suggestedMin: options.suggestedMin, suggestedMax: options.suggestedMax, fontColor: options.color} :
    {min: options.min, max: options.max, fontColor: options.color},
});

const createEmptyDataSet = (): ChartDataSets => ({
  label: "",
  data: [],
  fill: false,
  borderColor: "black",
  backgroundColor: "black",
  pointStyle: "line",
});

const updateDataSet = (dataset: ChartDataSets, options: DataSetOptions): void => {
  dataset.label = options.label;
  dataset.yAxisID = options.scaleId;
  dataset.borderColor = options.color;
  dataset.backgroundColor = options.color;
};

const toChartjsPosition = (position: LegendPosition): PositionType => {
  switch (position) {
    case LegendPosition.Inside:
      return "chartArea";
    case LegendPosition.Right:
      return "right";
    default:
      return "top";
  }
}

/**
 * Integration of chart.js library
 */
class ChartjsEngineChart implements WaveformEngineChart {
  private configuration: ChartConfiguration;
  private chart: Chart;
  private dataSetIds: DataSetId[] = [];
  private maxTime: Date = new Date();
  private startTime: Date = new Date();
  private dataStreamSettings: { [dataSetId: string]: DataStreamSettings } = {};
  private dataSources: { [dataSetId: string]: DataSource<DataPoint> } = {};
  private dataSubscriptions: { [dataSetId: string]: Unsubscribe } = {};
  private initialized = false;
  private timeSpan: number = 30;
  private ticks = N_TICKS;

  constructor() {
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);

    this.configuration = createEmptyConfiguration({
      toTimeLabel: (time) => {
        const relativeTime = time - this.startTime.getTime();
        const ms = Math.abs(relativeTime);
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        return `${relativeTime >= 0 ? "" : "-"}${m}:${padStart(String(s % 60), 2, "0")}`;
      },
    });
  }

  public create(element: HTMLElement): void {
    const canvas = element as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    this.chart = new Chart(ctx, this.configuration);
    this.initialized = true;

    element.addEventListener("mouseenter", this.onMouseEnter);
    element.addEventListener("mouseleave", this.onMouseLeave);
  }

  public update(options: WaveformChartOptions): void {
    const legend = (this.initialized ? this.chart.options : this.configuration.options)!.legend!;
    if (this.initialized) {
      legend.display = options.showLegend;
      legend.position = toChartjsPosition(options.legendPosition);
    } else {
      legend.display = options.showLegend;
      legend.position = toChartjsPosition(options.legendPosition);
    }

    if (this.timeSpan !== options.timeSpan) {
      this.timeSpan = options.timeSpan;

      this.dataSetIds.forEach((id: DataSetId) => {
        const dataSource = this.dataSources[id];
        if (dataSource) {
          this.unlistenDataSource(id);
          this.listenDataSource(id, dataSource);
        }
      });
    }
  }

  public flush(): void {
    if (this.initialized) {
      this.chart.update();
    }
  }

  public destroy(): void {
    if (this.initialized) {
      this.chart.canvas!.removeEventListener("mouseenter", this.onMouseEnter);
      this.chart.canvas!.removeEventListener("mouseleave", this.onMouseLeave);
    }

    this.dataSetIds.forEach((id: DataSetId) => this.unlistenDataSource(id));

    this.chart.destroy();
    this.initialized = false;
  }

  public createDataSet(): DataSetId {
    const id = uniqueId("data-set:");
    const dataSet = createEmptyDataSet();
    if (this.initialized) {
      this.chart.data!.datasets!.push(dataSet);
    } else {
      this.configuration.data!.datasets!.push(dataSet);
    }
    this.dataSetIds.push(id);
    return id;
  }

  public destroyDataSet(dataSetId: DataSetId): void {
    const datasets: ChartYAxe[] = this.initialized ?
      this.chart.data!.datasets! : this.configuration.data!.datasets!;

    const index = this.dataSetIds.indexOf(dataSetId);

    datasets.splice(index, 1);
    this.dataSetIds.splice(index, 1);
    this.removeDataSource(dataSetId);
  }

  public updateDataSet(dataSetId: DataSetId, dataSet: DataSetOptions): void {
    const datasets: ChartDataSets[] = this.initialized ?
      this.chart.data!.datasets! : this.configuration.data!.datasets!;

    const index = this.dataSetIds.indexOf(dataSetId);

    updateDataSet(datasets[index], dataSet);
    if (dataSet.dataSource !== this.dataSources[dataSetId]) {
      this.removeDataSource(dataSetId);
      this.addDataSource(dataSetId, dataSet.dataSource);
    }
  }

  public createScale(scaleId: ScaleId = uniqueId("scale:")): ScaleId {
    const axe = createEmptyYAxe(scaleId);
    if (this.initialized) {
      this.chart.options!.scales!.yAxes!.push(axe);
    } else {
      this.configuration.options!.scales!.yAxes!.push(axe);
    }
    return scaleId;
  }

  public destroyScale(scaleId: ScaleId): void {
    const yAxes: ChartYAxe[] = this.initialized ?
      this.chart.options!.scales!.yAxes! : this.configuration.options!.scales!.yAxes!;

    const index = findIndex(yAxes, {id: scaleId});
    pullAt(yAxes, index);
  }

  public updateScale(scaleId: ScaleId, scale: WaveformScaleOptions): void {
    const yAxes: ChartYAxe[] = this.initialized ?
      this.chart.options!.scales!.yAxes! : this.configuration.options!.scales!.yAxes!;

    const index = findIndex(yAxes, {id: scaleId});
    const updatedYAxes = setArrayElement(yAxes, index, (axe) => updateYAxe(axe, scale));
    if (this.initialized) {
      this.chart.options!.scales!.yAxes = updatedYAxes;
    } else {
      this.configuration.options!.scales!.yAxes! = updatedYAxes;
    }
  }

  private onMouseEnter(): void {
    this.configuration.options!.tooltips!.enabled = true;
  }

  private onMouseLeave(): void {
    this.configuration.options!.tooltips!.enabled = false;
  }

  private addDataSource(dataSetId: DataSetId, dataSource: DataSource<DataPoint>): void {
    this.dataSources[dataSetId] = dataSource;
    this.listenDataSource(dataSetId, dataSource);
  }

  private removeDataSource(dataSetId: DataSetId): void {
    this.unlistenDataSource(dataSetId);
    delete this.dataStreamSettings[dataSetId];
    delete this.dataSubscriptions[dataSetId];
    delete this.dataSources[dataSetId];
  }

  private listenDataSource(dataSetId: DataSetId, dataSource: DataSource<DataPoint>): void {
    const subscription = dataSource(this.buildDataQuery());
    this.dataSubscriptions[dataSetId] = subscription((event) => {
      switch (event.type) {
        case DataStreamEventType.Settings:
          this.setDataStreamSettings(dataSetId, {startTime: event.startTime, stale: event.stale});
          break;
        case DataStreamEventType.Fill:
          this.updateDatasetData(dataSetId, event.data);
          break;
        default:
          break;
      }
      this.flush();
    });
  }

  private unlistenDataSource(dataSetId: DataSetId): void {
    const subscription = this.dataSubscriptions[dataSetId];
    if (subscription) {
      subscription();
      delete this.dataSubscriptions[dataSetId];
    }
  }

  private buildDataQuery(): any {
    return {timeSpan: this.timeSpan * 1000};
  }

  private setDataStreamSettings(dataSetId: DataSetId, settings: DataStreamSettings): void {
    if (!settings.stale) {
      const running = this.dataSetIds
        .map((id) => this.dataStreamSettings[id])
        .filter(Boolean)
        .filter(({stale}) => !stale);

      if (running.length === 0) {
        this.startTime = settings.startTime;
      }
    }
    this.dataStreamSettings[dataSetId] = settings;
  }

  private updateDatasetData(dataSetId: DataSetId, data: DataPoint[]): void {
    const datasets: ChartDataSets[] = this.initialized ?
      this.chart.data!.datasets! : this.configuration.data!.datasets!;

    const index = this.dataSetIds.indexOf(dataSetId);

    datasets[index].data = data;
    const maxInData = maxBy(data, (item) => item.x);
    if (maxInData && maxInData.x > this.maxTime) {
      this.maxTime = maxInData.x;
      // Shift labels if max time has changed
      this.updateLabels();
    }
    this.fitDataIntoXAxe(data);
  }

  private updateLabels(): void {
    const {maxTime, ticks} = this;
    const labels: any[] = (this.initialized ? this.chart.data!.labels : this.configuration.data!.labels) || [];

    labels.length = ticks;

    for (let i = 0; i <= ticks; i++) {
      labels[i] = subtractSeconds(maxTime, (ticks - i) * this.timeSpan / ticks);
    }

    if (this.initialized) {
      this.chart.data!.labels = labels;
    } else {
      this.configuration.data!.labels = labels;
    }
  }

  private fitDataIntoXAxe(data: DataPoint[]): void {
    this.updateTimeAxe((axe) => fitIntoXAxe(axe, this.maxTime, this.timeSpan));
  }

  private updateTimeAxe(transform: (axe: ChartXAxe) => ChartXAxe): void {
    const xAxes: ChartXAxe[] = this.initialized ?
      this.chart.options!.scales!.xAxes! : this.configuration.options!.scales!.xAxes!;

    const originalXAxe = xAxes[0];
    const updatedXAxe = transform(originalXAxe);

    if (updatedXAxe === originalXAxe) {
      return;
    }

    if (this.initialized) {
      this.chart.options!.scales!.xAxes = [updatedXAxe];
    } else {
      this.configuration.options!.scales!.xAxes! = [updatedXAxe];
    }
  }
}

class ChartjsWaveformEngine extends AbstractWaveformEngine {
  public createRoot(ref: Ref<HTMLElement>): ReactNode {
    return React.createElement("canvas", {ref});
  }

  public createDataSource(dataStream: DataStream): DataSource<DataPoint> {
    return ({timeSpan}: { timeSpan: number }) => {
      return (cb: (event: DataStreamEvent) => void) => {
        const data: DataPoint[] = [];

        return dataStream((event) => {
          switch (event.type) {
            case DataStreamEventType.Append:
              data.push(...event.data);
              truncateByTime(data, timeSpan, (point) => point.x.getTime());
              cb({type: DataStreamEventType.Fill, data});
              break;
            case DataStreamEventType.Fill:
              data.length = 0;
              data.push(...event.data);
              truncateByTime(data, timeSpan, (point) => point.x.getTime());
              cb({type: DataStreamEventType.Fill, data});
              break;
            default:
              cb(event);
              break;
          }
        });
      };
    };
  }

  protected createEngineChart(): WaveformEngineChart {
    return new ChartjsEngineChart();
  }

}

export default ChartjsWaveformEngine;
