import {keyBy} from "lodash";
import * as React from "react";
import {connect} from "react-redux";
import {IApplicationState, PanelName} from "../store/state";
import {setDisplaySelectedPanel, SparkDispatch} from "../store/actions";
import {queryDisplaySelectedPanel} from "../store/selectors";
import List from "../components/List";
import Tool, {ListItemAlignment} from "../components/Tool";
import {IconName} from "@blueprintjs/core";
import PanelContainer from "../components/PanelContainer";
import SignalsRunPanel from "../containers/SignalsRunPanel";
import RunDisplay from "./RunDisplay";
import SettingsRunPanel from "./SettingsRunPanel";

interface IProps {
  selectedPanel: PanelName;

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

class RunTab extends React.Component<IProps> {

  public render() {
    const {selectedPanel, onSelectPanel} = this.props;

    return (
      <div className="page page--full flex-column">
        <div className="flex-row">
          <List className="display__toolbar"
                selected={selectedPanel}
                onSelect={onSelectPanel}>
            {panelOptions.map((options) => <Tool key={options.value} {...options}/>)}
          </List>
          <RunDisplay className="display__container"/>
        </div>
        <PanelContainer className="flex-1 display__panel-container"
                        icon={panelOptionsByKey[selectedPanel].icon}
                        title={panelOptionsByKey[selectedPanel].title}>
          {selectedPanel === PanelName.Signals ? <SignalsRunPanel/> : null}
          {selectedPanel === PanelName.Settings ? <SettingsRunPanel/> : null}
        </PanelContainer>
      </div>
    );
  }

  // public componentDidMount() {
  //   if (this.props.connected) {
  //     this.modifyProfile(0);
  //   }
  //   window.addEventListener("keydown", this.listenForEmergencyStop);
  //   const runBtn = document.getElementById("run-btn");
  //   if (runBtn !== null) {
  //     runBtn.addEventListener("mousedown", this.preventFocus);
  //   }
  //
  //   this.stopHeartbeat = SparkManager.onHeartbeat(this.receiveHeartbeat);
  // }
  //
  // public componentWillUnmount() {
  //   this.stopHeartbeat();
  //
  //   window.removeEventListener("keydown", this.listenForEmergencyStop);
  //   if (this.state.running) {
  //     SparkManager.disableHeartbeat(this.receiveHeartbeat);
  //   }
  //   const runBtn = document.getElementById("run-btn");
  //   if (runBtn !== null) {
  //     runBtn.removeEventListener("mousedown", this.preventFocus);
  //   }
  // }
  //
  // public componentDidUpdate(prevProps: Readonly<IProps>): void {
  //   if (prevProps.connected !== this.props.connected) {
  //     if (!this.props.connected && this.state.running) {
  //       this.stop();
  //     }
  //   }
  // }
  //
  // private updateProfile() {
  //   this.setState({updatingProfile: true});
  //   SparkManager.burnFlash(toDtoDeviceId(this.props.deviceId)).then(() => {
  //     setTimeout(() => {
  //       SparkManager.getConfigFromParams(toDtoDeviceId(this.props.deviceId)).then((values) => {
  //         this.props.setParameters(values);
  //         this.setState({updatingProfile: false});
  //       }).catch((error: any) => {
  //         console.log(error);
  //         this.setState({updatingProfile: false});
  //       });
  //     }, 1000);
  //   }).catch((error: any) => {
  //     this.setState({updatingProfile: false});
  //     console.log(error);
  //   });
  // }
  //
  // private updateGraph(event: any, error: any, response: any) {
  //   // this.state.option.series.data.push(0.1);
  //   this.forceUpdate();
  // }
  //
  // private modifyProfile(value: number) {
  //   const {currentParameters} = this.props;
  //
  //   if (value > 3) {
  //     value = 4;
  //   }
  //   if (value < 0) {
  //     value = 0;
  //   }
  //
  //   const p = getDeviceParamValueOrDefault(currentParameters, getProfileConfigParam(value, ProfileConfigParam.P));
  //   const i = getDeviceParamValueOrDefault(currentParameters, getProfileConfigParam(value, ProfileConfigParam.I));
  //   const d = getDeviceParamValueOrDefault(currentParameters, getProfileConfigParam(value, ProfileConfigParam.D));
  //   const f = getDeviceParamValueOrDefault(currentParameters, getProfileConfigParam(value, ProfileConfigParam.F));
  //
  //   this.setState({
  //     currentProfile: value,
  //     pStr: p + "" || 0.0 + "",
  //     iStr: i + "" || 0.0 + "",
  //     dStr: d + "" || 0.0 + "",
  //     fStr: f + "" || 0.0 + ""
  //   });
  // }
  //
  // private modifyP(value: number, valueStr: string) {
  //   const param = getProfileConfigParam(this.state.currentProfile, ProfileConfigParam.P);
  //   SparkManager.setAndGetParameter(toDtoDeviceId(this.props.deviceId), param, value).then((res: IServerResponse) => {
  //     this.props.setParameterResponse(param, res);
  //     if (parseFloat(res.responseValue as string) === parseFloat(valueStr)) {
  //       this.setState({pStr: valueStr});
  //     } else {
  //       this.setState({pStr: res.responseValue + ""})
  //     }
  //   });
  // }
  //
  // private modifyI(value: number, valueStr: string) {
  //   const param = getProfileConfigParam(this.state.currentProfile, ProfileConfigParam.I);
  //   SparkManager.setAndGetParameter(toDtoDeviceId(this.props.deviceId), param, value).then((res: IServerResponse) => {
  //     this.props.setParameterResponse(param, res);
  //     if (parseFloat(res.responseValue as string) === parseFloat(valueStr)) {
  //       this.setState({iStr: valueStr});
  //     } else {
  //       this.setState({iStr: res.responseValue + ""});
  //     }
  //   });
  // }
  //
  // private modifyD(value: number, valueStr: string) {
  //   const param = getProfileConfigParam(this.state.currentProfile, ProfileConfigParam.I);
  //   SparkManager.setAndGetParameter(toDtoDeviceId(this.props.deviceId), param, value).then((res: IServerResponse) => {
  //     this.props.setParameterResponse(param, res);
  //     if (parseFloat(res.responseValue as string) === parseFloat(valueStr)) {
  //       this.setState({dStr: valueStr});
  //     } else {
  //       this.setState({dStr: res.responseValue + ""});
  //     }
  //   });
  // }
  //
  // private modifyF(value: number, valueStr: string) {
  //   const param = getProfileConfigParam(this.state.currentProfile, ProfileConfigParam.F);
  //   SparkManager.setAndGetParameter(toDtoDeviceId(this.props.deviceId), param, value).then((res: IServerResponse) => {
  //     this.props.setParameterResponse(param, res);
  //     if (parseFloat(res.responseValue as string) === parseFloat(valueStr)) {
  //       this.setState({fStr: valueStr});
  //     } else {
  //       this.setState({fStr: res.responseValue + ""});
  //     }
  //   });
  // }
  //
  // private sanitizeValue(event: any) {
  //   const decimalValue: number = parseFloat(event.target.value);
  //   console.log(decimalValue);
  //   event.target.value = decimalValue;
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
  //
  // private listenForEmergencyStop(event: any) {
  //   if (this.state.running) {
  //     if (event.key === " " || event.key === "Enter") {
  //       console.log("Emergency stop was pressed.");
  //       this.stop();
  //     }
  //   }
  // }
  //
  // private preventFocus(event: any) {
  //   event.preventDefault();
  // }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    selectedPanel: queryDisplaySelectedPanel(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    onSelectPanel: (name: PanelName) => dispatch(setDisplaySelectedPanel(name)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RunTab);
