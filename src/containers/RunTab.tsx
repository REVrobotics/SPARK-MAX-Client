import {Button, FormGroup, NumericInput, Radio, RadioGroup, Slider} from "@blueprintjs/core";
import ReactEcharts from "echarts-for-react";
import "echarts/lib/chart/line";
import * as React from "react";
import {connect} from "react-redux";
import {IApplicationState} from "../store/types";
import SparkManager from "../managers/SparkManager";
import MotorConfiguration from "../models/MotorConfiguration";
import PIDFProfile from "../models/PIDFProfile";

interface IProps {
  connected: boolean,
  motorConfig: MotorConfiguration
}

interface IState {
  mode: string,
  option: any,
  output: number,
  running: boolean,
  currentProfile: number,
  pStr: string,
  iStr: string,
  dStr: string,
  fStr: string,
  updatingProfile: boolean
}

class RunTab extends React.Component<IProps, IState> {
  private _ticks: number;

  constructor(props: IProps) {
    super(props);

    this._ticks = 0;

    this.state = {
      mode: "Percent",
      option: {
        series: [{
          data: [],
          type: 'line'
        }],
        xAxis: {
          name: "Time",
          type: 'category',
          data: []
        },
        yAxis: {
          name: "Percent",
          type: 'value'
        }
      },
      output: 0,
      running: false,
      currentProfile: 0,
      pStr: "0.0",
      iStr: "0.0",
      dStr: "0.0",
      fStr: "0.0",
      updatingProfile: false
    };

    this.changeMode = this.changeMode.bind(this);
    this.changeOutput = this.changeOutput.bind(this);

    this.run = this.run.bind(this);
    this.stop = this.stop.bind(this);
    this.receiveHeartbeat = this.receiveHeartbeat.bind(this);

    this.updateProfile = this.updateProfile.bind(this);
    this.updateGraph = this.updateGraph.bind(this);

    this.modifyProfile = this.modifyProfile.bind(this);
    this.modifyP = this.modifyP.bind(this);
    this.modifyI = this.modifyI.bind(this);
    this.modifyD = this.modifyD.bind(this);
    this.modifyF = this.modifyF.bind(this);
    this.sanitizeValue = this.sanitizeValue.bind(this);

    this.listenForEmergencyStop = this.listenForEmergencyStop.bind(this);
  }

  public componentDidMount() {
    if (this.props.connected) {
      this.modifyProfile(0);
    }
    window.addEventListener("keydown", this.listenForEmergencyStop);
  }

  public componentWillUnmount() {
    window.removeEventListener("keydown", this.listenForEmergencyStop);
    if (this.state.running) {
      SparkManager.disableHeartbeat(this.receiveHeartbeat);
    }
  }

  public componentDidUpdate(prevProps: Readonly<IProps>): void {
    if (prevProps.connected !== this.props.connected) {
      if (!this.props.connected && this.state.running) {
        this.stop();
      }
    }
  }

  public render() {
    const {connected} = this.props;
    const {currentProfile, option, mode, output, running, pStr, iStr, dStr, fStr, updatingProfile} = this.state;

    const p = pStr;
    const i = iStr;
    const d = dStr;
    const f = fStr;

    return (
      <div className="graph">
        <ReactEcharts
          option={option}
          notMerge={true}
          lazyUpdate={true}
          className="echart-container"
        />
        <div className="form pid">
          <FormGroup
            label="PID Profile"
            className="form-group-fifth"
          >
            <NumericInput id="pid-profile" disabled={!this.props.connected} value={currentProfile} min={0} max={3} onValueChange={this.modifyProfile}/>
          </FormGroup>
          <FormGroup
            label="P"
            className="form-group-fifth"
          >
            <NumericInput id="pid-profile" disabled={!this.props.connected} value={p} min={0} step={0.001} max={3} onValueChange={this.modifyP} onBlur={this.sanitizeValue}/>
          </FormGroup>
          <FormGroup
            label="I"
            className="form-group-fifth"
          >
            <NumericInput id="pid-profile" disabled={!this.props.connected} value={i} min={0} step={0.001} max={3} onValueChange={this.modifyI} onBlur={this.sanitizeValue}/>
          </FormGroup>
          <FormGroup
            label="D"
            className="form-group-fifth"
          >
            <NumericInput id="pid-profile" disabled={!this.props.connected} value={d} min={0} step={0.001} max={3} onValueChange={this.modifyD} onBlur={this.sanitizeValue}/>
          </FormGroup>
          <FormGroup
            label="F"
            className="form-group-fifth"
          >
            <NumericInput id="pid-profile" disabled={!this.props.connected} value={f} min={0} step={0.001} max={3} onValueChange={this.modifyF} onBlur={this.sanitizeValue}/>
          </FormGroup>
        </div>
        <div className="form">
          <FormGroup
            labelFor="run-mode"
            className="form-group-quarter inline"
          >
            <RadioGroup
              label="Mode"
              selectedValue={mode}
              onChange={this.changeMode}
              disabled={true}
            >
              <Radio label="Percent" value={0}/>
              <Radio label="Velocity" value={1}/>
              <Radio label="Position" value={3}/>
            </RadioGroup>
          </FormGroup>
          <FormGroup
            label="Motor Output"
            className="form-group-half"
          >
            <Slider initialValue={output} disabled={!connected} value={output} min={-1.0} max={1.0} stepSize={0.01} onChange={this.changeOutput} />
          </FormGroup>
          <FormGroup
            className="form-group-quarter"
          >
            <Button className="rev-btn" fill={true} disabled={!connected} onClick={running ? this.stop : this.run}>{running ? "Stop" : "Run"}</Button>
          </FormGroup>
          <FormGroup
            className="form-group-quarter"
          >
            <Button className="rev-btn" fill={true} disabled={!connected} loading={updatingProfile} onClick={this.updateProfile}>Update PID</Button>
          </FormGroup>
        </div>
      </div>
    );
  }

  private updateProfile() {
    this.setState({updatingProfile: true});
    const profile: PIDFProfile = new PIDFProfile();
    profile.p = parseFloat(this.state.pStr);
    profile.i = parseFloat(this.state.iStr);
    profile.d = parseFloat(this.state.dStr);
    profile.f = parseFloat(this.state.fStr);
    this.props.motorConfig.controlProfiles[this.state.currentProfile] = profile;
    this.forceUpdate();
    SparkManager.setControlProfile(this.state.currentProfile, profile).then(() => {
      this.setState({updatingProfile: false});
    }).catch((error: any) => {
      console.log(error);
      this.setState({updatingProfile: false});
    });
  }

  private updateGraph(event: any, error: any, response: any) {
    // this.state.option.series.data.push(0.1);
    this.forceUpdate();
  }

  private modifyProfile(value: number) {
    if (value > 3) {
      value = 4;
    }
    if (value < 0) {
      value = 0;
    }
    this.setState({
      currentProfile: value,
      pStr: this.props.motorConfig.controlProfiles[value].p + "" || 0.0 + "",
      iStr: this.props.motorConfig.controlProfiles[value].i + "" || 0.0 + "",
      dStr: this.props.motorConfig.controlProfiles[value].d + "" || 0.0 + "",
      fStr: this.props.motorConfig.controlProfiles[value].f + "" || 0.0 + ""
    });
  }

  private modifyP(value: number, valueStr: string) {
    this.setState({pStr: valueStr});
  }

  private modifyI(value: number, valueStr: string) {
    this.setState({iStr: valueStr});
  }

  private modifyD(value: number, valueStr: string) {
    this.setState({dStr: valueStr});
  }

  private modifyF(value: number, valueStr: string) {
    this.setState({fStr: valueStr});
  }

  private sanitizeValue(event: any) {
    const decimalValue: number = parseFloat(event.target.value);
    if (decimalValue !== 0) {
      event.target.value = decimalValue;
    }
  }

  private run() {
    this.setState({running: true});
    SparkManager.enableHeartbeat(20, this.receiveHeartbeat);
  }

  private stop() {
    this.setState({running: false});
    SparkManager.disableHeartbeat(this.receiveHeartbeat);
  }

  private receiveHeartbeat(event: any, error: any, response: any) {
    // TODO - Eventually graph all of this.
    if (this._ticks > 50) {
      this._ticks = 0;
      this.setState({
        option: {
          series: [{
            data: [...this.state.option.series[0].data, this.state.output],
            type: 'line'
          }],
          xAxis: {
            name: "Time",
            type: 'category',
            data: [...this.state.option.xAxis.data, (this.state.option.xAxis.data.length + 1) + ""]
          },
          yAxis: {
            name: "Percent",
            type: 'value'
          }
        }
      });
    } else {
      this._ticks++;
    }
  }

  private changeMode(value: any) {
    let modeStr = "";
    if (value.currentTarget.value === 0) {
      modeStr = "Percent";
    } else if (value.currentTarget.value === 1) {
      modeStr = "Velocity";
    } else if (value.currentTarget.value === 2) {
      modeStr = "Position";
    }
    SparkManager.setControlMode(value.currentTarget.value);
    this.setState({
      mode: modeStr,
      option: {
        series: [{
          data: [],
          type: 'line'
        }],
        xAxis: {
          name: "Time",
          type: 'category',
          data: []
        },
        yAxis: {
          name: value.currentTarget.value,
          type: 'value'
        }
      }
    });
  }

  private changeOutput(value: number) {
    if (Math.abs(this.state.output - value) > 0.1) {
      if (this.state.output - value < 0) {
        value = this.state.output + 0.1;
      } else {
        value = this.state.output - 0.1;
      }
    }
    this.setState({output: value});
    if (value < 0) {
      SparkManager.setSetpoint(value * 1024);
    } else {
      SparkManager.setSetpoint(value * 1023);
    }
  }

  private listenForEmergencyStop(event: any) {
    if (this.state.running) {
      if (event.key === " " || event.key === "Enter") {
        console.log("Emergency stop was pressed.");
        this.setState({running: false});
      }
    }
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    connected: state.isConnected,
    motorConfig: state.currentConfig
  };
}

export default connect(mapStateToProps)(RunTab);