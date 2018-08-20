import {Button} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {IApplicationState} from "../store/types";

interface IProps {
  connectionStatus: string,
  connecting: boolean,
  connected: boolean
}

class ConnectionStatusBar extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  public render() {
    const {connectionStatus, connecting, connected} = this.props;
    return (
      <div id="status-bar">
        <span id="status-bar-status">Motor Controller Connection Status: {connectionStatus}</span>
        <span id="status-bar-button">
          <Button fill={true} disabled={connecting} loading={connecting}>
            {connected ? "Disconnect" : "Connect"}
          </Button>
        </span>
      </div>
    );
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    connected: state.isConnected,
    connecting: state.isConnecting,
    connectionStatus: state.connectionStatus
  }
}

export default connect(mapStateToProps)(ConnectionStatusBar);
