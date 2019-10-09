import {Button, Checkbox, Icon, ProgressBar} from "@blueprintjs/core";
import {Cell, Column, ICellRenderer, Table} from "@blueprintjs/table";
import * as React from "react";
import {ReactNode, useCallback} from "react";
import {connect} from "react-redux";
import {
  DeviceId,
  getNetworkDeviceId,
  IApplicationState,
  INetworkDevice,
  isNetworkDeviceError,
  isNetworkDeviceLoading,
  isNetworkDeviceSelectable,
  NetworkDeviceStatus,
} from "../store/state";
import {
  addLog,
  requestFirmwareLoad,
  scanCanBus,
  selectNetworkDevice,
  showNetworkDeviceHelp,
  SparkDispatch
} from "../store/actions";
import {
  queryFirmwareDownloadError,
  queryIsFirmwareDownloading,
  queryIsHasConnectedDevice,
  queryLatestFirmwareVersion,
  queryNetwork
} from "../store/selectors";
import Console from "../components/Console";

interface IProps {
  connected: boolean;
  devices: INetworkDevice[];
  outputText: string[];
  firmwareLoading: boolean;
  firmwareLoadingProgress: number,
  firmwareLoadingText: string,
  scanInProgress: boolean;

  latestFirmwareVersion: string;
  firmwareDownloading: boolean;
  firmwareDownloadError: boolean;

  requestFirmwareLoad(): void;

  scanCanBus(): void;

  selectDevice(id: DeviceId, selected: boolean): void;

  showDeviceHelp(id: DeviceId): void;
}

interface INetworkDeviceSelectorProps {
  deviceId: DeviceId;
  selected: boolean;
  disabled: boolean;

  onSelected(deviceId: DeviceId, selected: boolean): void;
}

const NetworkDeviceSelector = (props: INetworkDeviceSelectorProps) => {
  const {deviceId, selected, disabled, onSelected} = props;

  const onChange = useCallback((event) => onSelected(deviceId, event.target.checked), []);

  return <Checkbox checked={selected} disabled={disabled} onChange={onChange}/>;
};

interface INetworkDeviceHowToProps {
  deviceId: DeviceId;
  onOpen(id: DeviceId): void;
}

const NetworkDeviceHowTo = (props: INetworkDeviceHowToProps) => {
  const { deviceId, onOpen } = props;

  const open = useCallback(() => onOpen(deviceId), []);

  return <button className="link" onClick={open}>How to</button>;
}

class NetworkTab extends React.Component<IProps> {
  public render() {
    const {
      firmwareLoadingProgress, firmwareLoadingText, outputText, scanInProgress, firmwareLoading,
      latestFirmwareVersion, firmwareDownloading, devices, connected,
    } = this.props;
    return (
      <div className="page">
        <div className="flex-row flex-space-between">
          <Table className="network-table"
                 enableMultipleSelection={false}
                 enableColumnResizing={false}
                 enableRowResizing={false}
                 numRows={Math.max(devices.length, 10)}
                 columnWidths={[75, 150, 150, 75]}>

            <Column name="Interface" cellRenderer={this.wrapDeviceCellRenderer(this.interfaceColumnRenderer)}/>
            <Column name="Device" cellRenderer={this.wrapDeviceCellRenderer(this.deviceColumnRenderer)}/>
            <Column name="Firmware" cellRenderer={this.wrapDeviceCellRenderer(this.firmwareColumnRenderer)}/>
            <Column name="Update" cellRenderer={this.wrapDeviceCellRenderer(this.updateColumnRenderer)}/>
          </Table>
          <div>
            <Button className="rev-btn"
                    onClick={this.props.scanCanBus}
                    disabled={!connected || firmwareLoading}
                    loading={scanInProgress}>Scan Bus</Button>
          </div>
        </div>
        <br/>
        <div id="firmware-bar">
          <span>Latest Firmware: {firmwareDownloading ? "Loading..." : latestFirmwareVersion}</span>
          <span><Button className="rev-btn"
                        loading={firmwareLoading || firmwareDownloading}
                        disabled={!connected}
                        onClick={this.props.requestFirmwareLoad}>{"Load Firmware"}</Button></span>
        </div>
        <br/>
        <div>
          <ProgressBar value={firmwareLoadingProgress}/>
          <span>{firmwareLoadingText}</span>
        </div>
        <br/>
        <Console height="150px" text={outputText}/>
      </div>
    );
  }

  private updateColumnRenderer = (rowIndex: number) => {
    const {firmwareLoading, devices} = this.props;
    const device = devices[rowIndex];
    const content = device.status === NetworkDeviceStatus.RequiresRecoveryMode ?
      (
        <NetworkDeviceHowTo deviceId={getNetworkDeviceId(device)} onOpen={this.props.showDeviceHelp}/>
      )
      : (
        <NetworkDeviceSelector deviceId={getNetworkDeviceId(device)}
                               selected={device.selected}
                               disabled={firmwareLoading || !isNetworkDeviceSelectable(device)}
                               onSelected={this.props.selectDevice}/>
      );
    return (
      <Cell tooltip={this.buildUpdateTooltip(device)}
            className="text-center">
        {content}
      </Cell>
    );
  };

  private interfaceColumnRenderer = (rowIndex: number) => {
    const device = this.props.devices[rowIndex];
    return <Cell className="text-center">{device.interfaceName}</Cell>
  };

  private deviceColumnRenderer = (rowIndex: number) => {
    const device = this.props.devices[rowIndex];
    return <Cell>{device.deviceName}</Cell>
  };

  private firmwareColumnRenderer = (rowIndex: number) => {
    const device = this.props.devices[rowIndex];
    const isError = isNetworkDeviceError(device);

    let content: ReactNode;
    if (isError) {
      content = (
        <>
          <Icon icon="warning-sign" intent="danger"/>
          &nbsp;device.error
        </>
      );
    } else if (device.status === NetworkDeviceStatus.NotConfigured) {
      content = (
        <>
          <Icon icon="warning-sign" intent="warning"/>
          &nbsp;Not Configured
        </>
      );
    } else {
      content = device.firmwareVersion;
    }

    return (
      <Cell loading={isNetworkDeviceLoading(device)} tooltip={isError ? device.error : ""}>
        {content}
      </Cell>
    );
  };

  private buildUpdateTooltip = (device: INetworkDevice) => {
    switch (device.status) {
      case NetworkDeviceStatus.Updateable:
        return "Click to add this device to the update group.";
      case NetworkDeviceStatus.RequiresRecoveryMode:
        return "To update this device, it should be switched to recovery mode";
      case NetworkDeviceStatus.RecoveryMode:
        return "Device in recovery mode will be forcibly updated";
      case NetworkDeviceStatus.NotConfigured:
        return "Not-configured device will be forcibly updated";
      default:
        return "Unable to update this device.";
    }
  };

  private wrapDeviceCellRenderer(renderer: ICellRenderer): ICellRenderer {
    return (rowIndex, columnIndex) => {
      if (this.props.devices[rowIndex]) {
        return renderer(rowIndex, columnIndex);
      } else {
        return <Cell/>;
      }
    };
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    connected: queryIsHasConnectedDevice(state),
    ...queryNetwork(state),
    firmwareDownloading: queryIsFirmwareDownloading(state),
    latestFirmwareVersion: queryLatestFirmwareVersion(state),
    firmwareDownloadError: queryFirmwareDownloadError(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    scanCanBus: () => dispatch(scanCanBus()),
    requestFirmwareLoad: () => dispatch(requestFirmwareLoad()),
    addLog: (log: string) => dispatch(addLog(log)),
    selectDevice: (id: DeviceId, selected: boolean) => dispatch(selectNetworkDevice(id, selected)),
    showDeviceHelp: (id: DeviceId) => dispatch(showNetworkDeviceHelp(id)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NetworkTab);
