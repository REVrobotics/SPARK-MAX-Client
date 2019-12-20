import {DataSetId, DataSetOptions} from "../display-interfaces";
import * as React from "react";
import {PureComponent, useContext} from "react";
import {WaveformChartContext, WaveformEngineContext, WithChartId, WithEngine} from "./waveform-engine-context";

type Props = WithEngine<WithChartId<DataSetOptions>>;

class DataSetInContext extends PureComponent<Props> {
  private dataSetId: DataSetId;

  constructor(props: Props) {
    super(props);
  }

  public componentDidMount(): void {
    const { props } = this;
    this.dataSetId = props.engine.createDataSet(props.chartId);
    props.engine.updateDataSet(props.chartId, this.dataSetId, props);
  }

  public componentWillUnmount(): void {
    const { props } = this;

    props.engine.destroyDataSet(props.chartId, this.dataSetId);
  }

  public componentDidUpdate(): void {
    this.props.engine.updateDataSet(this.props.chartId, this.dataSetId, this.props);
  }

  public render() {
    return null;
  }
}

const DataSet = (props: DataSetOptions) => {
  const engine = useContext(WaveformEngineContext);
  const chartId = useContext(WaveformChartContext);

  return <DataSetInContext chartId={chartId} engine={engine} {...props}/>
};

export default DataSet;
