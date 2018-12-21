import {Alert, Button, FormGroup, NumericInput, Slider, Switch} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {MotorTypeSelect} from "../components/MotorTypeSelect";
import SparkManager from "../managers/SparkManager";
import MotorConfiguration, {REV_BRUSHLESS} from "../models/MotorConfiguration";
import {IApplicationState} from "../store/types";

interface IProps {
  connected: boolean,
  motorConfig: MotorConfiguration
}

interface IState {
  activeMotorType: MotorConfiguration,
  inputRampLimit: number,
  currentLimitEnabled: boolean,
  currentProfile: number,
  currentSetpoint: number,
  currentChopEnabled: boolean,
  outputRampLimit: number,
  rampRateEnabled: boolean,
  positionProfile: number,
  positionSetpoint: number,
  savingConfig: boolean,
  slaveMode: boolean,
  updateRequested: boolean,
  velocityProfile: number,
  velocitySetpoint: number,
}

class AdvancedTab extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      activeMotorType: REV_BRUSHLESS,
      currentLimitEnabled: false,
      currentProfile: 0,
      currentSetpoint: 0,
      inputRampLimit: 0,
      currentChopEnabled: false,
      outputRampLimit: 0,
      rampRateEnabled: false,
      positionProfile: 0,
      positionSetpoint: 0,
      savingConfig: false,
      slaveMode: false,
      updateRequested: false,
      velocityProfile: 0,
      velocitySetpoint: 0
    };

    this.openConfirmModal = this.openConfirmModal.bind(this);
    this.closeConfirmModal = this.closeConfirmModal.bind(this);

    this.changeMotorType = this.changeMotorType.bind(this);
    this.changeCanID = this.changeCanID.bind(this);
    this.changeCurrentLimitEnabled = this.changeCurrentLimitEnabled.bind(this);
    this.changeIdleMode = this.changeIdleMode.bind(this);
    this.changeCurrentLimit = this.changeCurrentLimit.bind(this);
    this.changeDeadband = this.changeDeadband.bind(this);
    this.changeSlaveMode = this.changeSlaveMode.bind(this);
    this.changeMasterID = this.changeMasterID.bind(this);
    this.changeOutputLimitEnabled = this.changeOutputLimitEnabled.bind(this);
    this.changeOutputLimitRate = this.changeOutputLimitRate.bind(this);
    this.changeCurrentChopEnabled = this.changeCurrentChopEnabled.bind(this);
    this.changeCurrentChop = this.changeCurrentChop.bind(this);
  }

  public componentDidMount(): void {
    console.log(this.props.motorConfig);
  }

  public render() {
    const {connected, motorConfig} = this.props;
    const {activeMotorType, currentProfile, currentSetpoint, currentLimitEnabled, inputRampLimit, currentChopEnabled,
      outputRampLimit, rampRateEnabled, positionProfile, positionSetpoint, savingConfig, slaveMode,
      updateRequested, velocityProfile, velocitySetpoint} = this.state;
    const canID = motorConfig.canID;
    const isCoastMode = motorConfig.idleMode === 0;
    const currentLimit = motorConfig.currentLimit;
    const deadband = motorConfig.inputDeadband;
    const masterID = motorConfig.followerID;
    return (
      <div>
        <Alert isOpen={updateRequested} cancelButtonText="Cancel" confirmButtonText="Yes, Update" intent="success" onCancel={this.closeConfirmModal} onClose={this.closeConfirmModal} onConfirm={this.updateConfiguration}>
          Are you sure you want to update the configuration of your SPARK controller to a {activeMotorType.name} motor?
        </Alert>
        <div className="form">
          <FormGroup
            label="Select Motor Type"
            labelFor="advanced-motor-type"
            className="form-group-two-fifths"
          >
            <MotorTypeSelect
              activeConfig={activeMotorType}
              connected={connected}
              onMotorSelect={this.changeMotorType}
            />
          </FormGroup>
          <FormGroup
            label="Current Limit"
            labelFor="advanced-has-limit"
            className="form-group-fifth"
          >
            <Switch checked={currentLimitEnabled} disabled={!connected} label={currentLimitEnabled ? "On" : "No Limit"} onChange={this.changeCurrentLimitEnabled} />
          </FormGroup>
          <FormGroup
            label="Manual Limit"
            labelFor="advanced-current-limit"
            className="form-group-fifth"
          >
            <NumericInput id="advanced-current-limit" value={currentLimit} disabled={!currentLimitEnabled} onValueChange={this.changeCurrentLimit} stepSize={0.5} min={0} max={100}/>
          </FormGroup>
          <FormGroup
            label="Can ID"
            labelFor="advanced-can-id"
            className="form-group-fifth"
          >
            <NumericInput id="advanced-can-id" disabled={!connected} value={canID} onValueChange={this.changeCanID} min={0} max={24}/>
          </FormGroup>
        </div>
        <div className="form">
          <FormGroup
            label="Idle Mode"
            labelFor="advanced-idle-mode"
            className="form-group-quarter"
          >
            <Switch checked={isCoastMode} disabled={!connected} label={isCoastMode ? "Coast" : "Brake"} onChange={this.changeIdleMode} />
          </FormGroup>
          <FormGroup
            label="Motor Deadband"
            labelFor="advanced-deadband"
            className="form-group-three-quarters"
          >
            <Slider initialValue={deadband} disabled={!connected} value={deadband} min={0} max={1.0} stepSize={0.01} onChange={this.changeDeadband} />
          </FormGroup>
        </div>
        <div className="form">
          <FormGroup
            label="Current Profile And Setpoint"
            labelFor="advanced-current-profile"
            className="form-group-half inline"
          >
            <NumericInput id="advanced-current-profile" disabled={!connected} value={currentProfile} onValueChange={this.changeCurrentProfile} min={1} max={4}/>
            <NumericInput id="advanced-current-setpoint" disabled={!connected} value={currentSetpoint} onValueChange={this.changeCurrentSetpoint} min={1} max={1024}/>
          </FormGroup>
          <FormGroup
            label="Velocity Profile And Setpoint"
            labelFor="advanced-velocity-profile"
            className="form-group-half inline"
          >
            <NumericInput id="advanced-velocity-profile" disabled={!connected} value={velocityProfile} onValueChange={this.changeVelocityProfile} min={1} max={4}/>
            <NumericInput id="advanced-velocity-setpoint" disabled={!connected} value={velocitySetpoint} onValueChange={this.changeVelocitySetpoint} min={1} max={1024}/>
          </FormGroup>
        </div>
        <div className="form">
          <FormGroup
            label="Position Profile And Setpoint"
            labelFor="advanced-position-profile"
            className="form-group-half inline"
          >
            <NumericInput id="advanced-position-profile" disabled={!connected} value={positionProfile} onValueChange={this.changePositionProfile} min={1} max={4}/>
            <NumericInput id="advanced-position-setpoint" disabled={!connected} value={positionSetpoint} onValueChange={this.changePositionSetpoint} min={1} max={1024}/>
          </FormGroup>
          <FormGroup
            label="Current Chop"
            labelFor="advanced-input-limit"
            className="form-group-quarter"
          >
            <Switch checked={currentChopEnabled} disabled={!connected} label={currentChopEnabled ? "Enabled" : "Disabled"} onChange={this.changeCurrentChopEnabled} />
          </FormGroup>
          <FormGroup
            label="Current Value"
            labelFor="advanced-input-rate"
            className="form-group-quarter"
          >
            <NumericInput id="advanced-input-rate" value={inputRampLimit} disabled={!currentChopEnabled} onValueChange={this.changeCurrentChop} min={0} max={1024}/>
          </FormGroup>
        </div>
        <div className="form">
          <FormGroup
            label="Ramp Rate"
            labelFor="advanced-output-limit"
            className="form-group-quarter"
          >
            <Switch checked={rampRateEnabled} disabled={!connected} label={rampRateEnabled ? "Enabled" : "Disabled"} onChange={this.changeOutputLimitEnabled} />
          </FormGroup>
          <FormGroup
            label="Rate (V/s)"
            labelFor="advanced-output-rate"
            className="form-group-quarter"
          >
            <NumericInput id="advanced-output-rate" value={outputRampLimit} disabled={!rampRateEnabled} onValueChange={this.changeOutputLimitRate} min={0} max={1024}/>
          </FormGroup>
          <FormGroup
            label="Slave Mode"
            labelFor="advanced-is-slave"
            className="form-group-quarter"
          >
            <Switch checked={slaveMode} disabled={!connected} label={slaveMode ? "Enabled" : "Disabled"} onChange={this.changeSlaveMode} />
          </FormGroup>
          <FormGroup
            label="Master ID"
            labelFor="advanced-master-id"
            className="form-group-quarter"
          >
            <NumericInput id="advanced-master-id" value={masterID} disabled={!slaveMode} onValueChange={this.changeMasterID} min={0} max={24}/>
          </FormGroup>
        </div>
        <div className="form">
          <Button className="rev-btn" disabled={!connected} loading={savingConfig} onClick={this.openConfirmModal}>Update Configuration</Button>
        </div>
      </div>
    );
  }

  public changeCanID(id: number) {
    this.props.motorConfig.canID = id;
    this.forceUpdate();
  }

  public changeMotorType(motorType: MotorConfiguration) {
    this.setState({activeMotorType: motorType});
  }

  public changeCurrentLimitEnabled() {
    const newEnabled: boolean = !this.state.currentLimitEnabled;
    if (!newEnabled) {
      this.props.motorConfig.currentLimit = 0;
      this.forceUpdate();
    }
    this.setState({currentLimitEnabled: newEnabled});
  }

  public changeIdleMode() {
    const prevMode: number = this.props.motorConfig.idleMode;
    this.props.motorConfig.idleMode = prevMode === 0 ? 1 : 0;
    this.forceUpdate();
  }

  public changeCurrentLimit(value: number) {
    this.props.motorConfig.currentLimit = value;
    this.forceUpdate();
  }

  public changeDeadband(value: number) {
    this.props.motorConfig.inputDeadband = value;
    this.forceUpdate();
  }

  public openConfirmModal() {
    this.setState({updateRequested: true});
  }

  public closeConfirmModal() {
    this.setState({updateRequested: false});
  }

  public changeCurrentProfile(value: number) {
    this.setState({currentProfile: value});
  }

  public changeCurrentSetpoint(value: number) {
    this.setState({currentSetpoint: value});
  }

  public changeVelocityProfile(value: number) {
    this.setState({velocityProfile: value});
  }

  public changeVelocitySetpoint(value: number) {
    this.setState({velocitySetpoint: value});
  }

  public changePositionProfile(value: number) {
    this.setState({positionProfile: value});
  }

  public changePositionSetpoint(value: number) {
    this.setState({positionSetpoint: value});
  }

  public changeSlaveMode() {
    this.setState({slaveMode: !this.state.slaveMode});
  }

  public changeMasterID(value: number) {
    this.props.motorConfig.followerID = value;
    this.forceUpdate();
  }

  public changeOutputLimitEnabled() {
    const newEnabled: boolean = !this.state.rampRateEnabled;
    if (!newEnabled) {
      this.props.motorConfig.rampRate = 0;
    }
    this.setState({rampRateEnabled: newEnabled});
  }

  public changeOutputLimitRate(value: number) {
    this.setState({outputRampLimit: value});
  }

  public changeCurrentChopEnabled() {
    const newEnabled: boolean = !this.state.currentChopEnabled;
    if (!newEnabled) {
      this.props.motorConfig.currentChop = 0;
      this.forceUpdate();
    }
    this.setState({currentChopEnabled: newEnabled});
  }

  public changeCurrentChop(value: number) {
    this.props.motorConfig.currentChop = value;
    this.forceUpdate();
  }

  public updateConfiguration() {
    this.setState({savingConfig: true});
    SparkManager.setParamsFromConfig(this.props.motorConfig).then((res: any) => {
      console.log(res);
      SparkManager.burnFlash().then((flashRes: any) => {
        console.log(flashRes);
        this.setState({savingConfig: false});
      }).catch((error: any) => {
        this.setState({savingConfig: false});
        console.log(error);
      });
    }).catch((error: any) => {
      console.log(error);
      this.setState({savingConfig: false});
    });
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    connected: state.isConnected,
    motorConfig: state.currentConfig
  };
}

export default connect(mapStateToProps)(AdvancedTab);