import {Button, FormGroup, NumericInput, Radio, RadioGroup, Slider} from "@blueprintjs/core";
import ReactEcharts from "echarts-for-react";
import "echarts/lib/chart/line";
import * as React from "react";
import {connect} from "react-redux";
import {DeviceId, IApplicationState, SparkDispatch} from "../store/types";
import SparkManager, {IServerResponse} from "../managers/SparkManager";
import MotorConfiguration from "../models/MotorConfiguration";
import {
  setSelectedDeviceBurnedMotorConfig,
  setSelectedDeviceMotorConfig
} from "../store/actions";
import PopoverHelp from "../components/PopoverHelp";
import {
  getSelectedDeviceBurnedConfig, getSelectedDeviceId,
  getSelectedDeviceMotorConfig, getSelectedDeviceParamResponses,
  isSelectedDeviceConnected
} from "../store/selectors";
import {fromDeviceId} from "../store/reducer";

interface IProps {
  deviceId: DeviceId,
  connected: boolean,
  motorConfig: MotorConfiguration,
  burnedConfig: MotorConfiguration,
  paramResponses: IServerResponse[],
  setCurrentConfig(config: MotorConfiguration): void,
  setBurnedConfig(config: MotorConfiguration): void
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
    this.preventFocus = this.preventFocus.bind(this);
  }

  public componentDidMount() {
    if (this.props.connected) {
      this.modifyProfile(0);
    }
    window.addEventListener("keydown", this.listenForEmergencyStop);
    const runBtn = document.getElementById("run-btn");
    if (runBtn !== null) {
      runBtn.addEventListener("mousedown", this.preventFocus);
    }
  }

  public componentWillUnmount() {
    window.removeEventListener("keydown", this.listenForEmergencyStop);
    if (this.state.running) {
      SparkManager.disableHeartbeat(this.receiveHeartbeat);
    }
    const runBtn = document.getElementById("run-btn");
    if (runBtn !== null) {
      runBtn.removeEventListener("mousedown", this.preventFocus);
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
    const {burnedConfig, connected, motorConfig} = this.props;
    const {currentProfile, option, mode, output, running, pStr, iStr, dStr, fStr, updatingProfile} = this.state;

    const p = pStr;
    const i = iStr;
    const d = dStr;
    const f = fStr;
    const paramStart = 13 + (currentProfile * 8);

    const pMod: boolean = motorConfig.controlProfiles[currentProfile].p !== burnedConfig.controlProfiles[currentProfile].p;
    const pRes: IServerResponse = this.getParamResponse(paramStart);
    const pErr: boolean = pRes.status === 4;

    const iMod: boolean = motorConfig.controlProfiles[currentProfile].i !== burnedConfig.controlProfiles[currentProfile].i;
    const iRes: IServerResponse = this.getParamResponse(paramStart + 1);
    const iErr: boolean = iRes.status === 4;

    const dMod: boolean = motorConfig.controlProfiles[currentProfile].d !== burnedConfig.controlProfiles[currentProfile].d;
    const dRes: IServerResponse = this.getParamResponse(paramStart + 2);
    const dErr: boolean = dRes.status === 4;

    const fMod: boolean = motorConfig.controlProfiles[currentProfile].f !== burnedConfig.controlProfiles[currentProfile].f;
    const fRes: IServerResponse = this.getParamResponse(paramStart + 3);
    const fErr: boolean = fRes.status === 4;

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
            <NumericInput id="pid-profile" disabled={!connected} value={currentProfile} min={0} max={3} onValueChange={this.modifyProfile}/>
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!pErr} title={"P"} content={`Your requested value of ${pRes.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${pRes.responseValue}.`}/>}
            className={(pMod ? "modified" : "") + " form-group-fifth"}
          >
            <NumericInput id="pid-profile" disabled={!connected} value={p} min={0} step={0.001} max={3} onValueChange={this.modifyP} onBlur={this.sanitizeValue} className={pErr ? "field-error" : ""}/>
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!iErr} title={"I"} content={`Your requested value of ${iRes.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${iRes.responseValue}.`}/>}
            className={(iMod ? "modified" : "") + " form-group-fifth"}
          >
            <NumericInput id="pid-profile" disabled={!connected} value={i} min={0} step={0.001} max={3} onValueChange={this.modifyI} onBlur={this.sanitizeValue} className={iErr ? "field-error" : ""}/>
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!dErr} title={"D"} content={`Your requested value of ${dRes.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${dRes.responseValue}.`}/>}
            className={(dMod ? "modified" : "") + " form-group-fifth"}
          >
            <NumericInput id="pid-profile" disabled={!connected} value={d} min={0} step={0.001} max={3} onValueChange={this.modifyD} onBlur={this.sanitizeValue} className={dErr ? "field-error" : ""}/>
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!fErr} title={"F"} content={`Your requested value of ${fRes.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${fRes.responseValue}.`}/>}
            className={(fMod ? "modified" : "") + " form-group-fifth"}
          >
            <NumericInput id="pid-profile" disabled={!connected} value={f} min={0} step={0.001} max={3} onValueChange={this.modifyF} onBlur={this.sanitizeValue} className={fErr ? "field-error" : ""}/>
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
            <Button id="run-btn" className="rev-btn" fill={true} disabled={!connected} onClick={running ? this.stop : this.run}>{running ? "Stop" : "Run"}</Button>
          </FormGroup>
          <FormGroup
            className="form-group-quarter"
          >
            <Button className="rev-btn" fill={true} disabled={!connected} loading={updatingProfile} onClick={this.updateProfile}>Save PIDF</Button>
          </FormGroup>
        </div>
      </div>
    );
  }

  private updateProfile() {
    this.setState({updatingProfile: true});
    SparkManager.burnFlash(fromDeviceId(this.props.deviceId)).then(() => {
      setTimeout(() => {
        SparkManager.getConfigFromParams(fromDeviceId(this.props.deviceId)).then((config: MotorConfiguration) => {
          this.props.setCurrentConfig(config);
          this.props.setBurnedConfig(new MotorConfiguration(config.name, config.type).fromJSON(config.toJSON()));
          this.setState({updatingProfile: false});
        }).catch((error: any) => {
          console.log(error);
          this.setState({updatingProfile: false});
        });
      }, 1000);
    }).catch((error: any) => {
      this.setState({updatingProfile: false});
      console.log(error);
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
    const paramStart: number = 13 + (this.state.currentProfile * 8);
    SparkManager.setAndGetParameter(fromDeviceId(this.props.deviceId), paramStart, value).then((res: IServerResponse) => {
      this.props.motorConfig.controlProfiles[this.state.currentProfile].p = res.responseValue as number;
      this.props.paramResponses[paramStart] = res;
      console.log(res);
      if (parseFloat(res.responseValue as string) === parseFloat(valueStr)) {
        this.setState({pStr: valueStr});
      } else {
        this.setState({pStr: res.responseValue + ""})
      }
    });
  }

  private modifyI(value: number, valueStr: string) {
    const paramStart: number = 13 + (this.state.currentProfile * 8);
    SparkManager.setAndGetParameter(fromDeviceId(this.props.deviceId), paramStart + 1, value).then((res: IServerResponse) => {
      this.props.motorConfig.controlProfiles[this.state.currentProfile].i = res.responseValue as number;
      this.props.paramResponses[paramStart + 1] = res;
      if (parseFloat(res.responseValue as string) === parseFloat(valueStr)) {
        this.setState({iStr: valueStr});
      } else {
        this.setState({iStr: res.responseValue + ""});
      }
    });
  }

  private modifyD(value: number, valueStr: string) {
    const paramStart: number = 13 + (this.state.currentProfile * 8);
    SparkManager.setAndGetParameter(fromDeviceId(this.props.deviceId), paramStart + 2, value).then((res: IServerResponse) => {
      this.props.motorConfig.controlProfiles[this.state.currentProfile].d = res.responseValue as number;
      this.props.paramResponses[paramStart + 2] = res;
      if (parseFloat(res.responseValue as string) === parseFloat(valueStr)) {
        this.setState({dStr: valueStr});
      } else {
        this.setState({dStr: res.responseValue + ""});
      }
    });
  }

  private modifyF(value: number, valueStr: string) {
    const paramStart: number = 13 + (this.state.currentProfile * 8);
    SparkManager.setAndGetParameter(fromDeviceId(this.props.deviceId), paramStart + 3, value).then((res: IServerResponse) => {
      this.props.motorConfig.controlProfiles[this.state.currentProfile].f = res.responseValue as number;
      this.props.paramResponses[paramStart + 3] = res;
      if (parseFloat(res.responseValue as string) === parseFloat(valueStr)) {
        this.setState({fStr: valueStr});
      } else {
        this.setState({fStr: res.responseValue + ""});
      }
    });
  }

  private sanitizeValue(event: any) {
    const decimalValue: number = parseFloat(event.target.value);
    console.log(decimalValue);
    event.target.value = decimalValue;
  }

  private run() {
    this.setState({running: true, output: 0.0});
    SparkManager.enableHeartbeat(20, this.receiveHeartbeat);
    SparkManager.setSetpoint(0.0);
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
    SparkManager.setControlMode(fromDeviceId(this.props.deviceId), value.currentTarget.value);
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
        this.stop();
      }
    }
  }

  private preventFocus(event: any) {
    event.preventDefault();
  }

  private getParamResponse(id: number): IServerResponse {
    if (typeof this.props.paramResponses[id] !== "undefined") {
      return this.props.paramResponses[id];
    } else {
      return {requestValue: "", responseValue: "", status: 0, type: 0};
    }
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    deviceId: getSelectedDeviceId(state),
    connected: isSelectedDeviceConnected(state),
    motorConfig: getSelectedDeviceMotorConfig(state),
    burnedConfig: getSelectedDeviceBurnedConfig(state),
    paramResponses: getSelectedDeviceParamResponses(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    setCurrentConfig: (config: MotorConfiguration) => dispatch(setSelectedDeviceMotorConfig(config)),
    setBurnedConfig: (config: MotorConfiguration) => dispatch(setSelectedDeviceBurnedMotorConfig(config))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RunTab);