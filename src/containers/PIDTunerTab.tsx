import {Button, FormGroup, NumericInput} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {IApplicationState} from "../store/state";
import {queryIsSelectedDeviceConnected} from "../store/selectors";

interface IProps {
  connected: boolean
}

interface IState {
  profile: number,
  p: number,
  i: number,
  d: number,
  f: number
}

class PIDTunerTab extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      d: 0,
      f: 0,
      i: 0,
      p: 0,
      profile: 0
    };
    this.changeProfile = this.changeProfile.bind(this);
    this.changeP = this.changeP.bind(this);
    this.changeI = this.changeI.bind(this);
    this.changeD = this.changeD.bind(this);
    this.changeF = this.changeF.bind(this);
    this.updatePID = this.updatePID.bind(this);
  }

  public render() {
    const {profile, p, i, d, f} = this.state;
    return (
      <div>
        <div className="form">
          <FormGroup
            label={tt("lbl_pid_profile")}
            className="form-group-fifth"
          >
            <NumericInput id="pid-profile" disabled={!this.props.connected} value={profile} onValueChange={this.changeProfile} min={0} max={3}/>
          </FormGroup>
          <FormGroup
            label={tt("lbl_p_uc")}
            className="form-group-fifth"
          >
            <NumericInput id="pid-profile" disabled={!this.props.connected} value={p} onValueChange={this.changeP} min={0} max={3}/>
          </FormGroup>
          <FormGroup
            label={tt("lbl_i_uc")}
            className="form-group-fifth"
          >
            <NumericInput id="pid-profile" disabled={!this.props.connected} value={i} onValueChange={this.changeI} min={0} max={3}/>
          </FormGroup>
          <FormGroup
            label={tt("lbl_d_uc")}
            className="form-group-fifth"
          >
            <NumericInput id="pid-profile" disabled={!this.props.connected} value={d} onValueChange={this.changeD} min={0} max={3}/>
          </FormGroup>
          <FormGroup
            label={tt("lbl_f_uc")}
            className="form-group-fifth"
          >
            <NumericInput id="pid-profile" disabled={!this.props.connected} value={f} onValueChange={this.changeF} min={0} max={3}/>
          </FormGroup>
        </div>
        <div className="form">
          <Button className="rev-btn" disabled={!this.props.connected} onClick={this.updatePID}>{tt("lbl_update_pidf_configuration")}</Button>
        </div>
      </div>
    );
  }

  public changeProfile(value: number) {
    this.setState({profile: value});
  }

  public changeP(value: number) {
    this.setState({p: value});
  }

  public changeI(value: number) {
    this.setState({i: value});
  }

  public changeD(value: number) {
    this.setState({d: value});
  }

  public changeF(value: number) {
    this.setState({f: value});
  }

  public updatePID() {
    // console.log("Updating PID");
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    connected: queryIsSelectedDeviceConnected(state),
  };
}

export default connect(mapStateToProps)(PIDTunerTab);
