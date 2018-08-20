import {Alert, Button, FormGroup, NumericInput, Radio, RadioGroup, Switch} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {MotorTypeSelect} from "../components/MotorTypeSelect";
import MotorConfiguration, {REV_BRUSHLESS} from "../models/MotorConfiguration";
import {IApplicationState} from "../store/types";

interface IProps {
  connected: boolean
}

interface IState {
  updateRequested: boolean,
  savingConfig: boolean,
  canID: number,
  currentLimit: number,
  isCoastMode: boolean,
  activeMotorType: MotorConfiguration
}

class BasicTab extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      activeMotorType: REV_BRUSHLESS,
      canID: 0,currentLimit: 40,
      isCoastMode: false,
      savingConfig: false,
      updateRequested: false
    };
    this.openConfirmModal = this.openConfirmModal.bind(this);
    this.closeConfirmModal = this.closeConfirmModal.bind(this);

    this.selectMotorType = this.selectMotorType.bind(this);
    this.changeCanID = this.changeCanID.bind(this);
    this.changeIdleMode = this.changeIdleMode.bind(this);
    this.changeCurrentLimit = this.changeCurrentLimit.bind(this);
  }

  public render() {
    const {connected} = this.props;
    const {activeMotorType, canID, currentLimit, isCoastMode, savingConfig, updateRequested} = this.state;
    return (
      <div>
        <Alert
          isOpen={updateRequested}
          cancelButtonText="Cancel"
          confirmButtonText="Yes, Update"
          intent="success"
          onCancel={this.closeConfirmModal}
          onClose={this.closeConfirmModal}
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
              <Radio label="No Limit" value={-1}/>
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
    this.setState({canID: id});
  }

  public selectMotorType(motorType: MotorConfiguration) {
    this.setState({activeMotorType: motorType});
  }

  public changeIdleMode() {
    this.setState({isCoastMode: !this.state.isCoastMode});
  }

  public changeCurrentLimit(value: any) {
    this.setState({currentLimit: parseInt(value.currentTarget.value, 10)});
  }

}

export function mapStateToProps(state: IApplicationState) {
  return {
    connected: state.isConnected
  };
}

export default connect(mapStateToProps)(BasicTab);