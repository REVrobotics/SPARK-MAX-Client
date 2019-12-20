import {ScaleId, WaveformScaleOptions} from "../display-interfaces";
import * as React from "react";
import {PureComponent, useContext} from "react";
import {WaveformChartContext, WaveformEngineContext, WithChartId, WithEngine} from "./waveform-engine-context";

type Props = WithEngine<WithChartId<WaveformScaleOptions>>;

class WaveformScaleInContext extends PureComponent<Props> {
  private scaleId: ScaleId;

  constructor(props: Props) {
    super(props);
  }

  public componentDidMount(): void {
    const { props } = this;
    this.scaleId = props.engine.createScale(props.chartId, this.props.id);
    props.engine.updateScale(props.chartId, this.scaleId, props);
  }

  public componentWillUnmount(): void {
    const { props } = this;

    props.engine.destroyScale(props.chartId, this.scaleId);
  }

  public componentDidUpdate(): void {
    this.props.engine.updateScale(this.props.chartId, this.scaleId, this.props);
  }

  public render() {
    return null;
  }
}

const WaveformScale = (props: WaveformScaleOptions) => {
  const engine = useContext(WaveformEngineContext);
  const chartId = useContext(WaveformChartContext);

  return <WaveformScaleInContext chartId={chartId} engine={engine} {...props}/>
};

export default WaveformScale;
