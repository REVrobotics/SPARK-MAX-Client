import {constant} from "lodash";
import * as React from "react";
import {IApplicationState, IDisplaySettings, ISignalInstanceState, SignalId, VirtualDeviceId} from "../store/state";
import {DataPoint, DataSource} from "../display/display-interfaces";
import {connect} from "react-redux";

// const engine = new ChartjsWaveformEngine();
// const ChartJsDisplay = createWaveformDisplay(engine);
// const dataSource1 = engine.createDataSource({});
// const dataSource2 = engine.createDataSource({});

// const scale2 = two ?
//   <WaveformScale id="axis-2"
//                  autoScale={true}
//                  min={0}
//                  max={100}
//                  suggestedMax={50}
//                  color="blue"/>
//   : null;
// const plot2 = two ?
//   <DataSet scaleId="axis-2" dataSource={dataSource2} label="Plot 2" color="blue"/>
//   : null;
// <ChartJsDisplay>
//   <WaveformChart timeSpan={30}>
//     <WaveformScale id="axis-1"
//                    autoScale={true}
//                    min={0}
//                    max={100}
//                    suggestedMax={50}
//                    color="red"/>
//     <DataSet scaleId="axis-1" dataSource={dataSource1} label="Plot 1" color="red"/>
//   </WaveformChart>
//   <WaveformChart timeSpan={40}>
//     {scale2}
//     {plot2}
//   </WaveformChart>
// </ChartJsDisplay>

interface IProps {
  className: string;
  settings: IDisplaySettings;
  signals: ISignalInstanceState[];
  getDataSource: (deviceId: VirtualDeviceId, signalId: SignalId) => DataSource<DataPoint>;
}

const RunDisplay = (props: IProps) => {
  const {className} = props;

  return <div className={className}/>
};

function mapStateToProps(state: IApplicationState) {
  return {
    settings: state.display.settings,
    signals: [],
    getDataSource: () => null as any,
  };
}

export default connect(mapStateToProps, constant({}))(RunDisplay);
