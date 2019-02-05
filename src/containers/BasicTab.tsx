import {Alert, Button, FormGroup, NumericInput, Radio, RadioGroup, Switch} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {MotorTypeSelect} from "../components/MotorTypeSelect";
import SparkManager, {IServerResponse} from "../managers/SparkManager";
import MotorConfiguration, {getFromID} from "../models/MotorConfiguration";
import {ApplicationActions, IApplicationState, ISetBurnedMotorConfig, ISetMotorConfig} from "../store/types";
import {ConfigParameter} from "../models/ConfigParameter";
import PopoverHelp from "../components/PopoverHelp";
import {Dispatch} from "redux";
import {setBurnedMotorConfig, setMotorConfig} from "../store/actions";

interface IProps {
  connected: boolean,
  motorConfig: MotorConfiguration,
  burnedConfig: MotorConfiguration,
  paramResponses: IServerResponse[],
  setCurrentConfig: (config: MotorConfiguration) => ISetMotorConfig,
  setBurnedConfig: (config: MotorConfiguration) => ISetBurnedMotorConfig,
}

interface IState {
  updateRequested: boolean,
  savingConfig: boolean,
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

  public render() {
    const {connected, motorConfig, burnedConfig} = this.props;
    const {savingConfig, updateRequested} = this.state;

    const activeMotorType = getFromID(motorConfig.type);
    const canID = motorConfig.canID;
    const isCoastMode = motorConfig.idleMode === 0;
    const currentLimit = motorConfig.currentChop;

    // Motor Type
    const typeModified: boolean = motorConfig.type !== burnedConfig.type;

    // CAN ID
    const canModified: boolean = motorConfig.canID !== burnedConfig.canID;
    const canResponse: IServerResponse = this.getParamResponse(ConfigParameter.kCanID);
    const canError: boolean = canResponse.status === 4;

    // Idle Mode
    const idleModified: boolean = motorConfig.idleMode !== burnedConfig.idleMode;

    // Current
    const currModified: boolean = motorConfig.currentChop !== burnedConfig.currentChop;

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
            className={(typeModified ? "modified" : "") + " form-group-half"}
          >
            <MotorTypeSelect
              activeConfig={activeMotorType}
              connected={connected}
              onMotorSelect={this.selectMotorType}
            />
          </FormGroup>
          <FormGroup
            label={<PopoverHelp enabled={!canError} title={"CAN ID"} content={`Your requested value of ${canResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${canResponse.responseValue}.`}/>}
            labelFor="basic-can-id"
            className={(canModified ? "modified" : "") + " form-group-quarter"}
          >
            <NumericInput
              id="basic-can-id"
              value={canID}
              onValueChange={this.changeCanID}
              min={0}
              max={24}
              disabled={!connected}
              className={canError ? "field-error" : ""}
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
        </div>
        <div className="form">
          <FormGroup
            label="Current Chop"
            inline={true}
            className={currModified ? "modified" : ""}
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
            Save Configuration
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
    SparkManager.setAndGetParameter(ConfigParameter.kCanID, id).then((res: IServerResponse) => {
      this.props.motorConfig.canID = res.responseValue as number;
      this.props.paramResponses[ConfigParameter.kCanID] = res;
      this.forceUpdate();
    });
  }

  public selectMotorType(motorType: MotorConfiguration) {
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

  public changeIdleMode() {
    const prevMode: number = this.props.motorConfig.idleMode;
    const newMode: number = prevMode === 0 ? 1 : 0;
    SparkManager.setAndGetParameter(ConfigParameter.kIdleMode, newMode).then((res: IServerResponse) => {
      this.props.motorConfig.idleMode = res.responseValue as number;
      this.props.paramResponses[ConfigParameter.kIdleMode] = res;
      this.forceUpdate();
    });
  }

  public changeCurrentLimit(value: any) {
    const chop: number = parseInt(value.currentTarget.value, 10);
    SparkManager.setAndGetParameter(ConfigParameter.kCurrentChop, chop).then((res: IServerResponse) => {
      this.props.motorConfig.currentChop = res.responseValue as number;
      this.props.paramResponses[ConfigParameter.kCurrentChop] = res;
      this.forceUpdate();
    });
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
    setBurnedConfig: (config: MotorConfiguration) => dispatch(setBurnedMotorConfig(config))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BasicTab);