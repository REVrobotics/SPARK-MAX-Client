import classNames from "classnames";
import {Button, Icon, Intent, Popover, PopoverInteractionKind, PopoverPosition} from "@blueprintjs/core";
import * as React from "react";
import {useCallback, useState} from "react";
import {connect} from "react-redux";
import {DeviceBlockedReason, getVirtualDeviceId, IApplicationState, IDeviceState} from "../store/state";
import {connectToSelectedDevice, disconnectCurrentDevice, selectDevice, SparkDispatch} from "../store/actions";
import {
  queryDevicesInOrder, queryHasGlobalError,
  queryIsConnectableToAnyDevice,
  queryIsInProcessing,
  queryIsSelectedDeviceConnected,
  queryProcessStatus,
  querySelectedDevice,
  querySelectedDeviceBlockedReason
} from "../store/selectors";
import {DeviceSelect} from "./DeviceSelect";
import {InfoIcon} from "../icons";

interface IProps {
  selectedDevice?: IDeviceState,
  devices: IDeviceState[],
  connectionStatus: string,
  processing: boolean,
  connected: boolean,
  connectable: boolean,
  hasGlobalError: boolean;
  blockedReason?: DeviceBlockedReason;

  onConnect(): void;

  onDisconnect(): void;

  onSelectDevice(device: IDeviceState): void;
}

const getBlockedReasonText = (reason: DeviceBlockedReason) => {
  switch (reason) {
    case DeviceBlockedReason.NotConfigured:
      return "Not Configured";
    case DeviceBlockedReason.Invalid:
      return "CAN ID overlaps with other device on a bus"
  }
};

const ConnectionStatusBar = (props: IProps) => {
  const {
    devices, selectedDevice, blockedReason, processing, connectionStatus, connected, connectable, hasGlobalError,
    onConnect, onDisconnect, onSelectDevice,
  } = props;

  const displayGlobalError = connectionStatus ? false : hasGlobalError;

  const [isSelectOpened, setSelectOpened] = useState(false);
  const onDeviceSelectOpened = useCallback(() => setSelectOpened(true), []);
  const onDeviceSelectClosed = useCallback(() => setSelectOpened(false), []);

  const statusBarConnectionClass = classNames("status-bar__connection", {
    "status-bar__connection--connected": connected,
    "status-bar__connection--disconnected": !connected,
  });

  const deviceInfo = selectedDevice ?
    <div className="device-info">
      <div className="device-info__line">
        <div className="device-info__line-title">Interface</div>
        {selectedDevice.info.interfaceName}
      </div>
      <div className="device-info__line">
        <div className="device-info__line-title">Device ID</div>
        {selectedDevice.fullDeviceId}
      </div>
      <div className="device-info__line">
        <div className="device-info__line-title">Device Name</div>
        {selectedDevice.info.deviceName}
      </div>
      <div className="device-info__line">
        <div className="device-info__line-title">Driver Name</div>
        {selectedDevice.info.driverName}
      </div>
      <div className="device-info__line">
        <div className="device-info__line-title">Status</div>
        {connected ? "Connected" : "Not Connected"}
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
                    selected={selectedDevice}
                    disabled={devices.length <= 1}
                    onSelect={onSelectDevice}
                    onOpened={onDeviceSelectOpened}
                    onClosed={onDeviceSelectClosed}/>
      <div className={classNames("status-bar__status", {"status-bar__status--global-error": displayGlobalError})}>
        {
          displayGlobalError ?
            (
              <>
                <Icon icon="warning-sign" intent={Intent.DANGER}/>
                Some devices have issues
              </>
            )
            : connectionStatus
        }
      </div>
      <div className="status-bar__button">
        <Button fill={true} disabled={!connectable || processing} loading={processing}
                onClick={connected ? onDisconnect : onConnect}>
          {connected ? "Disconnect" : "Connect"}
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
    hasGlobalError: queryHasGlobalError(state),
    blockedReason: querySelectedDeviceBlockedReason(state),
    processing: queryIsInProcessing(state),
    connectable: queryIsConnectableToAnyDevice(state),
    connectionStatus: queryProcessStatus(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    onConnect: () => dispatch(connectToSelectedDevice()),
    onDisconnect: () => dispatch(disconnectCurrentDevice()),
    onSelectDevice: (device: IDeviceState) => dispatch(selectDevice(getVirtualDeviceId(device))),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionStatusBar);
