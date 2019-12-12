import {Button, Checkbox, Icon, ProgressBar} from "@blueprintjs/core";
import {Cell, Column, ColumnHeaderCell, ICellProps, ICellRenderer, Table} from "@blueprintjs/table";
import * as React from "react";
import {ReactElement, ReactNode, useCallback} from "react";
import {connect} from "react-redux";
import {
  canBeIdentified,
  getCanIdFromDeviceId,
  getDfuDeviceId,
  getNetworkDeviceVirtualId,
  IApplicationState,
  IDfuDevice,
  INetworkDevice,
  isNetworkDeviceError,
  isNetworkDeviceLoading,
  isNetworkDeviceSelectable,
  NetworkDeviceStatus,
} from "../store/state";
import {
  identifyNetworkDevice,
  requestFirmwareLoad,
  scanCanBus,
  selectAllDfuDevices,
  selectAllNetworkDevices,
  selectDfuDevice,
  selectNetworkDevice,
  showNetworkDeviceHelp,
  SparkDispatch
} from "../store/actions";
import {
  queryFirmwareDownloadError,
  queryHasSelectableDevices,
  queryHasSelectedDfuDevice,
  queryHasSelectedNetworkDevices,
  queryIsAllNetworkDevicesSelected,
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
  isSelectAllDevices: boolean;
  hasSelectedDevices: boolean;
  hasSelectableDevices: boolean;
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

  selectDevice(id: string, selected: boolean): void;

  selectAllDevices(selected: boolean): void;

  selectAllDfuDevices(selected: boolean): void;

  selectDfuDevice(id: string, selected: boolean): void;

  identifyDevice(id: string): void;

  showDeviceHelp(id: string): void;
}

interface INetworkSelectorProps {
  className?: string;
  selected: boolean;
  disabled?: boolean;
  indeterminate?: boolean;

  onSelected(selected: boolean): void;
}

interface INetworkDeviceSelectorProps {
  value: any;
  selected: boolean;
  disabled?: boolean;

  onSelected(value: any, selected: boolean): void;
}

interface IIdentifyButtonProps {
  id: string

  onClick(id: string): void;
}

/**
 * Displays checkbox
 */
const NetworkSelector = (props: INetworkSelectorProps) => {
  const {className, selected, disabled, indeterminate, onSelected} = props;

  const onChange = useCallback((event) => onSelected(event.target.checked), []);

  return <Checkbox className={className}
                   checked={selected}
                   indeterminate={indeterminate}
                   disabled={disabled}
                   onChange={onChange}/>;
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
  virtualDeviceId: string;

  onOpen(id: string): void;
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

const NETWORK_TABLE_COLUMN_WIDTHS = [30, 90, 120, 70, 30, 210];

/**
 * Displays button used to get instructions on how to update firmware.
 */
const NetworkDeviceHowTo = (props: INetworkDeviceHowToProps) => {
  const {virtualDeviceId, onOpen} = props;

  const open = useCallback(() => onOpen(virtualDeviceId), []);

  return <button className="link" onClick={open}>{tt("lbl_how_to")}</button>;
};

const IdentifyButton = (props: IIdentifyButtonProps) => {
  const click = useCallback(() => props.onClick(props.id), [props.id]);

  return (
    <Button minimal={true}
            small={true}
            title={tt("lbl_identify")}
            icon="flash"
            onClick={click}/>
  );
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
                 enableRowHeader={false}
                 minRowHeight={25}
                 maxRowHeight={25}
                 defaultRowHeight={25}
                 numRows={Math.max(length, 10)}
                 columnWidths={NETWORK_TABLE_COLUMN_WIDTHS}>

            <Column name={tt("lbl_update")}
                    className="network-table__update-cell"
                    columnHeaderCellRenderer={this.updateColumnHeaderRenderer}
                    cellRenderer={this.updateColumnRenderer}/>
            <Column name={tt("lbl_interface")} cellRenderer={this.interfaceColumnRenderer}/>
            <Column name={tt("lbl_device")} cellRenderer={this.deviceColumnRenderer}/>
            <Column name={tt("lbl_can_id")} cellRenderer={this.canIdColumnRenderer}/>
            <Column name="" className="network-table__identify-cell" cellRenderer={this.identifyColumnRenderer}/>
            <Column name={tt("lbl_firmware")} cellRenderer={this.firmwareColumnRenderer}/>
          </Table>
        </div>
        <div className="flex-row flex-space-between">
          <Button className="rev-btn"
                  onClick={this.props.scanCanBus}
                  disabled={firmwareLoading}
                  loading={scanInProgress}>{tt("lbl_scan_bus")}</Button>
          <Button className="rev-btn"
                  loading={firmwareLoading || firmwareDownloading}
                  onClick={this.props.requestFirmwareLoad}>{tt("lbl_load_firmware")}</Button>
        </div>
        <div id="firmware-bar">
          {tt("lbl_latest_firmware")}: {firmwareDownloading ? tt("lbl_loading_dots") : latestFirmwareVersion}
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

  private updateColumnHeaderRenderer = () => {
    const {isSelectAllDevices, hasSelectableDevices, hasSelectedDevices, selectAllDevices} = this.props;

    return (
      <ColumnHeaderCell>
        <NetworkSelector className="network-table__selector-header"
                         selected={isSelectAllDevices}
                         disabled={!hasSelectableDevices}
                         indeterminate={hasSelectedDevices && !isSelectAllDevices}
                         onSelected={selectAllDevices}/>
      </ColumnHeaderCell>
    )
  };

  private updateColumnRenderer = this.wrapCellRenderer({
    device: (device) => {
      const {firmwareLoading} = this.props;
      // If device requires recovery mode => display "How To" button,
      // otherwise display checkbox
      const content = device.status === NetworkDeviceStatus.RequiresRecoveryMode ?
        (
          <NetworkDeviceHowTo virtualDeviceId={getNetworkDeviceVirtualId(device)} onOpen={this.props.showDeviceHelp}/>
        )
        : (
          <NetworkDeviceSelector value={getNetworkDeviceVirtualId(device)}
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
        <NetworkSelector selected={false}
                         disabled={true}
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

  private canIdColumnRenderer = this.wrapCellRenderer({
    device: (device) => <Cell className="text-right">{getCanIdFromDeviceId(device.deviceId)}</Cell>,
  });

  private identifyColumnRenderer = this.wrapCellRenderer({
    device: (device) => (
      <Cell>
        <>
          {
            canBeIdentified(device)
            && <IdentifyButton id={getNetworkDeviceVirtualId(device)} onClick={this.props.identifyDevice}/>
          }
        </>
      </Cell>
    ),
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
    hasSelectedDevices: queryHasSelectedNetworkDevices(state),
    isSelectAllDevices: queryIsAllNetworkDevicesSelected(state),
    hasSelectableDevices: queryHasSelectableDevices(state),
    firmwareDownloading: queryIsFirmwareDownloading(state),
    latestFirmwareVersion: queryLatestFirmwareVersion(state),
    firmwareDownloadError: queryFirmwareDownloadError(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    scanCanBus: () => dispatch(scanCanBus()),
    requestFirmwareLoad: () => dispatch(requestFirmwareLoad()),
    selectDevice: (id: string, selected: boolean) => dispatch(selectNetworkDevice(id, selected)),
    selectAllDevices: (selected: boolean) => dispatch(selectAllNetworkDevices(selected)),
    selectDfuDevice: (id: string, selected: boolean) => dispatch(selectDfuDevice(id, selected)),
    selectAllDfuDevices: (selected: boolean) => dispatch(selectAllDfuDevices(selected)),
    identifyDevice: (id: string) => dispatch(identifyNetworkDevice(id)),
    showDeviceHelp: (id: string) => dispatch(showNetworkDeviceHelp(id)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NetworkTab);
