import * as React from "react";
import {PureComponent, ReactNode, RefObject, useContext} from "react";
import {ChartId, WaveformChartOptions} from "../display-interfaces";
import {WaveformChartContext, WaveformEngineContext, WithEngine} from "./waveform-engine-context";
import {WaveformEngineChart} from "../abstract-waveform-engine";

interface Props extends WaveformChartOptions {
  children: ReactNode;
}

interface State {
  chart?: WaveformEngineChart;
}

class WaveformChartInContext extends PureComponent<WithEngine<Props>, State> {
  private ref: RefObject<HTMLElement>;
  private chartId: ChartId;

  constructor(props: WithEngine<Props>) {
    super(props);

    this.state = {};

    this.ref = React.createRef();
    this.chartId = props.engine.addChart();
    this.props.engine.updateChart(this.chartId, props);
  }

  public componentDidMount(): void {
    this.setState({chart: this.props.engine.createChart(this.chartId, this.ref.current!)});
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
    const {engine, options, children} = this.props;
    const {chart} = this.state;

    return (
      <WaveformChartContext.Provider value={this.chartId}>
        <div className="waveform-chart">
          {options && chart ? <div className="waveform-chart__options">{options(chart)}</div> : null}
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
