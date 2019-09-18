import {Button} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import * as classnames from "classnames";
import {IApplicationState, SparkDispatch} from "../store/types";
import {connectMasterUsbDevice, disconnectCurrentUsbDevice} from "../store/device-actions";
import {isConnectableSelector} from "../store/selectors";

interface IProps {
  connectionStatus: string,
  connecting: boolean,
  connected: boolean,
  connectable: boolean,

  connect(): void;

  disconnect(): void;
}

class ConnectionStatusBar extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  public render() {
    const {connectionStatus, connecting, connected, connectable} = this.props;
    const lampClass = classnames({
      "status-bar-lamp--connected": connected,
      "status-bar-lamp--disconnected": !connected,
    });
    return (
      <div id="status-bar">
        <span id="status-bar-lamp" className={lampClass}/>
        <span id="status-bar-driver-name">{connectionStatus}</span>
        <span id="status-bar-status">{connectionStatus}</span>
        <span id="status-bar-button">
          <Button fill={true} disabled={!connectable || connecting} loading={connecting}
                  onClick={connected ? this.props.disconnect : this.props.connect}>
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
    connectable: isConnectableSelector(state),
    connectionStatus: state.connectionStatus
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    connect: () => dispatch(connectMasterUsbDevice()),
    disconnect: () => dispatch(disconnectCurrentUsbDevice()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionStatusBar);