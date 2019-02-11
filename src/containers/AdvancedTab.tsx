import {Alert, Button, FormGroup, NumericInput, Slider, Switch} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {MotorTypeSelect} from "../components/MotorTypeSelect";
import SparkManager, {IServerResponse} from "../managers/SparkManager";
import MotorConfiguration, {
  getFromID as getMotorFromID,
  REV_BRUSHED,
  REV_BRUSHLESS
} from "../models/MotorConfiguration";
import {
  ApplicationActions, IApplicationState, ISetBurnedMotorConfig, ISetIsConnecting,
  ISetMotorConfig, IUpdateConnectionStatus
} from "../store/types";
import Sensor, {getFromID as getSensorFromID} from "../models/Sensor";
import {SensorTypeSelect} from "../components/SensorTypeSelect";
import {ConfigParameter} from "../models/ConfigParameter";
import PopoverHelp from "../components/PopoverHelp";
import {Dispatch} from "redux";
import {setBurnedMotorConfig, setIsConnecting, setMotorConfig, updateConnectionStatus} from "../store/actions";

interface IProps {
  connected: boolean,
  motorConfig: MotorConfiguration,
  burnedConfig: MotorConfiguration,
  paramResponses: IServerResponse[],
  setCurrentConfig: (config: MotorConfiguration) => ISetMotorConfig,
  setBurnedConfig: (config: MotorConfiguration) => ISetBurnedMotorConfig,
  updateConnectionStatus: (connected: boolean, status: string) => IUpdateConnectionStatus,
  setIsConnecting: (connecting: boolean) => ISetIsConnecting,
}

interface IState {
  rampRateEnabled: boolean,
  savingConfig: boolean,
  updateRequested: boolean,
  restoringDefaults: boolean,
  restoreRequested: boolean,
}

class AdvancedTab extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      rampRateEnabled: false,
      savingConfig: false,
      updateRequested: false,
      restoringDefaults: false,
      restoreRequested: false
    };

    this.openConfirmModal = this.openConfirmModal.bind(this);
    this.openRestoreWarnModal = this.openRestoreWarnModal.bind(this);
    this.closeConfirmModal = this.closeConfirmModal.bind(this);
    this.closeRestoreWarnModal = this.closeRestoreWarnModal.bind(this);
    this.updateConfiguration = this.updateConfiguration.bind(this);
    this.restoreDefaults = this.restoreDefaults.bind(this);

    this.changeMotorType = this.changeMotorType.bind(this);
    this.changeSensorType = this.changeSensorType.bind(this);
    this.changeCanID = this.changeCanID.bind(this);
    this.changeCurrentLimit = this.changeCurrentLimit.bind(this);
    this.changeIdleMode = this.changeIdleMode.bind(this);
    this.changeDeadband = this.changeDeadband.bind(this);
    this.changeForwardLimitHardEnabled = this.changeForwardLimitHardEnabled.bind(this);
    this.changeReverseLimitHardEnabled = this.changeReverseLimitHardEnabled.bind(this);
    this.changeForwardLimitSoftEnabled = this.changeForwardLimitSoftEnabled.bind(this);
    this.changeReverseLimitSoftEnabled = this.changeReverseLimitSoftEnabled.bind(this);
    this.changeForwardPolarity = this.changeForwardPolarity.bind(this);
    this.changeReversePolarity = this.changeReversePolarity.bind(this);
    this.changeRampRateEnabled = this.changeRampRateEnabled.bind(this);
    this.changeRampRate = this.changeRampRate.bind(this);

    this.sanitizeValue = this.sanitizeValue.bind(this);
    this.provideDefault = this.provideDefault.bind(this);
  }

  public componentDidMount(): void {
    if (this.props.connected) {
      this.changeMotorType(this.props.motorConfig.type === 1 ? REV_BRUSHLESS : REV_BRUSHED);
    }
  }

  public componentDidUpdate(prevProps: Readonly<IProps>): void {
    if (prevProps.connected !== this.props.connected) {
      this.componentDidMount();
    }
  }

  public render() {
    const {connected, burnedConfig, motorConfig} = this.props;
    const {rampRateEnabled, savingConfig, updateRequested, restoreRequested, restoringDefaults} = this.state;
    const activeMotorType = getMotorFromID(motorConfig.type);
    const canID = motorConfig.canID;
    const currentLimit = motorConfig.smartCurrentStallLimit;
    const isCoastMode = motorConfig.idleMode === 0;
    const sensorType = motorConfig.sensorType;
    const deadband = motorConfig.inputDeadband;
    const rampRate = motorConfig.rampRate;
    const forwardLimitHardEnabled = motorConfig.hardLimitSwitchForwardEnabled;
    const reverseLimitHardEnabled = motorConfig.hardLimitSwitchReverseEnabled;
    const forwardLimitSoftEnabled = motorConfig.softLimitSwitchForwardEnabled;
    const reverseLimitSoftEnabled = motorConfig.softLimitSwitchReverseEnabled;
    const forwardPolarity = motorConfig.limitSwitchForwardPolarity;
    const reversePolarity = motorConfig.limitSwitchReversePolarity;

    // Motor Type
    const typeModified: boolean = motorConfig.type !== burnedConfig.type;

    // Can ID
    const canModified: boolean = motorConfig.canID !== burnedConfig.canID;
    const canResponse: IServerResponse = this.getParamResponse(ConfigParameter.kCanID);
    const canError: boolean = canResponse.status === 4;

    // Smart Current Limit
    const currentModified: boolean = motorConfig.smartCurrentStallLimit !== burnedConfig.smartCurrentStallLimit;
    const currentResponse: IServerResponse = this.getParamResponse(ConfigParameter.kSmartCurrentStallLimit);
    const currentError: boolean = currentResponse.status === 4;

    // Idle Mode
    const idleModified: boolean = motorConfig.idleMode !== burnedConfig.idleMode;

    // Motor Deadband
    const deadbandModified: boolean = motorConfig.inputDeadband.toFixed(4) !== burnedConfig.inputDeadband.toFixed(4);
    const deadbandResponse: IServerResponse = this.getParamResponse(ConfigParameter.kInputDeadband);
    const deadbandError: boolean = deadbandResponse.status === 4;

    // Sensor Type
    const sensorModified: boolean = motorConfig.sensorType !== burnedConfig.sensorType;

    // Forward Limit Switch
    const forwardEnabledHardModified: boolean = motorConfig.hardLimitSwitchForwardEnabled !== burnedConfig.hardLimitSwitchForwardEnabled;
    const forwardEnabledSoftModified: boolean = motorConfig.softLimitSwitchForwardEnabled !== burnedConfig.softLimitSwitchForwardEnabled;

    // Reverse Limit Switch
    const reverseEnabledHardModified: boolean = motorConfig.hardLimitSwitchReverseEnabled !== burnedConfig.hardLimitSwitchReverseEnabled;
    const reverseEnabledSoftModified: boolean = motorConfig.softLimitSwitchReverseEnabled !== burnedConfig.softLimitSwitchReverseEnabled;

    // Forward Polarity
    const forwardPolarityModified: boolean = motorConfig.limitSwitchForwardPolarity !== burnedConfig.limitSwitchForwardPolarity;

    // Reverse Polarity
    const reversePolarityModified: boolean = motorConfig.limitSwitchReversePolarity !== burnedConfig.limitSwitchReversePolarity;

    // Ramp Rate
    const rampModified: boolean = motorConfig.rampRate !== burnedConfig.rampRate;
    const rampResponse: IServerResponse = this.getParamResponse(ConfigParameter.kRampRate);
    const rampError: boolean = rampResponse.status === 4;

    return (
      <div className="advanced">
        <Alert isOpen={updateRequested} cancelButtonText="Cancel" confirmButtonText="Yes, Update" intent="success" onCancel={this.closeConfirmModal} onClose={this.closeConfirmModal} onConfirm={this.updateConfiguration}>
          Are you sure you want to update the configuration of your SPARK controller to a {activeMotorType.name} motor?
        </Alert>
        <Alert isOpen={restoreRequested} cancelButtonText="Cancel" confirmButtonText="Yes" intent="warning" onCancel={this.closeRestoreWarnModal} onClose={this.closeRestoreWarnModal} onConfirm={this.restoreDefaults}>
          WARNING: You are about to restore the connected SPARK MAX controller to its factory default settings. Make sure to properly configure the controller before attempting to operate. Are you sure you want to proceed?
        </Alert>
        <div className="form">
          <FormGroup
            label="Select Motor Type"
            labelFor="advanced-motor-type"
            className={(typeModified ? "modified" : "") + " form-group-half"}
          >
            <MotorTypeSelect
              activeConfig={activeMotorType}
              connected={connected}
              onMotorSelect={this.changeMotorType}
            />
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!canError} title={"CAN ID"} content={`Your requested value of ${canResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${canResponse.responseValue}.`}/>}
            labelFor="advanced-can-id"
            className={(canModified ? "modified" : "") + " form-group-quarter"}
          >
            <NumericInput id="advanced-can-id" disabled={!connected} value={canID} onValueChange={this.changeCanID} min={1} max={24} className={canError ? "field-error" : ""}/>
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!currentError} title={"Smart Current Limit"} content={`Your requested value of ${currentResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${currentResponse.responseValue}.`}/>}
            labelFor="advanced-current-limit"
            className={(currentModified ? "modified" : "") + " form-group-quarter"}
          >
            <NumericInput id="advanced-current-limit" disabled={!connected} value={currentLimit} onValueChange={this.changeCurrentLimit} min={0} className={currentError ? "field-error" : ""}/>
          </FormGroup>
        </div>
        <div className="form">
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
            label="Idle Mode"
            labelFor="advanced-idle-mode"
            className={(idleModified ? "modified" : "") + " form-group-quarter"}
          >
            <Switch checked={isCoastMode} disabled={!connected} label={isCoastMode ? "Coast" : "Brake"} onChange={this.changeIdleMode} />
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!deadbandError} title={"Motor Deadband"} content={`Your requested value of ${deadbandResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${deadbandResponse.responseValue}.`}/>}
            labelFor="advanced-deadband"
            className={(deadbandModified ? "modified" : "") + " form-group-half"}
          >
            <Slider initialValue={deadband} disabled={!connected} value={deadband} min={0} max={0.3} stepSize={0.01} onChange={this.changeDeadband} className={deadbandError ? "field-error" : ""}/>
          </FormGroup>
        </div>
        <div className="form">
          <FormGroup
            label="Forward Limit Switch (Hard)"
            labelFor="advanced-is-slave"
            className={(forwardEnabledHardModified ? "modified" : "") + " form-group-quarter"}
          >
            <Switch checked={forwardLimitHardEnabled} disabled={!connected} label={forwardLimitHardEnabled ? "Enabled" : "Disabled"} onChange={this.changeForwardLimitHardEnabled} />
          </FormGroup>
          <FormGroup
            label="Reverse Limit Switch (Hard)"
            labelFor="advanced-is-slave"
            className={(reverseEnabledHardModified ? "modified" : "") + " form-group-quarter"}
          >
            <Switch checked={reverseLimitHardEnabled} disabled={!connected} label={reverseLimitHardEnabled ? "Enabled" : "Disabled"} onChange={this.changeReverseLimitHardEnabled} />
          </FormGroup>
          <FormGroup
            label="Forward Limit Switch (Soft)"
            labelFor="advanced-is-slave"
            className={(forwardEnabledSoftModified ? "modified" : "") + " form-group-quarter"}
          >
            <Switch checked={forwardLimitSoftEnabled} disabled={!connected} label={forwardLimitSoftEnabled ? "Enabled" : "Disabled"} onChange={this.changeForwardLimitSoftEnabled} />
          </FormGroup>
          <FormGroup
            label="Reverse Limit Switch (Soft)"
            labelFor="advanced-is-slave"
            className={(reverseEnabledSoftModified ? "modified" : "") + " form-group-quarter"}
          >
            <Switch checked={reverseLimitSoftEnabled} disabled={!connected} label={reverseLimitSoftEnabled ? "Enabled" : "Disabled"} onChange={this.changeReverseLimitSoftEnabled} />
          </FormGroup>
        </div>
        <div className="form">
          <FormGroup
            label="Forward Limit Switch Polarity"
            labelFor="advanced-is-slave"
            className={(forwardPolarityModified ? "modified" : "") + " form-group-quarter"}
          >
            <Switch checked={forwardPolarity} disabled={!connected} label={forwardPolarity ? "Normally Open" : "Normally Closed"} onChange={this.changeForwardPolarity} />
          </FormGroup>
          <FormGroup
            label="Reverse Limit Switch Polarity"
            labelFor="advanced-is-slave"
            className={(reversePolarityModified ? "modified" : "") + " form-group-quarter"}
          >
            <Switch checked={reversePolarity} disabled={!connected} label={reversePolarity ? "Normally Open" : "Normally Closed"} onChange={this.changeReversePolarity} />
          </FormGroup>
          <FormGroup
            label="Ramp Rate"
            labelFor="advanced-output-limit"
            className="form-group-quarter"
          >
            <Switch checked={rampRateEnabled} disabled={!connected} label={rampRateEnabled ? "Enabled" : "Disabled"} onChange={this.changeRampRateEnabled} />
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!rampError} title={"Rate (seconds to full speed)"} content={`Your requested value of ${rampResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${rampResponse.responseValue}.`}/>}
            labelFor="advanced-output-rate"
            className={(rampModified ? "modified" : "") + " form-group-quarter"}
          >
            <NumericInput id="advanced-output-rate" value={rampRate} disabled={!rampRateEnabled} onFocus={this.provideDefault} onBlur={this.sanitizeValue} onValueChange={this.changeRampRate} min={0} max={1024} className={rampError ? "field-error" : ""}/>
          </FormGroup>
        </div>
        <div className="form">
          {/* 1/2 left */}
        </div>
        <div className="form update-container">
          <Button className="rev-btn" disabled={!connected || restoringDefaults} loading={savingConfig} onClick={this.openConfirmModal}>Save Configuration</Button>
          <Button className="bad-btn" disabled={!connected || savingConfig} loading={restoringDefaults} onClick={this.openRestoreWarnModal}>Restore Factory Defaults</Button>
        </div>
      </div>
    );
  }

  public changeCanID(id: number) {
    SparkManager.setAndGetParameter(ConfigParameter.kCanID, id).then((res: IServerResponse) => {
      this.props.motorConfig.canID = res.responseValue as number;
      this.props.paramResponses[ConfigParameter.kCanID] = res;
      this.forceUpdate();
    });
  }

  public changeCurrentLimit(value: number) {
    SparkManager.setAndGetParameter(ConfigParameter.kSmartCurrentStallLimit, value).then((res: IServerResponse) => {
      this.props.motorConfig.smartCurrentStallLimit = res.responseValue as number;
      this.props.paramResponses[ConfigParameter.kSmartCurrentStallLimit] = res;
      this.forceUpdate();
    });
  }

  public changeMotorType(motorType: MotorConfiguration) {
    SparkManager.setAndGetParameter(ConfigParameter.kMotorType, motorType.type).then((res: IServerResponse) => {
      this.props.motorConfig.type = res.responseValue as number;
      if (this.props.motorConfig.type === 1) {
        SparkManager.setAndGetParameter(ConfigParameter.kSensorType, 1).then((sensorRes: IServerResponse) => {
          this.props.motorConfig.sensorType = sensorRes.responseValue as number;
          this.props.paramResponses[ConfigParameter.kSensorType] = sensorRes;
          this.forceUpdate();
        });
      }
      this.props.paramResponses[ConfigParameter.kMotorType] = res;
      this.forceUpdate();
    });
  }

  public changeSensorType(sensorType: Sensor) {
    SparkManager.setAndGetParameter(ConfigParameter.kSensorType, sensorType.id).then((res: IServerResponse) => {
      this.props.motorConfig.sensorType = res.responseValue as number;
      this.props.paramResponses[ConfigParameter.kSensorType] = res;
      this.forceUpdate();
    });
  }

  public changeIdleMode() {
    const prevMode: number = this.props.motorConfig.idleMode;
    const newMode: number = prevMode === 0 ? 1 : 0;
    SparkManager.setAndGetParameter(ConfigParameter.kIdleMode, newMode).then((res: IServerResponse) => {
      this.props.motorConfig.idleMode = res.responseValue as number;
      this.props.paramResponses[ConfigParameter.kIdleMode] = res;
      this.forceUpdate();
    });
  }

  public changeDeadband(value: number) {
    SparkManager.setAndGetParameter(ConfigParameter.kInputDeadband, value).then((res: IServerResponse) => {
      this.props.motorConfig.inputDeadband = res.responseValue as number;
      this.props.paramResponses[ConfigParameter.kInputDeadband] = res;
      this.forceUpdate();
    });
  }

  public changeForwardLimitHardEnabled() {
    const newValue: boolean = !this.props.motorConfig.hardLimitSwitchForwardEnabled;
    SparkManager.setAndGetParameter(ConfigParameter.kHardLimitFwdEn, newValue ? 1 : 0).then((res: IServerResponse) => {
      this.props.motorConfig.hardLimitSwitchForwardEnabled = res.responseValue === 1;
      this.props.paramResponses[ConfigParameter.kHardLimitFwdEn] = res;
      this.forceUpdate();
    });
  }

  public changeReverseLimitHardEnabled() {
    const newValue: boolean = !this.props.motorConfig.hardLimitSwitchReverseEnabled;
    SparkManager.setAndGetParameter(ConfigParameter.kHardLimitRevEn, newValue ? 1 : 0).then((res: IServerResponse) => {
      this.props.motorConfig.hardLimitSwitchReverseEnabled = res.responseValue === 1;
      this.props.paramResponses[ConfigParameter.kHardLimitRevEn] = res;
      this.forceUpdate();
    });
  }

  public changeForwardLimitSoftEnabled() {
    const newValue: boolean = !this.props.motorConfig.softLimitSwitchForwardEnabled;
    SparkManager.setAndGetParameter(ConfigParameter.kSoftLimitFwdEn, newValue ? 1 : 0).then((res: IServerResponse) => {
      this.props.motorConfig.softLimitSwitchForwardEnabled = res.responseValue === 1;
      this.props.paramResponses[ConfigParameter.kSoftLimitFwdEn] = res;
      this.forceUpdate();
    });
  }

  public changeReverseLimitSoftEnabled() {
    const newValue: boolean = !this.props.motorConfig.softLimitSwitchReverseEnabled;
    SparkManager.setAndGetParameter(ConfigParameter.kSoftLimitRevEn, newValue ? 1 : 0).then((res: IServerResponse) => {
      this.props.motorConfig.softLimitSwitchReverseEnabled = res.responseValue === 1;
      this.props.paramResponses[ConfigParameter.kSoftLimitRevEn] = res;
      this.forceUpdate();
    });
  }

  public changeForwardPolarity() {
    const newValue: boolean = !this.props.motorConfig.limitSwitchForwardPolarity;
    SparkManager.setAndGetParameter(ConfigParameter.kLimitSwitchFwdPolarity, newValue ? 1 : 0).then((res: IServerResponse) => {
      this.props.motorConfig.limitSwitchForwardPolarity = res.responseValue === 1;
      this.props.paramResponses[ConfigParameter.kLimitSwitchFwdPolarity] = res;
      this.forceUpdate();
    });
  }

  public changeReversePolarity() {
    const newValue: boolean = !this.props.motorConfig.limitSwitchReversePolarity;
    SparkManager.setAndGetParameter(ConfigParameter.kLimitSwitchRevPolarity, newValue ? 1 : 0).then((res: IServerResponse) => {
      this.props.motorConfig.limitSwitchReversePolarity = res.responseValue === 1;
      this.props.paramResponses[ConfigParameter.kLimitSwitchRevPolarity] = res;
      this.forceUpdate();
    });
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

  public changeRampRateEnabled() {
    const newEnabled: boolean = !this.state.rampRateEnabled;
    if (!newEnabled) {
      SparkManager.setAndGetParameter(ConfigParameter.kRampRate, 0).then((res: IServerResponse) => {
        this.props.motorConfig.rampRate = res.responseValue as number;
        this.props.paramResponses[ConfigParameter.kRampRate] = res;
        this.forceUpdate();
      });
    }
    this.setState({rampRateEnabled: newEnabled});
  }

  public changeRampRate(value: number) {
    SparkManager.setAndGetParameter(ConfigParameter.kRampRate, value).then((res: IServerResponse) => {
      this.props.motorConfig.rampRate = (res.responseValue as number);
      this.props.paramResponses[ConfigParameter.kRampRate] = res;
      this.forceUpdate();
    });
  }

  private updateConfiguration() {
    this.setState({savingConfig: true});
    SparkManager.burnFlash().then(() => {
      setTimeout(() => {
        SparkManager.getConfigFromParams().then((config: MotorConfiguration) => {
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
    connected: state.isConnected,
    motorConfig: state.currentConfig,
    burnedConfig: state.burnedConfig,
    paramResponses: state.paramResponses
  };
}

export function mapDispatchToProps(dispatch: Dispatch<ApplicationActions>) {
  return {
    setCurrentConfig: (config: MotorConfiguration) => dispatch(setMotorConfig(config)),
    setBurnedConfig: (config: MotorConfiguration) => dispatch(setBurnedMotorConfig(config)),
    setIsConnecting: (connecting: boolean) => dispatch(setIsConnecting(connecting)),
    updateConnectionStatus: (connected: boolean, status: string) => dispatch(updateConnectionStatus(connected, status)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdvancedTab);