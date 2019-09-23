import {Button} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import * as classnames from "classnames";
import {getVirtualDeviceId, IApplicationState, IDeviceState} from "../store/state";
import {connectToSelectedDevice, disconnectCurrentDevice, selectDevice, SparkDispatch} from "../store/actions";
import {
  getDevicesInOrder,
  getProcessStatus, getSelectedDevice,
  isConnectableToAnyDevice,
  isInProcessing,
  isSelectedDeviceConnected
} from "../store/selectors";
import {DeviceSelect} from "./DeviceSelect";

interface IProps {
  selectedDevice?: IDeviceState,
  devices: IDeviceState[],
  connectionStatus: string,
  connecting: boolean,
  connected: boolean,
  connectable: boolean,

  connect(): void;
  disconnect(): void;
  selectDevice(device: IDeviceState): void;
}

class ConnectionStatusBar extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  public render() {
    const {devices, selectedDevice, connectionStatus, connecting, connected, connectable} = this.props;
    const lampClass = classnames({
      "status-bar-lamp--connected": connected,
      "status-bar-lamp--disconnected": !connected,
    });
    return (
      <div id="status-bar" className="no-wrap">
        <div id="status-bar-lamp" className={lampClass}/>
        <div id="status-bar-driver-name">{selectedDevice ? selectedDevice.info.driverName : ""}</div>
        <div id="status-bar-status">{connectionStatus}</div>
        <DeviceSelect className="status-bar-device-selector"
                      devices={devices}
                      selected={selectedDevice}
                      onSelect={this.props.selectDevice}/>
        <div id="status-bar-button">
          <Button fill={true} disabled={!connectable || connecting} loading={connecting}
                  onClick={connected ? this.props.disconnect : this.props.connect}>
            {connected ? "Disconnect" : "Connect"}
          </Button>
        </div>
      </div>
    );
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    selectedDevice: getSelectedDevice(state),
    devices: getDevicesInOrder(state),
    connected: isSelectedDeviceConnected(state),
    connecting: isInProcessing(state),
    connectable: isConnectableToAnyDevice(state),
    connectionStatus: getProcessStatus(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    connect: () => dispatch(connectToSelectedDevice()),
    disconnect: () => dispatch(disconnectCurrentDevice()),
    selectDevice: (device: IDeviceState) => dispatch(selectDevice(getVirtualDeviceId(device))),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionStatusBar);