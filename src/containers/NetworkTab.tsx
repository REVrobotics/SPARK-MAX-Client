import {Button, Checkbox, Icon, ProgressBar} from "@blueprintjs/core";
import {Cell, Column, ICellProps, ICellRenderer, Table} from "@blueprintjs/table";
import * as React from "react";
import {ReactElement, ReactNode, useCallback} from "react";
import {connect} from "react-redux";
import {
  DeviceId, getDfuDeviceId,
  getNetworkDeviceId,
  IApplicationState, IDfuDevice,
  INetworkDevice,
  isNetworkDeviceError,
  isNetworkDeviceLoading,
  isNetworkDeviceSelectable,
  NetworkDeviceStatus,
} from "../store/state";
import {
  requestFirmwareLoad,
  scanCanBus, selectAllDfuDevices, selectDfuDevice,
  selectNetworkDevice,
  showNetworkDeviceHelp,
  SparkDispatch
} from "../store/actions";
import {
  queryFirmwareDownloadError, queryHasSelectedDfuDevice,
  queryIsFirmwareDownloading,
  queryIsHasConnectedDevice,
  queryLatestFirmwareVersion,
  queryNetwork
} from "../store/selectors";
import Console from "../components/Console";

interface IProps {
  connected: boolean;
  devices: INetworkDevice[];
  dfuDevices: IDfuDevice[];
  isSelectAllDfuDevices: boolean;
  hasSelectedDfuDevice: boolean;
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

  selectAllDfuDevices(selected: boolean): void;

  selectDfuDevice(id: string, selected: boolean): void;

  showDeviceHelp(id: DeviceId): void;
}

interface INetworkSelectorProps {
  selected: boolean;
  disabled: boolean;

  onSelected(selected: boolean): void;
}

interface INetworkDeviceSelectorProps {
  value: any;
  selected: boolean;
  disabled: boolean;

  onSelected(value: any, selected: boolean): void;
}

/**
 * Displays checkbox
 */
const NetworkSelector = (props: INetworkSelectorProps) => {
  const {selected, disabled, onSelected} = props;

  const onChange = useCallback((event) => onSelected(event.target.checked), []);

  return <Checkbox checked={selected} disabled={disabled} onChange={onChange}/>;
};

/**
 * Displays checkbox to select specific device
 */
const NetworkDeviceSelector = (props: INetworkDeviceSelectorProps) => {
  const {value, selected, disabled, onSelected} = props;

  const onChange = useCallback((event) => onSelected(value, event.target.checked), [value]);

  return <Checkbox checked={selected} disabled={disabled} onChange={onChange}/>;
};

interface INetworkDeviceHowToProps {
  deviceId: DeviceId;

  onOpen(id: DeviceId): void;
}

interface INetworkCellRendererSet {
  device?(device: INetworkDevice): ReactElement<ICellProps>;

  dfuDevice?(device: IDfuDevice): ReactElement<ICellProps>;

  dfuTitle?(): ReactElement<ICellProps>;
}

enum NetworkRowType {
  Device,
  DfuTitle,
  DfuDevice,
  Empty,
}

/**
 * Displays button used to get instructions on how to update firmware.
 */
const NetworkDeviceHowTo = (props: INetworkDeviceHowToProps) => {
  const {deviceId, onOpen} = props;

  const open = useCallback(() => onOpen(deviceId), []);

  return <button className="link" onClick={open}>{tt("lbl_how_to")}</button>;
};

class NetworkTab extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  public render() {
    const {
      firmwareLoadingProgress, firmwareLoadingText, outputText, scanInProgress, firmwareLoading,
      latestFirmwareVersion, firmwareDownloading, devices, dfuDevices,
    } = this.props;
    const length = devices.length + (dfuDevices.length ? dfuDevices.length + 2 : 0);
    return (
      <div className="page">
        <div className="flex-row flex-space-between">
          <Table className="network-table"
                 enableMultipleSelection={false}
                 enableColumnResizing={false}
                 enableRowResizing={false}
                 numRows={Math.max(length, 10)}
                 columnWidths={[75, 150, 150, 75]}>

            <Column name={tt("lbl_interface")} cellRenderer={this.interfaceColumnRenderer}/>
            <Column name={tt("lbl_device")} cellRenderer={this.deviceColumnRenderer}/>
            <Column name={tt("lbl_firmware")} cellRenderer={this.firmwareColumnRenderer}/>
            <Column name={tt("lbl_update")} cellRenderer={this.updateColumnRenderer}/>
          </Table>
          <div>
            <Button className="rev-btn"
                    onClick={this.props.scanCanBus}
                    disabled={firmwareLoading}
                    loading={scanInProgress}>{tt("lbl_scan_bus")}</Button>
          </div>
        </div>
        <br/>
        <div id="firmware-bar">
          <span>Latest Firmware: {firmwareDownloading ? tt("lbl_loading_dots") : latestFirmwareVersion}</span>
          <span><Button className="rev-btn"
                        loading={firmwareLoading || firmwareDownloading}
                        onClick={this.props.requestFirmwareLoad}>{tt("lbl_load_firmware")}</Button></span>
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

  private updateColumnRenderer = this.wrapCellRenderer({
    device: (device) => {
      const {firmwareLoading} = this.props;
      // If device requires recovery mode => display "How To" button,
      // otherwise display checkbox
      const content = device.status === NetworkDeviceStatus.RequiresRecoveryMode ?
        (
          <NetworkDeviceHowTo deviceId={getNetworkDeviceId(device)} onOpen={this.props.showDeviceHelp}/>
        )
        : (
          <NetworkDeviceSelector value={getNetworkDeviceId(device)}
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
    },
    dfuTitle: () => (
      <Cell className="text-center">
        <NetworkSelector selected={this.props.isSelectAllDfuDevices}
                         disabled={this.props.hasSelectedDfuDevice}
                         onSelected={this.props.selectAllDfuDevices}/>
      </Cell>
    ),
    dfuDevice: (dfuDevice) => (
      <Cell className="text-center">
        <NetworkDeviceSelector value={getDfuDeviceId(dfuDevice)}
                               selected={dfuDevice.selected || this.props.isSelectAllDfuDevices}
                               disabled={this.props.isSelectAllDfuDevices || this.props.hasSelectedDfuDevice && !dfuDevice.selected}
                               onSelected={this.props.selectDfuDevice}/>
      </Cell>
    ),
  });

  private interfaceColumnRenderer = this.wrapCellRenderer({
    device: (device) => <Cell className="text-center">{device.interfaceName}</Cell>,
    dfuTitle: () => <Cell className="cell--dfu-title">{tt("lbl_dfu_devices_title")}</Cell>,
  });

  private deviceColumnRenderer = this.wrapCellRenderer({
    device: (device) => <Cell>{device.deviceName}</Cell>,
    dfuDevice: (device) => <Cell>{device.deviceType}</Cell>,
  });

  private firmwareColumnRenderer = this.wrapCellRenderer({
    device: (device) => {
      const isError = isNetworkDeviceError(device);

      let content: ReactNode;
      if (isError) {
        // Display error if we could not get firmware version
        content = (
          <>
            <Icon icon="warning-sign" intent="danger"/>
            &nbsp;{device.error}
          </>
        );
      } else if (device.status === NetworkDeviceStatus.NotConfigured) {
        // If device is "Not Configured" just display this label
        content = (
          <>
            <Icon icon="warning-sign" intent="warning"/>
            &nbsp;{tt("lbl_not_configured")}
          </>
        );
      } else {
        // Otherwise, display firmware version
        content = device.firmwareVersion;
      }

      return (
        <Cell loading={isNetworkDeviceLoading(device)} tooltip={isError ? device.error : ""}>
          {content}
        </Cell>
      );
    }
  });

  private buildUpdateTooltip = (device: INetworkDevice) => {
    switch (device.status) {
      case NetworkDeviceStatus.Updateable:
        return tt("msg_network_device_updateable_tooltip");
      case NetworkDeviceStatus.RequiresRecoveryMode:
        return tt("msg_network_device_requires_recovery_mode_tooltip");
      case NetworkDeviceStatus.NotConfigured:
        return tt("msg_network_device_not_configured_tooltip");
      default:
        return tt("msg_network_device_not_updateable_tooltip");
    }
  };

  private wrapCellRenderer(rendererSet: INetworkCellRendererSet): ICellRenderer {
    return (rowIndex) => {
      switch (this.getRowType(rowIndex)) {
        case NetworkRowType.Device:
          return rendererSet.device ? rendererSet.device(this.getDevice(rowIndex)) : <Cell/>;
        case NetworkRowType.DfuTitle:
          return rendererSet.dfuTitle ? rendererSet.dfuTitle() : <Cell/>;
        case NetworkRowType.DfuDevice:
          return rendererSet.dfuDevice ? rendererSet.dfuDevice(this.getDfuDevice(rowIndex)) : <Cell/>;
        default:
          return <Cell/>;
      }
    };
  }

  private getDfuSectionStart(): number {
    const {devices} = this.props;
    return devices.length === 0 ? 0 : devices.length + 1;
  }

  private getRowType(rowIndex: number): NetworkRowType {
    const {devices, dfuDevices} = this.props;
    if (rowIndex < devices.length) {
      return NetworkRowType.Device;
    } else if (dfuDevices.length) {
      const dfuStart = this.getDfuSectionStart();

      if (rowIndex < dfuStart) {
        return NetworkRowType.Empty;
      } else if (rowIndex === dfuStart) {
        return NetworkRowType.DfuTitle;
      } else if ((rowIndex - dfuStart - 1) < dfuDevices.length) {
        return NetworkRowType.DfuDevice;
      }
    }

    return NetworkRowType.Empty;
  }

  private getDevice(rowIndex: number): INetworkDevice {
    return this.props.devices[rowIndex];
  }

  private getDfuDevice(rowIndex: number): IDfuDevice {
    const dfuStart = this.getDfuSectionStart();
    return this.props.dfuDevices[rowIndex - dfuStart - 1];
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    connected: queryIsHasConnectedDevice(state),
    ...queryNetwork(state),
    hasSelectedDfuDevice: queryHasSelectedDfuDevice(state),
    firmwareDownloading: queryIsFirmwareDownloading(state),
    latestFirmwareVersion: queryLatestFirmwareVersion(state),
    firmwareDownloadError: queryFirmwareDownloadError(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    scanCanBus: () => dispatch(scanCanBus()),
    requestFirmwareLoad: () => dispatch(requestFirmwareLoad()),
    selectDevice: (id: DeviceId, selected: boolean) => dispatch(selectNetworkDevice(id, selected)),
    selectDfuDevice: (id: string, selected: boolean) => dispatch(selectDfuDevice(id, selected)),
    selectAllDfuDevices: (selected: boolean) => dispatch(selectAllDfuDevices(selected)),
    showDeviceHelp: (id: DeviceId) => dispatch(showNetworkDeviceHelp(id)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NetworkTab);
