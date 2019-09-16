import * as React from "react";
import {connect} from "react-redux";
import {ApplicationActions, IApplicationState} from "../store/types";
import {Dispatch} from "redux";

// tslint:disable-next-line:no-empty-interface
interface IProps {
}

// tslint:disable-next-line:no-empty-interface
interface IState {
}

class AdvancedTab extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {};
  }

  public render() {
    return <div/>
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {};
}

export function mapDispatchToProps(dispatch: Dispatch<ApplicationActions>) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(AdvancedTab);