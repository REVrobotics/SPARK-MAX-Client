import {keyBy} from "lodash";
import * as React from "react";
import {connect} from "react-redux";
import {IApplicationState, PanelName} from "../store/state";
import {setDisplaySelectedPanel, SparkDispatch} from "../store/actions";
import {
  queryDisplaySelectedPanel,
  queryHasSignalForSelectedDevice,
  queryIsSelectedDeviceBlocked, queryIsSelectedDeviceConnected,
  queryIsSelectedDeviceLoaded
} from "../store/selectors";
import List from "../components/List";
import Tool, {ListItemAlignment} from "../components/Tool";
import {IconName, NonIdealState, Spinner} from "@blueprintjs/core";
import PanelContainer from "../components/PanelContainer";
import RunDisplay from "./RunDisplay";
import ParametersRunPanel from "./ParametersRunPanel";
import SettingsRunPanel from "./SettingsRunPanel";
import SignalsRunPanel from "./SignalsRunPanel";
import RunQuickBar from "./RunQuickBar";
import RunControlArea from "./RunControlArea";

interface IProps {
  connected: boolean;
  isLoaded: boolean;
  selectedPanel: PanelName;
  selectedDeviceIsBlocked: boolean;
  hasSignalForSelectedDevice: boolean;

  onSelectPanel(panel: PanelName): void;
}

interface PanelOptions {
  value: PanelName;
  icon: IconName;
  title: string;
  align?: ListItemAlignment;
}

const panelOptions: PanelOptions[] = [
  {value: PanelName.Run, icon: "play", title: tt("lbl_run_panel")},
  {value: PanelName.Parameters, icon: "settings", title: tt("lbl_parameters_panel")},
  {value: PanelName.Signals, icon: "timeline-line-chart", title: tt("lbl_signals_panel")},
  {value: PanelName.Settings, icon: "cog", title: tt("lbl_settings_panel"), align: ListItemAlignment.End},
];

const panelOptionsByKey: {[name: string]: PanelOptions} = keyBy(panelOptions, (options) => options.value);

interface RunPanelProps {
  panel: PanelName;
  selectedDeviceIsBlocked: boolean;
  hasSignalForSelectedDevice: boolean;
}

const RunPanel = (props: RunPanelProps) => {
  const {panel, hasSignalForSelectedDevice, selectedDeviceIsBlocked} = props;

  // Only settings panel can be made visible if there is no any signal for selected device
  if (panel !== PanelName.Settings) {
    if (!hasSignalForSelectedDevice) {
      return <NonIdealState icon="info-sign"
                            title={tt("lbl_no_signals_title")}
                            description={tt("lbl_no_signals_description")}/>;
    } else if (selectedDeviceIsBlocked) {
      return <NonIdealState icon="warning-sign"
                            title={tt("lbl_device_blocked_title")}
                            description={tt("lbl_device_blocked_description")}/>;
    }
  }

  switch (panel) {
    case PanelName.Run:
      return <MainRunPanel/>;
    case PanelName.Parameters:
      return <ParametersRunPanel/>;
    case PanelName.Signals:
      return <SignalsRunPanel/>;
    case PanelName.Settings:
      return <SettingsRunPanel/>;
    default:
      return null;
  }
};

const MainRunPanel = () => {
  return (
    <div className="run-main-panel flex-row full-width no-wrap">
      <RunQuickBar className="run-main-panel__quick"/>
      <RunControlArea className="run-main-panel__control-area flex-1"/>
    </div>
  );
};
class RunTab extends React.Component<IProps> {

  public render() {
    const {connected, isLoaded, selectedPanel, hasSignalForSelectedDevice, selectedDeviceIsBlocked, onSelectPanel} = this.props;

    if (!connected) {
      return <NonIdealState icon="disable"
                            title={tt("lbl_no_device_connected_title")}
                            description={tt("lbl_no_device_connected_description")}/>;
    }

    if (!isLoaded) {
      return <NonIdealState icon={<Spinner/>}
                            title={tt("lbl_device_loading")}/>;
    }

    return (
      <div className="page page--full flex-column">
        <div className="flex-row">
          <List className="display__toolbar"
                selected={selectedPanel}
                onSelect={onSelectPanel}>
            {panelOptions.map((options) => <Tool key={options.value} {...options}/>)}
          </List>
          <RunDisplay className="flex-1 display__container"/>
        </div>
        <PanelContainer className="flex-1 display__panel-container"
                        icon={panelOptionsByKey[selectedPanel].icon}
                        title={panelOptionsByKey[selectedPanel].title}>
          <RunPanel panel={selectedPanel}
                    selectedDeviceIsBlocked={selectedDeviceIsBlocked}
                    hasSignalForSelectedDevice={hasSignalForSelectedDevice}/>
        </PanelContainer>
      </div>
    );
  }

  // public componentDidMount() {
  //   this.stopHeartbeat = SparkManager.onHeartbeat(this.receiveHeartbeat);
  // }
  //
  // private run() {
  //   this.setState({running: true, output: 0.0});
  //   SparkManager.enableHeartbeat(20);
  //   SparkManager.setSetpoint(0.0);
  // }
  //
  // private stop() {
  //   this.setState({running: false});
  //   SparkManager.disableHeartbeat(this.receiveHeartbeat);
  // }
  //
  // private receiveHeartbeat() {
  //   // TODO - Eventually graph all of this.
  //   if (this._ticks > 50) {
  //     this._ticks = 0;
  //     this.setState({
  //       option: {
  //         series: [{
  //           data: [...this.state.option.series[0].data, this.state.output],
  //           type: 'line'
  //         }],
  //         xAxis: {
  //           name: tt("lbl_time"),
  //           type: 'category',
  //           data: [...this.state.option.xAxis.data, (this.state.option.xAxis.data.length + 1) + ""]
  //         },
  //         yAxis: {
  //           name: tt("lbl_percent"),
  //           type: 'value'
  //         }
  //       }
  //     });
  //   } else {
  //     this._ticks++;
  //   }
  // }
  //
  // private changeMode(value: any) {
  //   let modeStr = "";
  //   if (value.currentTarget.value === 0) {
  //     modeStr = tt("lbl_percent");
  //   } else if (value.currentTarget.value === 1) {
  //     modeStr = tt("lbl_velocity");
  //   } else if (value.currentTarget.value === 2) {
  //     modeStr = tt("lbl_position");
  //   }
  //   SparkManager.setControlMode(toDtoDeviceId(this.props.deviceId), value.currentTarget.value);
  //   this.setState({
  //     mode: modeStr,
  //     option: {
  //       series: [{
  //         data: [],
  //         type: 'line'
  //       }],
  //       xAxis: {
  //         name: tt("lbl_time"),
  //         type: 'category',
  //         data: []
  //       },
  //       yAxis: {
  //         name: value.currentTarget.value,
  //         type: 'value'
  //       }
  //     }
  //   });
  // }
  //
  // private changeOutput(value: number) {
  //   if (Math.abs(this.state.output - value) > 0.1) {
  //     if (this.state.output - value < 0) {
  //       value = this.state.output + 0.1;
  //     } else {
  //       value = this.state.output - 0.1;
  //     }
  //   }
  //   this.setState({output: value});
  //   if (value < 0) {
  //     SparkManager.setSetpoint(value * 1024);
  //   } else {
  //     SparkManager.setSetpoint(value * 1023);
  //   }
  // }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    connected: queryIsSelectedDeviceConnected(state),
    isLoaded: queryIsSelectedDeviceLoaded(state),
    selectedPanel: queryDisplaySelectedPanel(state),
    selectedDeviceIsBlocked: queryIsSelectedDeviceBlocked(state),
    hasSignalForSelectedDevice: queryHasSignalForSelectedDevice(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    onSelectPanel: (name: PanelName) => dispatch(setDisplaySelectedPanel(name)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RunTab);
