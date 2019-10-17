import {Button, FormGroup, NumericInput, Radio, RadioGroup, Slider} from "@blueprintjs/core";
import ReactEcharts from "echarts-for-react";
import "echarts/lib/chart/line";
import * as React from "react";
import {connect} from "react-redux";
import {
  DeviceId,
  toDtoDeviceId,
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
import {ChartjsWaveformEngine, createWaveformDisplay, DataSet, WaveformChart, WaveformScale} from "../display";

const engine = new ChartjsWaveformEngine();
const ChartJsDisplay = createWaveformDisplay(engine);
const dataSource1 = engine.createDataSource({});
const dataSource2 = engine.createDataSource({});

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
  two: boolean,
}

class RunTab extends React.Component<IProps, IState> {
  private _ticks: number;
  private stopHeartbeat: () => void;

  constructor(props: IProps) {
    super(props);

    this._ticks = 0;

    this.state = {
      mode: tt("lbl_percent"),
      option: {
        series: [{
          data: [],
          type: 'line'
        }],
        xAxis: {
          name: tt("lbl_time"),
          type: 'category',
          data: []
        },
        yAxis: {
          name: tt("lbl_percent"),
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
      updatingProfile: false,
      two: false,
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
    const {currentProfile, option, mode, output, running, pStr, iStr, dStr, fStr, updatingProfile, two} = this.state;

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

    const scale2 = two ?
      <WaveformScale id="axis-2"
                     autoScale={true}
                     min={0}
                     max={100}
                     suggestedMax={50}
                     color="blue"/>
      : null;
    const plot2 = two ?
      <DataSet scaleId="axis-2" dataSource={dataSource2} label="Plot 2" color="blue"/>
      : null;

    return (
      <div>
        {/* tslint:disable-next-line:jsx-no-lambda */}
        <button type="button" onClick={() => this.setState({two: !two})}>Show two plots</button>
        <ChartJsDisplay>
          <WaveformChart timeSpan={30}>
            <WaveformScale id="axis-1"
                           autoScale={true}
                           min={0}
                           max={100}
                           suggestedMax={50}
                           color="red"/>
            <DataSet scaleId="axis-1" dataSource={dataSource1} label="Plot 1" color="red"/>
          </WaveformChart>
          <WaveformChart timeSpan={40}>
            {scale2}
            {plot2}
          </WaveformChart>
        </ChartJsDisplay>
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
                                content={tt("msg_parameter_invalid_value", {
                                  requestValue: pRes && pRes.requestValue,
                                  responseValue: pRes && pRes.responseValue,
                                })}/>}
            className={(pMod ? "modified" : "") + " form-group-fifth"}
          >
            <NumericInput id="pid-profile" disabled={!connected} value={p} min={0} step={0.001} max={3}
                          onValueChange={this.modifyP} onBlur={this.sanitizeValue}
                          className={pErr ? "field-error" : ""}/>
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!iErr} title={"I"}
                                content={tt("msg_parameter_invalid_value", {
                                  requestValue: iRes && iRes.requestValue,
                                  responseValue: iRes && iRes.responseValue,
                                })}/>}
            className={(iMod ? "modified" : "") + " form-group-fifth"}
          >
            <NumericInput id="pid-profile" disabled={!connected} value={i} min={0} step={0.001} max={3}
                          onValueChange={this.modifyI} onBlur={this.sanitizeValue}
                          className={iErr ? "field-error" : ""}/>
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!dErr} title={"D"}
                                content={tt("msg_parameter_invalid_value", {
                                  requestValue: dRes && dRes.requestValue,
                                  responseValue: dRes && dRes.responseValue,
                                })}/>}
            className={(dMod ? "modified" : "") + " form-group-fifth"}
          >
            <NumericInput id="pid-profile" disabled={!connected} value={d} min={0} step={0.001} max={3}
                          onValueChange={this.modifyD} onBlur={this.sanitizeValue}
                          className={dErr ? "field-error" : ""}/>
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!fErr} title={"F"}
                                content={tt("msg_parameter_invalid_value", {
                                  requestValue: fRes && fRes.requestValue,
                                  responseValue: fRes && fRes.responseValue,
                                })}/>}
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
              <Radio label={tt("lbl_percent")} value={0}/>
              <Radio label={tt("lbl_velocity")} value={1}/>
              <Radio label={tt("lbl_position")} value={3}/>
            </RadioGroup>
          </FormGroup>
          <FormGroup
            label={tt("lbl_motor_output")}
            className="form-group-half"
          >
            <Slider initialValue={output} disabled={!connected} value={output} min={-1.0} max={1.0} stepSize={0.01}
                    onChange={this.changeOutput}/>
          </FormGroup>
          <FormGroup
            className="form-group-quarter"
          >
            <Button id="run-btn" className="rev-btn" fill={true} disabled={!connected}
                    onClick={running ? this.stop : this.run}>{running ? tt("lbl_stop") : tt("lbl_run")}</Button>
          </FormGroup>
          <FormGroup
            className="form-group-quarter"
          >
            <Button className="rev-btn" fill={true} disabled={!connected} loading={updatingProfile}
                    onClick={this.updateProfile}>{tt("lbl_save_pidf")}</Button>
          </FormGroup>
        </div>
      </div>
    );
  }

  private updateProfile() {
    this.setState({updatingProfile: true});
    SparkManager.burnFlash(toDtoDeviceId(this.props.deviceId)).then(() => {
      setTimeout(() => {
        SparkManager.getConfigFromParams(toDtoDeviceId(this.props.deviceId)).then((values) => {
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
    SparkManager.setAndGetParameter(toDtoDeviceId(this.props.deviceId), param, value).then((res: IServerResponse) => {
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
    SparkManager.setAndGetParameter(toDtoDeviceId(this.props.deviceId), param, value).then((res: IServerResponse) => {
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
    SparkManager.setAndGetParameter(toDtoDeviceId(this.props.deviceId), param, value).then((res: IServerResponse) => {
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
    SparkManager.setAndGetParameter(toDtoDeviceId(this.props.deviceId), param, value).then((res: IServerResponse) => {
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
            name: tt("lbl_time"),
            type: 'category',
            data: [...this.state.option.xAxis.data, (this.state.option.xAxis.data.length + 1) + ""]
          },
          yAxis: {
            name: tt("lbl_percent"),
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
      modeStr = tt("lbl_percent");
    } else if (value.currentTarget.value === 1) {
      modeStr = tt("lbl_velocity");
    } else if (value.currentTarget.value === 2) {
      modeStr = tt("lbl_position");
    }
    SparkManager.setControlMode(toDtoDeviceId(this.props.deviceId), value.currentTarget.value);
    this.setState({
      mode: modeStr,
      option: {
        series: [{
          data: [],
          type: 'line'
        }],
        xAxis: {
          name: tt("lbl_time"),
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
