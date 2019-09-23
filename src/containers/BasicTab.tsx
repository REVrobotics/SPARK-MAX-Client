import {Button, FormGroup, NumericInput, Slider, Switch} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {MotorTypeSelect} from "../components/MotorTypeSelect";
import {IServerResponse} from "../managers/SparkManager";
import MotorConfiguration, {getFromID} from "../models/MotorConfiguration";
import {IApplicationState, ProcessType} from "../store/state";
import {ConfigParam} from "../models/ConfigParam";
import PopoverHelp from "../components/PopoverHelp";
import {
  burnSelectedDeviceConfiguration,
  resetSelectedDeviceConfiguration,
  setSelectedDeviceBooleanParameter,
  setSelectedDeviceBurnedMotorConfig,
  setSelectedDeviceMotorConfig,
  setSelectedDeviceNumberParameter, SparkDispatch,
  updateSelectedDeviceIsProcessing,
  updateSelectedDeviceProcessStatus
} from "../store/actions";
import {SensorTypeSelect} from "../components/SensorTypeSelect";
import Sensor, {getFromID as getSensorFromID} from "../models/Sensor";
import {ConfigurationSelect} from "../components/ConfigurationSelect";
import {
  getSelectedDeviceBurnedConfig,
  getSelectedDeviceMotorConfig,
  getSelectedDeviceParamResponses,
  getSelectedDeviceProcessType, isSelectedDeviceConnected,
  isSelectedDeviceInProcessing
} from "../store/selectors";

interface IProps {
  enabled: boolean,
  processType?: ProcessType,
  motorConfig: MotorConfiguration,
  burnedConfig: MotorConfiguration,
  paramResponses: IServerResponse[],

  setCurrentConfig(config: MotorConfiguration): void,

  setBurnedConfig(config: MotorConfiguration): void,

  updateConnectionStatus(connected: boolean, status: string): void,

  setIsConnecting(connecting: boolean): void,

  burnConfiguration(): void;

  resetConfiguration(): void;

  setBooleanParameter(motorField: keyof MotorConfiguration, param: ConfigParam, value: boolean): Promise<boolean>;

  setNumberParameter(motorField: keyof MotorConfiguration, param: ConfigParam, value: number): Promise<number>;
}

interface IState {
  rampRateEnabled: boolean,
}

class BasicTab extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      rampRateEnabled: this.props.motorConfig.rampRate > 0,
    };

    this.selectMotorType = this.selectMotorType.bind(this);
    this.changeCanID = this.changeCanID.bind(this);
    this.changeIdleMode = this.changeIdleMode.bind(this);
    this.changeCurrentLimit = this.changeCurrentLimit.bind(this);

    this.changeForwardLimitHardEnabled = this.changeForwardLimitHardEnabled.bind(this);
    this.changeReverseLimitHardEnabled = this.changeReverseLimitHardEnabled.bind(this);
    this.changeForwardLimitSoftEnabled = this.changeForwardLimitSoftEnabled.bind(this);
    this.changeReverseLimitSoftEnabled = this.changeReverseLimitSoftEnabled.bind(this);
    this.changeForwardLimitSoftValue = this.changeForwardLimitSoftValue.bind(this);
    this.changeReverseLimitSoftValue = this.changeReverseLimitSoftValue.bind(this);
    this.changeForwardPolarity = this.changeForwardPolarity.bind(this);
    this.changeReversePolarity = this.changeReversePolarity.bind(this);
    this.changeRampRateEnabled = this.changeRampRateEnabled.bind(this);
    this.changeRampRate = this.changeRampRate.bind(this);

    this.changeSensorType = this.changeSensorType.bind(this);
    this.changeEncoderCpr = this.changeEncoderCpr.bind(this);
    this.changeDeadband = this.changeDeadband.bind(this);

    this.sanitizeValue = this.sanitizeValue.bind(this);
    this.provideDefault = this.provideDefault.bind(this);
  }

  public componentDidUpdate(prevProps: IProps) {
    if (this.props.motorConfig !== prevProps.motorConfig) {
      this.setState({rampRateEnabled: this.props.motorConfig.rampRate > 0});
    }
  }

  public render() {
    const {enabled, motorConfig, burnedConfig, processType} = this.props;
    const {rampRateEnabled} = this.state;

    const activeMotorType = getFromID(motorConfig.type);
    const canID = motorConfig.canID;
    const currentLimit = motorConfig.smartCurrentStallLimit;
    const isCoastMode = motorConfig.idleMode === 0;
    const sensorType = motorConfig.sensorType;
    const encoderCpr = motorConfig.encoderCountsPerRevolution;
    const deadband = motorConfig.inputDeadband;
    const forwardLimitHardEnabled = motorConfig.hardLimitSwitchForwardEnabled;
    const reverseLimitHardEnabled = motorConfig.hardLimitSwitchReverseEnabled;
    const forwardLimitSoftEnabled = motorConfig.softLimitSwitchForwardEnabled;
    const reverseLimitSoftEnabled = motorConfig.softLimitSwitchReverseEnabled;
    const forwardPolarity = motorConfig.limitSwitchForwardPolarity;
    const reversePolarity = motorConfig.limitSwitchReversePolarity;
    const softLimitForward = motorConfig.softLimitForward;
    const softLimitReverse = motorConfig.softLimitReverse;
    const rampRate = motorConfig.rampRate;

    // Motor Type
    const typeModified: boolean = motorConfig.type !== burnedConfig.type;

    // CAN ID
    const canModified: boolean = motorConfig.canID !== burnedConfig.canID;
    const canResponse: IServerResponse = this.getParamResponse(ConfigParam.kCanID);
    const canResponseError: boolean = canResponse.status === 4;
    const canIs0: boolean = !canResponseError && canID === 0;
    const canError = canResponseError || canIs0;
    const canErrorText = canResponseError && `Your requested value of ${canResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${canResponse.responseValue}.`
      || canIs0 && "For proper operation of the SPARK MAX, please change all SPARK MAX CAN IDs from 0 to any unused ID from 1 to 62."
      || "";

    // Idle Mode
    const idleModified: boolean = motorConfig.idleMode !== burnedConfig.idleMode;

    // Sensor Type
    const sensorModified: boolean = motorConfig.sensorType !== burnedConfig.sensorType;

    // Encoder CPR
    const encoderCprModified: boolean = motorConfig.encoderCountsPerRevolution !== burnedConfig.encoderCountsPerRevolution;
    const encoderCprResponse: IServerResponse = this.getParamResponse(ConfigParam.kEncoderCountsPerRev);
    const encoderCprError: boolean = encoderCprResponse.status === 4;

    // Motor Deadband
    const deadbandModified: boolean = motorConfig.inputDeadband.toFixed(4) !== burnedConfig.inputDeadband.toFixed(4);
    const deadbandResponse: IServerResponse = this.getParamResponse(ConfigParam.kInputDeadband);
    const deadbandError: boolean = deadbandResponse.status === 4;

    // Smart Current Limit
    const currentModified: boolean = motorConfig.smartCurrentStallLimit !== burnedConfig.smartCurrentStallLimit;
    const currentResponse: IServerResponse = this.getParamResponse(ConfigParam.kSmartCurrentStallLimit);
    const currentError: boolean = currentResponse.status === 4;

    // Forward Limit Switch
    const forwardEnabledHardModified: boolean = motorConfig.hardLimitSwitchForwardEnabled !== burnedConfig.hardLimitSwitchForwardEnabled;

    // Reverse Limit Switch
    const reverseEnabledHardModified: boolean = motorConfig.hardLimitSwitchReverseEnabled !== burnedConfig.hardLimitSwitchReverseEnabled;

    // Forward Limit Switch
    const forwardEnabledSoftModified: boolean = motorConfig.softLimitSwitchForwardEnabled !== burnedConfig.softLimitSwitchForwardEnabled;

    // Reverse Limit Switch
    const reverseEnabledSoftModified: boolean = motorConfig.softLimitSwitchReverseEnabled !== burnedConfig.softLimitSwitchReverseEnabled;

    // Forward Polarity
    const forwardPolarityModified: boolean = motorConfig.limitSwitchForwardPolarity !== burnedConfig.limitSwitchForwardPolarity;

    // Reverse Polarity
    const reversePolarityModified: boolean = motorConfig.limitSwitchReversePolarity !== burnedConfig.limitSwitchReversePolarity;

    // Ramp Rate
    const rampModified: boolean = motorConfig.rampRate !== burnedConfig.rampRate;
    const rampResponse: IServerResponse = this.getParamResponse(ConfigParam.kRampRate);
    const rampError: boolean = rampResponse.status === 4;

    // Soft Forward Limit
    const softLimitForwardModified: boolean = motorConfig.softLimitForward !== burnedConfig.softLimitForward;
    const softLimitForwardResponse: IServerResponse = this.getParamResponse(ConfigParam.kSoftLimitFwd);
    const softLimitForwardError: boolean = softLimitForwardResponse.status === 4;

    // Soft Reverse Limit
    const softLimitReverseModified: boolean = motorConfig.softLimitReverse !== burnedConfig.softLimitReverse;
    const softLimitReverseResponse: IServerResponse = this.getParamResponse(ConfigParam.kSoftLimitRev);
    const softLimitReverseError: boolean = softLimitReverseResponse.status === 4;

    return (
      <div>
        <div className="form form-left">
          <FormGroup
            label="Select Configuration"
            labelFor="configuration-id"
            className="form-group-half"
          >
            <ConfigurationSelect disabled={!enabled}/>
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!canError} title={"CAN ID"} content={canErrorText}/>}
            labelFor="basic-can-id"
            className={(canModified ? "modified" : "") + " form-group-quarter"}
          >
            <NumericInput
              id="basic-can-id"
              value={canID}
              onValueChange={this.changeCanID}
              min={1}
              max={62}
              disabled={!enabled}
              className={canError ? "field-error" : ""}
            />
          </FormGroup>
        </div>
        <div className="form">
          <FormGroup
            label="Select Motor Type"
            labelFor="basic-motor-type"
            className={(typeModified ? "modified" : "") + " form-group-half"}
          >
            <MotorTypeSelect
              activeConfig={activeMotorType}
              disabled={!enabled}
              onMotorSelect={this.selectMotorType}
            />
          </FormGroup>
          <FormGroup
            label="Idle Mode"
            labelFor="basic-idle-mode"
            className={(idleModified ? "modified" : "") + " form-group-quarter"}
          >
            <Switch
              checked={isCoastMode}
              disabled={!enabled}
              label={isCoastMode ? "Coast" : "Brake"}
              onChange={this.changeIdleMode}
            />
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!currentError} title={"Smart Current Limit"}
                                content={`Your requested value of ${currentResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${currentResponse.responseValue}.`}/>}
            labelFor="advanced-current-limit"
            className={(currentModified ? "modified" : "") + " form-group-quarter"}
          >
            <NumericInput id="advanced-current-limit" disabled={!enabled} value={currentLimit}
                          onValueChange={this.changeCurrentLimit} min={0}
                          className={currentError ? "field-error" : ""}/>
          </FormGroup>
        </div>
        <div className="form form-space-between">
          <FormGroup
            label="Sensor Type"
            labelFor="advanced-motor-type"
            className={(sensorModified ? "modified" : "") + " form-group-quarter"}
          >
            <SensorTypeSelect
              activeSensor={getSensorFromID(sensorType)}
              onSensorSelect={this.changeSensorType}
              disabled={!enabled || motorConfig.type === 1}
            />
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!encoderCprError} title={"Encoder CPR"}
                                content={`Your requested value of ${encoderCprResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${encoderCprResponse.responseValue}.`}/>}
            labelFor="encoder-cpr"
            className={(encoderCprModified ? "modified" : "") + " form-group-quarter"}
          >
            <NumericInput
              id="encoder-cpr"
              value={encoderCpr}
              onValueChange={this.changeEncoderCpr}
              min={1}
              disabled={!enabled || motorConfig.type === 1 || sensorType !== 2}
            />
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!deadbandError} title={"PWM Input Deadband"}
                                content={`Your requested value of ${deadbandResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${deadbandResponse.responseValue}.`}/>}
            labelFor="advanced-deadband"
            className={(deadbandModified ? "modified" : "") + " form-group-half"}
          >
            <Slider initialValue={deadband} disabled={!enabled} value={deadband} min={0} max={0.3} stepSize={0.01}
                    onChange={this.changeDeadband} className={deadbandError ? "field-error" : ""}/>
          </FormGroup>
        </div>
        <div className="form form-top form-space-between">
          <div className="form-column form-column-third no-wrap">
            <h4 className="form-title">Limit Switch</h4>
            <div className="form-control-group">
              <Switch checked={forwardLimitHardEnabled} disabled={!enabled} label="Forward Limit"
                      className={forwardEnabledHardModified ? "modified" : ""}
                      onChange={this.changeForwardLimitHardEnabled}/>
              <Switch checked={forwardPolarity} disabled={!enabled}
                      label={forwardPolarity ? "Normally Closed" : "Normally Open"}
                      className={forwardPolarityModified ? "modified" : ""} onChange={this.changeForwardPolarity}/>
            </div>

            <div className="form-control-group">
              <Switch checked={reverseLimitHardEnabled} disabled={!enabled} label="Reverse Limit"
                      className={reverseEnabledHardModified ? "modified" : ""}
                      onChange={this.changeReverseLimitHardEnabled}/>
              <Switch checked={reversePolarity} disabled={!enabled}
                      label={reversePolarity ? "Normally Closed" : "Normally Open"}
                      className={reversePolarityModified ? "modified" : ""} onChange={this.changeReversePolarity}/>
            </div>
          </div>
          <div className="form-column form-column-third no-wrap">
            <h4 className="form-title">Soft Limits</h4>

            <FormGroup className="form-group-fit">
              <Switch checked={forwardLimitSoftEnabled} disabled={!enabled} label="Forward Limit"
                      className={forwardEnabledSoftModified ? "modified" : ""}
                      onChange={this.changeForwardLimitSoftEnabled}/>
            </FormGroup>
            <FormGroup
              label={<PopoverHelp enabled={!softLimitForwardError} title={"Forward Limit (value)"}
                                  content={`Your requested value of ${softLimitForwardResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${softLimitForwardResponse.responseValue}.`}/>}
              labelFor="advanced-current-limit"
              className={softLimitForwardModified ? "modified" : ""}
            >
              <NumericInput id="advanced-current-limit" disabled={!enabled || !forwardLimitSoftEnabled}
                            value={softLimitForward} onValueChange={this.changeForwardLimitSoftValue} min={0}
                            className={softLimitForwardError ? "field-error" : ""}/>
            </FormGroup>

            <FormGroup className="form-group-fit">
              <Switch checked={reverseLimitSoftEnabled} disabled={!enabled} label="Reverse Limit"
                      className={reverseEnabledSoftModified ? "modified" : ""}
                      onChange={this.changeReverseLimitSoftEnabled}/>
            </FormGroup>
            <FormGroup
              label={<PopoverHelp enabled={!softLimitForwardError} title={"Reverse Limit (value)"}
                                  content={`Your requested value of ${softLimitReverseResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${softLimitReverseResponse.responseValue}.`}/>}
              labelFor="advanced-current-limit"
              className={softLimitReverseModified ? "modified" : ""}
            >
              <NumericInput id="advanced-current-limit" disabled={!enabled || !reverseLimitSoftEnabled}
                            value={softLimitReverse} onValueChange={this.changeReverseLimitSoftValue} min={0}
                            className={softLimitReverseError ? "field-error" : ""}/>
            </FormGroup>
          </div>
          <div className="form-column form-column-third">
            <h4 className="form-title">Ramp Rate</h4>
            <FormGroup className="form-group-fit">
              <Switch checked={rampRateEnabled} disabled={!enabled} label={rampRateEnabled ? "Enabled" : "Disabled"}
                      onChange={this.changeRampRateEnabled}/>
            </FormGroup>
            <FormGroup
              label={<PopoverHelp enabled={!rampError} title={"Rate (seconds to full speed)"}
                                  content={`Your requested value of ${rampResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${rampResponse.responseValue}.`}/>}
              labelFor="advanced-output-rate"
              className={rampModified ? "modified" : ""}
            >
              <NumericInput id="advanced-output-rate" value={rampRate} disabled={!rampRateEnabled}
                            onFocus={this.provideDefault} onBlur={this.sanitizeValue}
                            onValueChange={this.changeRampRate} min={0} max={1024}
                            className={rampError ? "field-error" : ""}/>
            </FormGroup>
          </div>
        </div>
        <div className="form update-container">
          <Button className="rev-btn"
                  disabled={!enabled || processType === ProcessType.Reset}
                  loading={processType === ProcessType.Save}
                  onClick={this.props.burnConfiguration}>Save Configuration</Button>
          <Button className="bad-btn"
                  disabled={!enabled || processType === ProcessType.Save}
                  loading={processType === ProcessType.Reset}
                  onClick={this.props.resetConfiguration}>Restore Factory Defaults</Button>
        </div>
      </div>
    );
  }

  public changeCanID(id: number) {
    this.props.setNumberParameter("canID", ConfigParam.kCanID, id);
  }

  public selectMotorType(motorType: MotorConfiguration) {
    this.props.setNumberParameter("type", ConfigParam.kMotorType, motorType.type)
      .then((type) => {
        if (type === 1) {
          return this.props.setNumberParameter("sensorType", ConfigParam.kSensorType, 1);
        } else {
          return Promise.resolve(0);
        }
      });
  }

  public changeIdleMode() {
    const prevMode: number = this.props.motorConfig.idleMode;
    const newMode: number = prevMode === 0 ? 1 : 0;
    this.props.setNumberParameter('idleMode', ConfigParam.kIdleMode, newMode);
  }

  public changeSensorType(sensorType: Sensor) {
    this.props.setNumberParameter('sensorType', ConfigParam.kSensorType, sensorType.id);
  }

  public changeEncoderCpr(encoderCpr: number) {
    this.props.setNumberParameter('encoderCountsPerRevolution', ConfigParam.kEncoderCountsPerRev, encoderCpr);
  }

  public changeDeadband(value: number) {
    this.props.setNumberParameter('inputDeadband', ConfigParam.kInputDeadband, value);
  }

  public changeCurrentLimit(value: number) {
    this.props.setNumberParameter('smartCurrentStallLimit', ConfigParam.kSmartCurrentStallLimit, value);
  }

  public changeForwardLimitHardEnabled() {
    const newValue: boolean = !this.props.motorConfig.hardLimitSwitchForwardEnabled;
    this.props.setNumberParameter("hardLimitSwitchForwardEnabled", ConfigParam.kHardLimitFwdEn, newValue ? 1 : 0);
  }

  public changeReverseLimitHardEnabled() {
    const newValue: boolean = !this.props.motorConfig.hardLimitSwitchReverseEnabled;
    this.props.setBooleanParameter("hardLimitSwitchReverseEnabled", ConfigParam.kHardLimitRevEn, newValue);
  }

  public changeForwardLimitSoftEnabled() {
    const newValue: boolean = !this.props.motorConfig.softLimitSwitchForwardEnabled;
    this.props.setBooleanParameter("softLimitSwitchForwardEnabled", ConfigParam.kSoftLimitFwdEn, newValue);
  }

  public changeReverseLimitSoftEnabled() {
    const newValue: boolean = !this.props.motorConfig.softLimitSwitchReverseEnabled;
    this.props.setBooleanParameter("softLimitSwitchReverseEnabled", ConfigParam.kSoftLimitRevEn, newValue);
  }

  public changeForwardLimitSoftValue(value: number) {
    this.props.setNumberParameter("softLimitForward", ConfigParam.kSoftLimitFwd, value);
  }

  public changeReverseLimitSoftValue(value: number) {
    this.props.setNumberParameter("softLimitReverse", ConfigParam.kSoftLimitRev, value);
  }

  public changeForwardPolarity() {
    const newValue: boolean = !this.props.motorConfig.limitSwitchForwardPolarity;
    this.props.setBooleanParameter("limitSwitchForwardPolarity", ConfigParam.kLimitSwitchFwdPolarity, newValue);
  }

  public changeReversePolarity() {
    const newValue: boolean = !this.props.motorConfig.limitSwitchReversePolarity;
    this.props.setBooleanParameter("limitSwitchReversePolarity", ConfigParam.kLimitSwitchRevPolarity, newValue);
  }

  public changeRampRateEnabled() {
    const newEnabled: boolean = !this.state.rampRateEnabled;
    if (!newEnabled) {
      this.props.setNumberParameter("rampRate", ConfigParam.kRampRate, 0);
    }
    this.setState({rampRateEnabled: newEnabled});
  }

  public changeRampRate(value: number) {
    this.props.setNumberParameter("rampRate", ConfigParam.kRampRate, value);
  }

  private sanitizeValue(event: any) {
    const decimalValue: number = parseFloat(event.target.value);
    if (decimalValue !== 0) {
      event.target.value = decimalValue;
    }
  }

  private provideDefault(event: any) {
    const decimalValue: number = parseFloat(event.target.value);
    if (decimalValue === 0) {
      event.target.value = "0.0";
    }
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
    enabled: isSelectedDeviceConnected(state) && !isSelectedDeviceInProcessing(state),
    processType: getSelectedDeviceProcessType(state),
    motorConfig: getSelectedDeviceMotorConfig(state),
    burnedConfig: getSelectedDeviceBurnedConfig(state),
    paramResponses: getSelectedDeviceParamResponses(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    setCurrentConfig: (config: MotorConfiguration) => dispatch(setSelectedDeviceMotorConfig(config)),
    setBurnedConfig: (config: MotorConfiguration) => dispatch(setSelectedDeviceBurnedMotorConfig(config)),
    setIsConnecting: (connecting: boolean) => dispatch(updateSelectedDeviceIsProcessing(connecting)),
    updateConnectionStatus: (connected: boolean, status: string) =>
      dispatch(updateSelectedDeviceProcessStatus(connected, status)),
    burnConfiguration: () => dispatch(burnSelectedDeviceConfiguration()),
    resetConfiguration: () => dispatch(resetSelectedDeviceConfiguration()),
    setBooleanParameter: (motorField: keyof MotorConfiguration, param: ConfigParam, value: boolean) =>
      dispatch(setSelectedDeviceBooleanParameter(motorField, param, value)),
    setNumberParameter: (motorField: keyof MotorConfiguration, param: ConfigParam, value: number) =>
      dispatch(setSelectedDeviceNumberParameter(motorField, param, value)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BasicTab);