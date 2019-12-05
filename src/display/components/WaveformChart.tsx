import * as React from "react";
import {PureComponent, ReactNode, RefObject, useContext} from "react";
import {ChartId, WaveformChartOptions} from "../display-interfaces";
import {WaveformChartContext, WaveformEngineContext, WithEngine} from "./waveform-engine-context";

interface Props extends WaveformChartOptions {
  children: ReactNode;
}

class WaveformChartInContext extends PureComponent<WithEngine<Props>> {
  private ref: RefObject<HTMLElement>;
  private chartId: ChartId;

  constructor(props: WithEngine<Props>) {
    super(props);

    this.ref = React.createRef();
    this.chartId = props.engine.addChart();
    this.props.engine.updateChart(this.chartId, props);
  }

  public componentDidMount(): void {
    this.props.engine.createChart(this.chartId, this.ref.current!);
  }

  public componentWillUnmount(): void {
    this.props.engine.destroyChart(this.chartId);
    this.props.engine.removeChart(this.chartId);
  }

  public componentDidUpdate(): void {
    this.props.engine.updateChart(this.chartId, this.props);
    this.props.engine.flushChart(this.chartId);
  }

  public render() {
    const { engine, children } = this.props;

    return (
      <WaveformChartContext.Provider value={this.chartId}>
        <div className="waveform-chart">
          {engine.createRoot(this.ref)}
          {children}
        </div>
      </WaveformChartContext.Provider>
    );
  }
}

const WaveformChart = (props: Props) => {
  const engine = useContext(WaveformEngineContext);
  return <WaveformChartInContext engine={engine} {...props}/>
};

export default WaveformChart;
