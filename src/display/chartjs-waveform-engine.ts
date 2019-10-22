// tslint:disable:max-classes-per-file

import {findIndex, last, noop, pullAt, uniqueId} from "lodash";
import {AbstractWaveformEngine, WaveformEngineChart} from "./abstract-waveform-engine";
import {
  DataPoint,
  DataSetId,
  DataSetOptions,
  DataSource,
  DataSubscription,
  LegendPosition,
  ScaleId,
  WaveformChartOptions,
  WaveformScaleOptions
} from "./display-interfaces";
import * as React from "react";
import {ReactNode, Ref} from "react";
import * as Chart from "chart.js";
import {ChartConfiguration, ChartDataSets, ChartXAxe, ChartYAxe, PositionType} from "chart.js";
import {setArrayElement} from "../utils/object-utils";

Chart.defaults.global.legend!.onClick = noop;

const createEmptyConfiguration = (): ChartConfiguration => ({
  type: "line",
  options: {
    // responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0,
      },
      point: {
        radius: 0,
      },
    },
    tooltips: {
      mode: "index",
      intersect: false,
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
      }],
      yAxes: [],
    },
  },
  data: {
    labels: [],
    datasets: [],
  },
});

const fitIntoXAxe = (axe: ChartXAxe, data: DataPoint[], timeScale: number): ChartXAxe => {
  const rightBound = data.length === 0 ? 0 : Math.ceil((last(data)!.x.getTime()) / 1000) * 1000;
  const leftBound = rightBound - timeScale * 1000;
  const currentMin = axe.time && axe.time.min ? Number(axe.time.min) : Number.POSITIVE_INFINITY;
  const currentMax = axe.time && axe.time.max ? Number(axe.time.max) : Number.NEGATIVE_INFINITY;
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

class ChartjsEngineChart implements WaveformEngineChart {
  private configuration: ChartConfiguration;
  private chart: Chart;
  private dataSetIds: DataSetId = [];
  private dataSources: { [dataSetId: string]: DataSource<DataPoint> } = {};
  private dataSubscriptions: { [dataSetId: string]: DataSubscription<DataPoint[]> } = {};
  private initialized = false;
  private timeSpan: number = 30;

  constructor() {
    this.configuration = createEmptyConfiguration();
  }

  public create(element: HTMLElement): void {
    const canvas = element as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    this.chart = new Chart(ctx, this.configuration);
    this.initialized = true;
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

  private addDataSource(dataSetId: DataSetId, dataSource: DataSource<DataPoint>): void {
    this.dataSources[dataSetId] = dataSource;
    this.listenDataSource(dataSetId, dataSource);
  }

  private removeDataSource(dataSetId: DataSetId): void {
    this.unlistenDataSource(dataSetId);
    delete this.dataSubscriptions[dataSetId];
    delete this.dataSources[dataSetId];
  }

  private listenDataSource(dataSetId: DataSetId, dataSource: DataSource<DataPoint>): void {
    const subscription = dataSource.observe(this.buildDataQuery());
    subscription.onData((data) => {
      this.updateDatasetData(dataSetId, data);
      this.flush();
    });
    this.dataSubscriptions[dataSetId] = subscription;
  }

  private unlistenDataSource(dataSetId: DataSetId): void {
    const subscription = this.dataSubscriptions[dataSetId];
    if (subscription) {
      subscription.unsubscribe();
      delete this.dataSubscriptions[dataSetId];
    }
  }

  private buildDataQuery(): any {
    return this.timeSpan;
  }

  private updateDatasetData(dataSetId: DataSetId, data: DataPoint[]): void {
    const datasets: ChartDataSets[] = this.initialized ?
      this.chart.data!.datasets! : this.configuration.data!.datasets!;

    const index = this.dataSetIds.indexOf(dataSetId);

    datasets[index].data = data;
    this.fitDataIntoXAxe(data);
  }

  private fitDataIntoXAxe(data: DataPoint[]): void {
    this.updateTimeAxe((axe) => fitIntoXAxe(axe, data, this.timeSpan));
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

  public createDataSource(intents: any): DataSource<any> {
    const data: DataPoint[] = [];

    return {
      query: () => data,
      observe: () => {
        let intervalId: any;

        return {
          onData(cb: (data: any[]) => void): void {
            cb(data);

            intervalId = setInterval(() => {
              data.push({
                x: new Date(new Date().getTime() - startDate.getTime()),
                y: Math.floor(Math.random() * 100),
              });
              if (data.length > 100) {
                data.shift();
              }
              cb(data)
            }, 500);
          },
          unsubscribe(): void {
            clearInterval(intervalId);
          }
        };
      },
    };
  }

  protected createEngineChart(): WaveformEngineChart {
    return new ChartjsEngineChart();
  }

}

export default ChartjsWaveformEngine;

const startDate = new Date();
