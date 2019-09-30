import {Button, FormGroup, NumericInput, Radio, RadioGroup, Slider} from "@blueprintjs/core";
import ReactEcharts from "echarts-for-react";
import "echarts/lib/chart/line";
import * as React from "react";
import {connect} from "react-redux";
import {
  DeviceId,
  fromDeviceId,
  getProfileConfigParam,
  IApplicationState,
  IDeviceParameterState,
  ProfileConfigParam
} from "../store/state";
import SparkManager, {IServerResponse} from "../managers/SparkManager";
import {
  setSelectedDeviceParameterResponse,
  setSelectedDeviceParameters,
  SparkDispatch
} from "../store/actions";
import PopoverHelp from "../components/PopoverHelp";
import {
  querySelectedDeviceBurnedConfig,
  querySelectedDeviceCurrentConfig,
  querySelectedDeviceId,
  queryIsSelectedDeviceConnected
} from "../store/selectors";
import {
  getDeviceBurnedParamOrDefault,
  getDeviceParamOrDefault,
  getDeviceParamValueOrDefault
} from "../store/param-rules/config-param-helpers";
import {ConfigParam} from "../models/ConfigParam";

interface IProps {
  deviceId: DeviceId,
  currentParameters: IDeviceParameterState[],
  burnedParameters: number[],
  connected: boolean,

  setParameters(parameters: number[]): void;
  setParameterResponse(param: ConfigParam, response: IServerResponse): void;
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
  private stopHeartbeat: () => void;

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

    this.stopHeartbeat = SparkManager.onHeartbeat(this.receiveHeartbeat);
  }

  public componentWillUnmount() {
    this.stopHeartbeat();

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
    const {currentParameters, burnedParameters, connected} = this.props;
    const {currentProfile, option, mode, output, running, pStr, iStr, dStr, fStr, updatingProfile} = this.state;

    const p = pStr;
    const i = iStr;
    const d = dStr;
    const f = fStr;

    const pParam = getProfileConfigParam(currentProfile, ProfileConfigParam.P);
    const iParam = getProfileConfigParam(currentProfile, ProfileConfigParam.I);
    const dParam = getProfileConfigParam(currentProfile, ProfileConfigParam.D);
    const fParam = getProfileConfigParam(currentProfile, ProfileConfigParam.F);

    const currentP = getDeviceParamOrDefault(currentParameters, pParam);
    const currentI = getDeviceParamOrDefault(currentParameters, iParam);
    const currentD = getDeviceParamOrDefault(currentParameters, dParam);
    const currentF = getDeviceParamOrDefault(currentParameters, fParam);

    const burnedP = getDeviceBurnedParamOrDefault(burnedParameters, pParam);
    const burnedI = getDeviceBurnedParamOrDefault(burnedParameters, iParam);
    const burnedD = getDeviceBurnedParamOrDefault(burnedParameters, dParam);
    const burnedF = getDeviceBurnedParamOrDefault(burnedParameters, fParam);

    const pMod: boolean = currentP.value !== burnedP;
    const pRes = currentP.lastResponse;
    const pErr: boolean = pRes && pRes.status === 4 || false;

    const iMod: boolean = currentI.value !== burnedI;
    const iRes = currentI.lastResponse;
    const iErr: boolean = iRes && iRes.status === 4 || false;

    const dMod: boolean = currentD.value !== burnedD;
    const dRes = currentD.lastResponse;
    const dErr: boolean = dRes && dRes.status === 4 || false;

    const fMod: boolean = currentF.value !== burnedF;
    const fRes = currentF.lastResponse;
    const fErr: boolean = fRes && fRes.status === 4 || false;

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
            <NumericInput id="pid-profile" disabled={!connected} value={currentProfile} min={0} max={3}
                          onValueChange={this.modifyProfile}/>
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!pErr} title={"P"}
                                content={`Your requested value of ${pRes && pRes.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${pRes && pRes.responseValue}.`}/>}
            className={(pMod ? "modified" : "") + " form-group-fifth"}
          >
            <NumericInput id="pid-profile" disabled={!connected} value={p} min={0} step={0.001} max={3}
                          onValueChange={this.modifyP} onBlur={this.sanitizeValue}
                          className={pErr ? "field-error" : ""}/>
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!iErr} title={"I"}
                                content={`Your requested value of ${iRes && iRes.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${iRes && iRes.responseValue}.`}/>}
            className={(iMod ? "modified" : "") + " form-group-fifth"}
          >
            <NumericInput id="pid-profile" disabled={!connected} value={i} min={0} step={0.001} max={3}
                          onValueChange={this.modifyI} onBlur={this.sanitizeValue}
                          className={iErr ? "field-error" : ""}/>
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!dErr} title={"D"}
                                content={`Your requested value of ${dRes && dRes.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${dRes && dRes.responseValue}.`}/>}
            className={(dMod ? "modified" : "") + " form-group-fifth"}
          >
            <NumericInput id="pid-profile" disabled={!connected} value={d} min={0} step={0.001} max={3}
                          onValueChange={this.modifyD} onBlur={this.sanitizeValue}
                          className={dErr ? "field-error" : ""}/>
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!fErr} title={"F"}
                                content={`Your requested value of ${fRes && fRes.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${fRes && fRes.responseValue}.`}/>}
            className={(fMod ? "modified" : "") + " form-group-fifth"}
          >
            <NumericInput id="pid-profile" disabled={!connected} value={f} min={0} step={0.001} max={3}
                          onValueChange={this.modifyF} onBlur={this.sanitizeValue}
                          className={fErr ? "field-error" : ""}/>
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
            <Slider initialValue={output} disabled={!connected} value={output} min={-1.0} max={1.0} stepSize={0.01}
                    onChange={this.changeOutput}/>
          </FormGroup>
          <FormGroup
            className="form-group-quarter"
          >
            <Button id="run-btn" className="rev-btn" fill={true} disabled={!connected}
                    onClick={running ? this.stop : this.run}>{running ? "Stop" : "Run"}</Button>
          </FormGroup>
          <FormGroup
            className="form-group-quarter"
          >
            <Button className="rev-btn" fill={true} disabled={!connected} loading={updatingProfile}
                    onClick={this.updateProfile}>Save PIDF</Button>
          </FormGroup>
        </div>
      </div>
    );
  }

  private updateProfile() {
    this.setState({updatingProfile: true});
    SparkManager.burnFlash(fromDeviceId(this.props.deviceId)).then(() => {
      setTimeout(() => {
        SparkManager.getConfigFromParams(fromDeviceId(this.props.deviceId)).then((values) => {
          this.props.setParameters(values);
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
    const {currentParameters} = this.props;

    if (value > 3) {
      value = 4;
    }
    if (value < 0) {
      value = 0;
    }

    const p = getDeviceParamValueOrDefault(currentParameters, getProfileConfigParam(value, ProfileConfigParam.P));
    const i = getDeviceParamValueOrDefault(currentParameters, getProfileConfigParam(value, ProfileConfigParam.I));
    const d = getDeviceParamValueOrDefault(currentParameters, getProfileConfigParam(value, ProfileConfigParam.D));
    const f = getDeviceParamValueOrDefault(currentParameters, getProfileConfigParam(value, ProfileConfigParam.F));

    this.setState({
      currentProfile: value,
      pStr: p + "" || 0.0 + "",
      iStr: i + "" || 0.0 + "",
      dStr: d + "" || 0.0 + "",
      fStr: f + "" || 0.0 + ""
    });
  }

  private modifyP(value: number, valueStr: string) {
    const param = getProfileConfigParam(this.state.currentProfile, ProfileConfigParam.P);
    SparkManager.setAndGetParameter(fromDeviceId(this.props.deviceId), param, value).then((res: IServerResponse) => {
      this.props.setParameterResponse(param, res);
      if (parseFloat(res.responseValue as string) === parseFloat(valueStr)) {
        this.setState({pStr: valueStr});
      } else {
        this.setState({pStr: res.responseValue + ""})
      }
    });
  }

  private modifyI(value: number, valueStr: string) {
    const param = getProfileConfigParam(this.state.currentProfile, ProfileConfigParam.I);
    SparkManager.setAndGetParameter(fromDeviceId(this.props.deviceId), param, value).then((res: IServerResponse) => {
      this.props.setParameterResponse(param, res);
      if (parseFloat(res.responseValue as string) === parseFloat(valueStr)) {
        this.setState({iStr: valueStr});
      } else {
        this.setState({iStr: res.responseValue + ""});
      }
    });
  }

  private modifyD(value: number, valueStr: string) {
    const param = getProfileConfigParam(this.state.currentProfile, ProfileConfigParam.I);
    SparkManager.setAndGetParameter(fromDeviceId(this.props.deviceId), param, value).then((res: IServerResponse) => {
      this.props.setParameterResponse(param, res);
      if (parseFloat(res.responseValue as string) === parseFloat(valueStr)) {
        this.setState({dStr: valueStr});
      } else {
        this.setState({dStr: res.responseValue + ""});
      }
    });
  }

  private modifyF(value: number, valueStr: string) {
    const param = getProfileConfigParam(this.state.currentProfile, ProfileConfigParam.F);
    SparkManager.setAndGetParameter(fromDeviceId(this.props.deviceId), param, value).then((res: IServerResponse) => {
      this.props.setParameterResponse(param, res);
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
    SparkManager.enableHeartbeat(20);
    SparkManager.setSetpoint(0.0);
  }

  private stop() {
    this.setState({running: false});
    SparkManager.disableHeartbeat(this.receiveHeartbeat);
  }

  private receiveHeartbeat() {
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
}

export function mapStateToProps(state: IApplicationState) {
  return {
    deviceId: querySelectedDeviceId(state),
    currentParameters: querySelectedDeviceCurrentConfig(state),
    burnedParameters: querySelectedDeviceBurnedConfig(state),
    connected: queryIsSelectedDeviceConnected(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    setParameters: (values: number[]) => dispatch(setSelectedDeviceParameters(values)),
    setParameterResponse: (param: ConfigParam, response: IServerResponse) =>
      dispatch(setSelectedDeviceParameterResponse(param, response)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RunTab);