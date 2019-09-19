import {Alert, Button, FormGroup, NumericInput, Slider, Switch} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {MotorTypeSelect} from "../components/MotorTypeSelect";
import SparkManager, {IServerResponse} from "../managers/SparkManager";
import MotorConfiguration, {getFromID} from "../models/MotorConfiguration";
import {
  IApplicationState, SparkDispatch
} from "../store/types";
import {ConfigParam} from "../models/ConfigParam";
import PopoverHelp from "../components/PopoverHelp";
import {
  setSelectedDeviceMotorConfig,
  setSelectedDeviceBurnedMotorConfig,
  updateSelectedDeviceIsProcessing,
  updateSelectedDeviceProcessStatus
} from "../store/actions";
import {SensorTypeSelect} from "../components/SensorTypeSelect";
import Sensor, {getFromID as getSensorFromID} from "../models/Sensor";
import {ConfigurationSelect} from "../components/ConfigurationSelect";
import {
  getSelectedDeviceBurnedConfig,
  getSelectedDeviceMotorConfig, getSelectedDeviceParamResponses,
  isSelectedDeviceConnected
} from "../store/selectors";

interface IProps {
  connected: boolean,
  motorConfig: MotorConfiguration,
  burnedConfig: MotorConfiguration,
  paramResponses: IServerResponse[],
  setCurrentConfig(config: MotorConfiguration): void,
  setBurnedConfig(config: MotorConfiguration): void,
  updateConnectionStatus(connected: boolean, status: string): void,
  setIsConnecting(connecting: boolean): void,
}

interface IState {
  rampRateEnabled: boolean,
  updateRequested: boolean,
  savingConfig: boolean,
  restoringDefaults: boolean,
  restoreRequested: boolean,
}

class BasicTab extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      rampRateEnabled: this.props.motorConfig.rampRate > 0,
      savingConfig: false,
      updateRequested: false,
      restoringDefaults: false,
      restoreRequested: false
    };
    this.openConfirmModal = this.openConfirmModal.bind(this);
    this.closeConfirmModal = this.closeConfirmModal.bind(this);
    this.openRestoreWarnModal = this.openRestoreWarnModal.bind(this);
    this.closeRestoreWarnModal = this.closeRestoreWarnModal.bind(this);
    this.restoreDefaults = this.restoreDefaults.bind(this);

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

    this.updateConfiguration = this.updateConfiguration.bind(this);
  }

  public componentDidUpdate(prevProps: IProps) {
    if (this.props.motorConfig !== prevProps.motorConfig) {
      this.setState({rampRateEnabled: this.props.motorConfig.rampRate > 0});
    }
  }

  public render() {
    const {connected, motorConfig, burnedConfig} = this.props;
    const {rampRateEnabled, savingConfig, updateRequested, restoreRequested, restoringDefaults} = this.state;

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
        <Alert
          isOpen={updateRequested}
          cancelButtonText="Cancel"
          confirmButtonText="Yes, Update"
          intent="success"
          onCancel={this.closeConfirmModal}
          onClose={this.closeConfirmModal}
          onConfirm={this.updateConfiguration}
        >
          Are you sure you want to update the configuration of your SPARK controller to a {activeMotorType.name} motor?
        </Alert>
        <Alert isOpen={restoreRequested} cancelButtonText="Cancel" confirmButtonText="Yes" intent="warning" onCancel={this.closeRestoreWarnModal} onClose={this.closeRestoreWarnModal} onConfirm={this.restoreDefaults}>
          WARNING: You are about to restore the connected SPARK MAX controller to its factory default settings. Make sure to properly configure the controller before attempting to operate. Are you sure you want to proceed?
        </Alert>
        <div className="form form-left">
          <FormGroup
            label="Select Configuration"
            labelFor="configuration-id"
            className="form-group-half"
          >
            <ConfigurationSelect connected={connected}/>
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
              disabled={!connected}
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
              connected={connected}
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
              disabled={!connected}
              label={isCoastMode ? "Coast" : "Brake"}
              onChange={this.changeIdleMode}
            />
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!currentError} title={"Smart Current Limit"} content={`Your requested value of ${currentResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${currentResponse.responseValue}.`}/>}
            labelFor="advanced-current-limit"
            className={(currentModified ? "modified" : "") + " form-group-quarter"}
          >
            <NumericInput id="advanced-current-limit" disabled={!connected} value={currentLimit} onValueChange={this.changeCurrentLimit} min={0} className={currentError ? "field-error" : ""}/>
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
              connected={connected}
              onSensorSelect={this.changeSensorType}
              disabled={motorConfig.type === 1}
            />
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!encoderCprError} title={"Encoder CPR"} content={`Your requested value of ${encoderCprResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${encoderCprResponse.responseValue}.`}/>}
            labelFor="encoder-cpr"
            className={(encoderCprModified ? "modified" : "") + " form-group-quarter"}
          >
            <NumericInput
              id="encoder-cpr"
              value={encoderCpr}
              onValueChange={this.changeEncoderCpr}
              min={1}
              disabled={!connected || motorConfig.type === 1 || sensorType !== 2}
            />
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!deadbandError} title={"PWM Input Deadband"} content={`Your requested value of ${deadbandResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${deadbandResponse.responseValue}.`}/>}
            labelFor="advanced-deadband"
            className={(deadbandModified ? "modified" : "") + " form-group-half"}
          >
            <Slider initialValue={deadband} disabled={!connected} value={deadband} min={0} max={0.3} stepSize={0.01} onChange={this.changeDeadband} className={deadbandError ? "field-error" : ""}/>
          </FormGroup>
        </div>
        <div className="form form-top form-space-between">
          <div className="form-column form-column-third no-wrap">
            <h4 className="form-title">Limit Switch</h4>
            <div className="form-control-group">
              <Switch checked={forwardLimitHardEnabled} disabled={!connected} label="Forward Limit" className={forwardEnabledHardModified ? "modified" : ""} onChange={this.changeForwardLimitHardEnabled} />
              <Switch checked={forwardPolarity} disabled={!connected} label={forwardPolarity ? "Normally Closed" : "Normally Open"} className={forwardPolarityModified ? "modified" : ""} onChange={this.changeForwardPolarity} />
            </div>

            <div className="form-control-group">
              <Switch checked={reverseLimitHardEnabled} disabled={!connected} label="Reverse Limit" className={reverseEnabledHardModified ? "modified" : ""} onChange={this.changeReverseLimitHardEnabled} />
              <Switch checked={reversePolarity} disabled={!connected} label={reversePolarity ? "Normally Closed" : "Normally Open"} className={reversePolarityModified ? "modified" : ""} onChange={this.changeReversePolarity} />
            </div>
          </div>
          <div className="form-column form-column-third no-wrap">
            <h4 className="form-title">Soft Limits</h4>

            <FormGroup className="form-group-fit">
              <Switch checked={forwardLimitSoftEnabled} disabled={!connected} label="Forward Limit" className={forwardEnabledSoftModified ? "modified" : ""} onChange={this.changeForwardLimitSoftEnabled} />
            </FormGroup>
            <FormGroup
              label={<PopoverHelp enabled={!softLimitForwardError} title={"Forward Limit (value)"} content={`Your requested value of ${softLimitForwardResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${softLimitForwardResponse.responseValue}.`}/>}
              labelFor="advanced-current-limit"
              className={softLimitForwardModified ? "modified" : ""}
            >
              <NumericInput id="advanced-current-limit" disabled={!connected || !forwardLimitSoftEnabled} value={softLimitForward} onValueChange={this.changeForwardLimitSoftValue} min={0} className={softLimitForwardError ? "field-error" : ""}/>
            </FormGroup>

            <FormGroup className="form-group-fit">
              <Switch checked={reverseLimitSoftEnabled} disabled={!connected} label="Reverse Limit" className={reverseEnabledSoftModified ? "modified" : ""} onChange={this.changeReverseLimitSoftEnabled} />
            </FormGroup>
            <FormGroup
              label={<PopoverHelp enabled={!softLimitForwardError} title={"Reverse Limit (value)"} content={`Your requested value of ${softLimitReverseResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${softLimitReverseResponse.responseValue}.`}/>}
              labelFor="advanced-current-limit"
              className={softLimitReverseModified ? "modified" : ""}
            >
              <NumericInput id="advanced-current-limit" disabled={!connected || !reverseLimitSoftEnabled} value={softLimitReverse} onValueChange={this.changeReverseLimitSoftValue} min={0} className={softLimitReverseError ? "field-error" : ""}/>
            </FormGroup>
          </div>
          <div className="form-column form-column-third">
            <h4 className="form-title">Ramp Rate</h4>
            <FormGroup className="form-group-fit">
              <Switch checked={rampRateEnabled} disabled={!connected} label={rampRateEnabled ? "Enabled" : "Disabled"} onChange={this.changeRampRateEnabled} />
            </FormGroup>
            <FormGroup
              label={<PopoverHelp enabled={!rampError} title={"Rate (seconds to full speed)"} content={`Your requested value of ${rampResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${rampResponse.responseValue}.`}/>}
              labelFor="advanced-output-rate"
              className={rampModified ? "modified" : ""}
            >
              <NumericInput id="advanced-output-rate" value={rampRate} disabled={!rampRateEnabled} onFocus={this.provideDefault} onBlur={this.sanitizeValue} onValueChange={this.changeRampRate} min={0} max={1024} className={rampError ? "field-error" : ""}/>
            </FormGroup>
          </div>
        </div>
        <div className="form update-container">
          <Button className="rev-btn" disabled={!connected || restoringDefaults} loading={savingConfig} onClick={this.openConfirmModal}>Save Configuration</Button>
          <Button className="bad-btn" disabled={!connected || savingConfig} loading={restoringDefaults} onClick={this.openRestoreWarnModal}>Restore Factory Defaults</Button>
        </div>
      </div>
    );
  }

  public openConfirmModal() {
    this.setState({updateRequested: true});
  }

  public closeConfirmModal() {
    this.setState({updateRequested: false});
  }

  public openRestoreWarnModal() {
    this.setState({restoreRequested: true});
  }

  public closeRestoreWarnModal() {
    this.setState({restoreRequested: false});
  }

  public changeCanID(id: number) {
    SparkManager.setAndGetParameter(ConfigParam.kCanID, id).then((res: IServerResponse) => {
      this.props.motorConfig.canID = res.responseValue as number;
      this.props.paramResponses[ConfigParam.kCanID] = res;
      this.forceUpdate();
    });
  }

  public selectMotorType(motorType: MotorConfiguration) {
    SparkManager.setAndGetParameter(ConfigParam.kMotorType, motorType.type).then((res: IServerResponse) => {
      this.props.motorConfig.type = res.responseValue as number;
      if (this.props.motorConfig.type === 1) {
        SparkManager.setAndGetParameter(ConfigParam.kSensorType, 1).then((sensorRes: IServerResponse) => {
          this.props.motorConfig.sensorType = sensorRes.responseValue as number;
          this.props.paramResponses[ConfigParam.kSensorType] = sensorRes;
          this.forceUpdate();
        });
      }
      this.props.paramResponses[ConfigParam.kMotorType] = res;
      this.forceUpdate();
    });
  }

  public changeIdleMode() {
    const prevMode: number = this.props.motorConfig.idleMode;
    const newMode: number = prevMode === 0 ? 1 : 0;
    SparkManager.setAndGetParameter(ConfigParam.kIdleMode, newMode).then((res: IServerResponse) => {
      this.props.motorConfig.idleMode = res.responseValue as number;
      this.props.paramResponses[ConfigParam.kIdleMode] = res;
      this.forceUpdate();
    });
  }

  public changeSensorType(sensorType: Sensor) {
    SparkManager.setAndGetParameter(ConfigParam.kSensorType, sensorType.id).then((res: IServerResponse) => {
      this.props.motorConfig.sensorType = res.responseValue as number;
      this.props.paramResponses[ConfigParam.kSensorType] = res;
      this.forceUpdate();
    });
  }

  public changeEncoderCpr(encoderCpr: number) {
    SparkManager.setAndGetParameter(ConfigParam.kEncoderCountsPerRev, encoderCpr).then((res: IServerResponse) => {
      this.props.motorConfig.encoderCountsPerRevolution = res.responseValue as number;
      this.props.paramResponses[ConfigParam.kEncoderCountsPerRev] = res;
      this.forceUpdate();
    });
  }

  public changeDeadband(value: number) {
    SparkManager.setAndGetParameter(ConfigParam.kInputDeadband, value).then((res: IServerResponse) => {
      this.props.motorConfig.inputDeadband = res.responseValue as number;
      this.props.paramResponses[ConfigParam.kInputDeadband] = res;
      this.forceUpdate();
    });
  }

  public changeCurrentLimit(value: number) {
    SparkManager.setAndGetParameter(ConfigParam.kSmartCurrentStallLimit, value).then((res: IServerResponse) => {
      this.props.motorConfig.smartCurrentStallLimit = res.responseValue as number;
      this.props.paramResponses[ConfigParam.kSmartCurrentStallLimit] = res;
      this.forceUpdate();
    });
  }

  public changeForwardLimitHardEnabled() {
    const newValue: boolean = !this.props.motorConfig.hardLimitSwitchForwardEnabled;
    SparkManager.setAndGetParameter(ConfigParam.kHardLimitFwdEn, newValue ? 1 : 0).then((res: IServerResponse) => {
      this.props.motorConfig.hardLimitSwitchForwardEnabled = res.responseValue === 1;
      this.props.paramResponses[ConfigParam.kHardLimitFwdEn] = res;
      this.forceUpdate();
    });
  }

  public changeReverseLimitHardEnabled() {
    const newValue: boolean = !this.props.motorConfig.hardLimitSwitchReverseEnabled;
    SparkManager.setAndGetParameter(ConfigParam.kHardLimitRevEn, newValue ? 1 : 0).then((res: IServerResponse) => {
      this.props.motorConfig.hardLimitSwitchReverseEnabled = res.responseValue === 1;
      this.props.paramResponses[ConfigParam.kHardLimitRevEn] = res;
      this.forceUpdate();
    });
  }

  public changeForwardLimitSoftEnabled() {
    const newValue: boolean = !this.props.motorConfig.softLimitSwitchForwardEnabled;
    SparkManager.setAndGetParameter(ConfigParam.kSoftLimitFwdEn, newValue ? 1 : 0).then((res: IServerResponse) => {
      this.props.motorConfig.softLimitSwitchForwardEnabled = res.responseValue === 1;
      this.props.paramResponses[ConfigParam.kSoftLimitFwdEn] = res;
      this.forceUpdate();
    });
  }

  public changeReverseLimitSoftEnabled() {
    const newValue: boolean = !this.props.motorConfig.softLimitSwitchReverseEnabled;
    SparkManager.setAndGetParameter(ConfigParam.kSoftLimitRevEn, newValue ? 1 : 0).then((res: IServerResponse) => {
      this.props.motorConfig.softLimitSwitchReverseEnabled = res.responseValue === 1;
      this.props.paramResponses[ConfigParam.kSoftLimitRevEn] = res;
      this.forceUpdate();
    });
  }

  public changeForwardLimitSoftValue(value: number) {
    SparkManager.setAndGetParameter(ConfigParam.kSoftLimitFwd, value).then((res: IServerResponse) => {
      this.props.motorConfig.softLimitForward = res.responseValue as number;
      this.props.paramResponses[ConfigParam.kSoftLimitFwd] = res;
      this.forceUpdate();
    });
  }

  public changeReverseLimitSoftValue(value: number) {
    SparkManager.setAndGetParameter(ConfigParam.kSoftLimitRev, value).then((res: IServerResponse) => {
      this.props.motorConfig.softLimitReverse = res.responseValue as number;
      this.props.paramResponses[ConfigParam.kSoftLimitRev] = res;
      this.forceUpdate();
    });
  }

  public changeForwardPolarity() {
    const newValue: boolean = !this.props.motorConfig.limitSwitchForwardPolarity;
    SparkManager.setAndGetParameter(ConfigParam.kLimitSwitchFwdPolarity, newValue ? 1 : 0).then((res: IServerResponse) => {
      this.props.motorConfig.limitSwitchForwardPolarity = res.responseValue === 1;
      this.props.paramResponses[ConfigParam.kLimitSwitchFwdPolarity] = res;
      this.forceUpdate();
    });
  }

  public changeReversePolarity() {
    const newValue: boolean = !this.props.motorConfig.limitSwitchReversePolarity;
    SparkManager.setAndGetParameter(ConfigParam.kLimitSwitchRevPolarity, newValue ? 1 : 0).then((res: IServerResponse) => {
      this.props.motorConfig.limitSwitchReversePolarity = res.responseValue === 1;
      this.props.paramResponses[ConfigParam.kLimitSwitchRevPolarity] = res;
      this.forceUpdate();
    });
  }

  public changeRampRateEnabled() {
    const newEnabled: boolean = !this.state.rampRateEnabled;
    if (!newEnabled) {
      SparkManager.setAndGetParameter(ConfigParam.kRampRate, 0).then((res: IServerResponse) => {
        this.props.motorConfig.rampRate = res.responseValue as number;
        this.props.paramResponses[ConfigParam.kRampRate] = res;
        this.forceUpdate();
      });
    }
    this.setState({rampRateEnabled: newEnabled});
  }

  public changeRampRate(value: number) {
    SparkManager.setAndGetParameter(ConfigParam.kRampRate, value).then((res: IServerResponse) => {
      this.props.motorConfig.rampRate = (res.responseValue as number);
      this.props.paramResponses[ConfigParam.kRampRate] = res;
      this.forceUpdate();
    });
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

  private updateConfiguration() {
    this.setState({savingConfig: true});
    SparkManager.burnFlash().then(() => {
      setTimeout(() => {
        SparkManager.getConfigFromParams().then((config: MotorConfiguration) => {
          console.log(config);
          this.props.setCurrentConfig(config);
          this.props.setBurnedConfig(new MotorConfiguration(config.name, config.type).fromJSON(config.toJSON()));
          this.setState({savingConfig: false});
        }).catch((error: any) => {
          console.log(error);
          this.setState({savingConfig: false});
        });
      }, 1000);
    }).catch((error: any) => {
      this.setState({savingConfig: false});
      console.log(error);
    });
  }

  private restoreDefaults() {
    this.setState({restoringDefaults: true});
    this.props.setIsConnecting(true);
    this.props.updateConnectionStatus(false, "RESETTING...");
    SparkManager.restoreDefaults().then(() => {
      this.props.updateConnectionStatus(true, "GETTING PARAMETERS...");
      setTimeout(() => {
        SparkManager.getConfigFromParams().then((config: MotorConfiguration) => {
          this.props.setCurrentConfig(config);
          this.props.setBurnedConfig(new MotorConfiguration(config.name, config.type).fromJSON(config.toJSON()));
          this.setState({restoringDefaults: false});
          this.props.setIsConnecting(false);
          this.props.updateConnectionStatus(true, "CONNECTED");
        }).catch((error: any) => {
          console.log(error);
          this.props.setIsConnecting(false);
          this.props.updateConnectionStatus(true, "CONNECTED");
          this.setState({restoringDefaults: false});
        });
      }, 1000);
    }).catch((error: any) => {
      this.setState({restoringDefaults: false});
      this.props.setIsConnecting(false);
      this.props.updateConnectionStatus(true, "CONNECTED");
      console.log(error);
    })
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    connected: isSelectedDeviceConnected(state),
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BasicTab);