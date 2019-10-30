import classNames from "classnames";
import {Button, Icon, Intent, Popover, PopoverInteractionKind, PopoverPosition} from "@blueprintjs/core";
import * as React from "react";
import {useCallback, useState} from "react";
import {connect} from "react-redux";
import {
  DeviceBlockedReason,
  getVirtualDeviceId,
  IApplicationState,
  IDeviceState,
  isDeviceBlocked,
  PathDescriptor
} from "../store/state";
import {
  connectToSelectedDevice,
  disconnectCurrentDevice,
  selectDevice,
  SparkDispatch,
  syncDevices
} from "../store/actions";
import {
  queryConnectedDescriptor,
  queryDevicesInOrder,
  queryHasGlobalError,
  queryIsConnectableToAnyDevice,
  queryIsInProcessing,
  queryIsSelectedDeviceConnected,
  queryProcessStatus,
  querySelectedDevice,
  querySelectedDeviceBlockedReason
} from "../store/selectors";
import {DeviceSelect} from "./DeviceSelect";
import {InfoIcon} from "../icons";
import {Message} from "../models/Message";

interface IProps {
  selectedDevice?: IDeviceState,
  devices: IDeviceState[],
  processStatus: string,
  processing: boolean,
  connected: boolean,
  connectedDescriptor?: PathDescriptor;
  connectable: boolean,
  hasGlobalError: boolean;
  blockedReason?: DeviceBlockedReason;

  onConnect(): void;

  onDisconnect(): void;

  onRescan(): void;

  onSelectDevice(device: IDeviceState): void;
}

const getBlockedReasonText = (reason: DeviceBlockedReason) => {
  switch (reason) {
    case DeviceBlockedReason.NotConfigured:
      return tt("lbl_device_not_configured");
    case DeviceBlockedReason.Invalid:
      return tt("lbl_device_invalid_can_id")
  }
};

const ConnectionStatusBar = (props: IProps) => {
  const {
    devices, selectedDevice, blockedReason, processing, processStatus, connected, connectable, hasGlobalError,
    connectedDescriptor,
    onConnect, onDisconnect, onSelectDevice, onRescan,
  } = props;

  const displayGlobalError = processStatus ? false : hasGlobalError;

  const [isSelectOpened, setSelectOpened] = useState(false);
  const onDeviceSelectOpened = useCallback(() => setSelectOpened(true), []);
  const onDeviceSelectClosed = useCallback(() => setSelectOpened(false), []);

  const getDeviceMarker = useCallback(
    (device: IDeviceState) => {
      if (device.descriptor !== connectedDescriptor) {
        return Message.info("lbl_not_connected_lc");
      } else if (isDeviceBlocked(device)) {
        return Message.error("lbl_configuration_issue_lc");
      } else {
        return;
      }
    },
    [connectedDescriptor]);

  const statusBarConnectionClass = classNames("status-bar__connection", {
    "status-bar__connection--connected": connected,
    "status-bar__connection--disconnected": !connected && selectedDevice,
  });

  const deviceInfo = selectedDevice ?
    <div className="device-info">
      <div className="device-info__line">
        <div className="device-info__line-title">{tt("lbl_interface")}</div>
        {selectedDevice.info.interfaceName}
      </div>
      <div className="device-info__line">
        <div className="device-info__line-title">{tt("lbl_device_id")}</div>
        {selectedDevice.fullDeviceId}
      </div>
      <div className="device-info__line">
        <div className="device-info__line-title">{tt("lbl_device_name")}</div>
        {selectedDevice.info.deviceName}
      </div>
      <div className="device-info__line">
        <div className="device-info__line-title">{tt("lbl_driver_name")}</div>
        {selectedDevice.info.driverName}
      </div>
      <div className="device-info__line">
        <div className="device-info__line-title">{tt("lbl_status")}</div>
        {connected ? tt("lbl_connected") : tt("lbl_not_connected")}
        {
          blockedReason ?
            (
              <>
                ,
                <div className="device-info__blocked-reason">
                  {getBlockedReasonText(blockedReason)}
                </div>
              </>
            )
            : null
        }
      </div>
    </div>
    : null;
  return (
    <div id="status-bar" className="no-wrap">
      <Popover canEscapeKeyClose={false}
               position={PopoverPosition.BOTTOM_LEFT}
               interactionKind={PopoverInteractionKind.HOVER}
               disabled={!selectedDevice || isSelectOpened}>
        <div className="status-bar__info">
          <InfoIcon size={28}/>
          <div className={statusBarConnectionClass}/>
          {
            blockedReason ?
              <Icon icon="error" iconSize={14} intent={Intent.DANGER} className="status-bar__error"/>
              : null
          }
        </div>
        {deviceInfo}
      </Popover>
      <DeviceSelect className="status-bar__device-selector"
                    devices={devices}
                    getMarker={getDeviceMarker}
                    selected={selectedDevice}
                    disabled={devices.length <= 1}
                    onSelect={onSelectDevice}
                    onOpened={onDeviceSelectOpened}
                    onClosed={onDeviceSelectClosed}/>
      <Button minimal={true}
              small={true}
              title={tt("lbl_rescan")}
              icon="refresh"
              onClick={onRescan}/>
      <div className={classNames("status-bar__status", {"status-bar__status--global-error": displayGlobalError})}>
        {
          displayGlobalError ?
            (
              <>
                <Icon icon="warning-sign" intent={Intent.DANGER}/>
                {tt("lbl_global_config_error")}
              </>
            )
            : processStatus
        }
      </div>
      <div className="status-bar__button">
        <Button fill={true} disabled={!connectable || processing} loading={processing}
                onClick={connected ? onDisconnect : onConnect}>
          {connected ? tt("lbl_disconnect") : tt("lbl_connect")}
        </Button>
      </div>
    </div>
  );
};

export function mapStateToProps(state: IApplicationState) {
  return {
    selectedDevice: querySelectedDevice(state),
    devices: queryDevicesInOrder(state),
    connected: queryIsSelectedDeviceConnected(state),
    connectedDescriptor: queryConnectedDescriptor(state),
    hasGlobalError: queryHasGlobalError(state),
    blockedReason: querySelectedDeviceBlockedReason(state),
    processing: queryIsInProcessing(state),
    connectable: queryIsConnectableToAnyDevice(state),
    processStatus: queryProcessStatus(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    onConnect: () => dispatch(connectToSelectedDevice()),
    onDisconnect: () => dispatch(disconnectCurrentDevice()),
    onRescan: () => dispatch(syncDevices()),
    onSelectDevice: (device: IDeviceState) => dispatch(selectDevice(getVirtualDeviceId(device))),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionStatusBar);
