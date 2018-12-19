import {Button} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import SparkManager from "../managers/SparkManager";
import MotorConfiguration from "../models/MotorConfiguration";
import {setConnectedDevice, setIsConnecting, setMotorConfig, updateConnectionStatus} from "../store/actions";
import {
  ApplicationActions,
  IApplicationState,
  ISetConnectedDevice,
  ISetIsConnecting, ISetMotorConfig,
  IUpdateConnectionStatus
} from "../store/types";

interface IProps {
  connectionStatus: string,
  connecting: boolean,
  connected: boolean,
  connectedDevice: string,
  updateConnectionStatus: (connected: boolean, status: string) => IUpdateConnectionStatus,
  setConnectedDevice: (device: string) => ISetConnectedDevice,
  setIsConnecting: (connecting: boolean) => ISetIsConnecting,
  setCurrentConfig: (config: MotorConfiguration) => ISetMotorConfig
}

class ConnectionStatusBar extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
    this.attemptConnection = this.attemptConnection.bind(this);
    this.disconnect = this.disconnect.bind(this);
  }

  public render() {
    const {connectionStatus, connecting, connected} = this.props;
    return (
      <div id="status-bar">
        <span id="status-bar-status">Motor Controller Connection Status: {connectionStatus}</span>
        <span id="status-bar-button">
          <Button fill={true} disabled={connecting} loading={connecting} onClick={connected ? this.disconnect : this.attemptConnection}>
            {connected ? "Disconnect" : "Connect"}
          </Button>
        </span>
      </div>
    );
  }

  private attemptConnection() {
    this.props.updateConnectionStatus(false, "SEARCHING...");
    this.props.setIsConnecting(true);
    SparkManager.discoverAndConnect().then((device: string) => {
      this.props.updateConnectionStatus(true, "CONNECTED");
      this.props.setIsConnecting(false);
      this.props.setConnectedDevice(device);
      SparkManager.getConfigFromParams().then((config: MotorConfiguration) => {
        this.props.setCurrentConfig(config);
        console.log(config);
      });
    }).catch(() => {
      this.props.updateConnectionStatus(false, "CONNECTION FAILED");
      this.props.setIsConnecting(false);
    });
  }

  private disconnect() {
    this.props.setIsConnecting(true);
    SparkManager.disconnect(this.props.connectedDevice).then(() => {
      this.props.updateConnectionStatus(false, "DISCONNECTED");
      this.props.setIsConnecting(false);
    }).catch(() => {
      this.props.setIsConnecting(false);
    });
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    connected: state.isConnected,
    connectedDevice: state.connectedDevice,
    connecting: state.isConnecting,
    connectionStatus: state.connectionStatus
  };
}

export function mapDispatchToProps(dispatch: Dispatch<ApplicationActions>) {
  return {
    setConnectedDevice: (device: string) => dispatch(setConnectedDevice(device)),
    setCurrentConfig: (config: MotorConfiguration) => dispatch(setMotorConfig(config)),
    setIsConnecting: (connecting: boolean) => dispatch(setIsConnecting(connecting)),
    updateConnectionStatus: (connected: boolean, status: string) => dispatch(updateConnectionStatus(connected, status))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionStatusBar);