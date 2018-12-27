import {Alert, Button, FormGroup, NumericInput, Radio, RadioGroup, Switch} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {MotorTypeSelect} from "../components/MotorTypeSelect";
import SparkManager from "../managers/SparkManager";
import MotorConfiguration, {getFromID, REV_BRUSHED, REV_BRUSHLESS} from "../models/MotorConfiguration";
import {IApplicationState} from "../store/types";

interface IProps {
  connected: boolean,
  motorConfig: MotorConfiguration
}

interface IState {
  updateRequested: boolean,
  savingConfig: boolean
}

class BasicTab extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      savingConfig: false,
      updateRequested: false
    };
    this.openConfirmModal = this.openConfirmModal.bind(this);
    this.closeConfirmModal = this.closeConfirmModal.bind(this);

    this.selectMotorType = this.selectMotorType.bind(this);
    this.changeCanID = this.changeCanID.bind(this);
    this.changeIdleMode = this.changeIdleMode.bind(this);
    this.changeCurrentLimit = this.changeCurrentLimit.bind(this);

    this.updateConfiguration = this.updateConfiguration.bind(this);
  }

  public componentDidMount(): void {
    if (this.props.connected) {
      this.selectMotorType(this.props.motorConfig.type === 1 ? REV_BRUSHLESS : REV_BRUSHED);
    }
  }

  public componentDidUpdate(prevProps: Readonly<IProps>): void {
    if (prevProps.connected !== this.props.connected) {
      this.componentDidMount();
    }
  }

  public render() {
    const {connected, motorConfig} = this.props;
    const {savingConfig, updateRequested} = this.state;

    const activeMotorType = getFromID(motorConfig.type);
    const canID = motorConfig.canID;
    const isCoastMode = motorConfig.idleMode === 0;
    const currentLimit = motorConfig.currentLimit;
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
        <div className="form">
          <FormGroup
            label="Select Motor Type"
            labelFor="basic-motor-type"
            className="form-group-half"
          >
            <MotorTypeSelect
              activeConfig={activeMotorType}
              connected={connected}
              onMotorSelect={this.selectMotorType}
            />
          </FormGroup>
          <FormGroup
            label="Can ID"
            labelFor="basic-can-id"
            className="form-group-quarter"
          >
            <NumericInput
              id="basic-can-id"
              value={canID}
              onValueChange={this.changeCanID}
              min={0}
              max={24}
              disabled={!connected}
            />
          </FormGroup>
          <FormGroup
            label="Idle Mode"
            labelFor="basic-idle-mode"
            className="form-group-quarter"
          >
            <Switch
              checked={isCoastMode}
              disabled={!connected}
              label={isCoastMode ? "Coast" : "Brake"}
              onChange={this.changeIdleMode}
            />
          </FormGroup>
        </div>
        <div className="form">
          <FormGroup
            label="Current Limit"
            inline={true}
          >
            <RadioGroup
              inline={true}
              selectedValue={currentLimit}
              onChange={this.changeCurrentLimit}
              disabled={!connected}
            >
              <Radio label="20A" value={20}/>
              <Radio label="30A" value={30}/>
              <Radio label="40A" value={40}/>
              <Radio label="No Limit" value={0}/>
            </RadioGroup>
          </FormGroup>
        </div>
        <div className="form">
          <Button
            className="rev-btn"
            disabled={!connected}
            loading={savingConfig}
            onClick={this.openConfirmModal}
          >
            Update Configuration
          </Button>
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

  public changeCanID(id: number) {
    this.props.motorConfig.canID = id;
    this.forceUpdate();
  }

  public selectMotorType(motorType: MotorConfiguration) {
    this.props.motorConfig.type = motorType.type;
    this.forceUpdate();
  }

  public changeIdleMode() {
    const prevMode: number = this.props.motorConfig.idleMode;
    this.props.motorConfig.idleMode = prevMode === 0 ? 1 : 0;
    this.forceUpdate();
  }

  public changeCurrentLimit(value: any) {
    this.props.motorConfig.currentLimit = parseInt(value.currentTarget.value, 10);
    this.forceUpdate();
  }

  private updateConfiguration() {
    this.setState({savingConfig: true});
    SparkManager.setParamsFromConfig(this.props.motorConfig).then((res: any) => {
      SparkManager.burnFlash().then((flashRes: any) => {
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

export default connect(mapStateToProps)(BasicTab);