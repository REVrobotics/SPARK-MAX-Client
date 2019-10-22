import {constant} from "lodash";
import * as React from "react";
import {
  IApplicationState,
  IDisplaySettings,
  ISignalInstanceState,
  ISignalState,
  SignalId,
  VirtualDeviceId
} from "../store/state";
import {DataPoint, DataSource} from "../display/display-interfaces";
import {connect} from "react-redux";
import {DataSet, WaveformChart, waveformEngine, WaveformEngineDisplay, WaveformScale} from "../display";
import {querySignalsWithInstances} from "../store/selectors";
import {NonIdealState} from "@blueprintjs/core";

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
  className?: string;
  settings: IDisplaySettings;
  signalsWithInstances: Array<[ISignalState, ISignalInstanceState]>;
  getDataSource: (deviceId: VirtualDeviceId, signalId: SignalId) => DataSource<DataPoint>;
}

const RunDisplay = (props: IProps) => {
  const {className, settings, signalsWithInstances, getDataSource} = props;

  if (signalsWithInstances.length === 0) {
    return <NonIdealState className={className}
                          icon="timeline-line-chart"
                          title={tt("lbl_no_signals_title")}
                          description={tt("lbl_no_signals_description")}/>
  }

  return (
    <WaveformEngineDisplay className={className}>
      {
        signalsWithInstances.map(([signal, instance]) =>
          <WaveformChart key={instance.scaleId}
                         timeSpan={settings.timeSpan}
                         legendPosition={settings.legendPosition}
                         showLegend={settings.showLegend}>
            <WaveformScale id={instance.scaleId}
                           autoScale={instance.autoScaled}
                           suggestedMin={signal.expectedMin}
                           suggestedMax={signal.expectedMax}
                           min={instance.min}
                           max={instance.max}
                           color={instance.style.color}/>
            <DataSet scaleId={instance.scaleId}
                     dataSource={getDataSource(instance.virtualDeviceId, instance.signalId)}
                     label={signal.name}
                     color={instance.style.color}/>
          </WaveformChart>
        )
      }
    </WaveformEngineDisplay>
  );
};

function mapStateToProps(state: IApplicationState) {
  return {
    settings: state.display.settings,
    signalsWithInstances: querySignalsWithInstances(state),
    getDataSource: () => waveformEngine.createDataSource(state.display.settings.timeSpan),
  };
}

export default connect(mapStateToProps, constant({}))(RunDisplay);
