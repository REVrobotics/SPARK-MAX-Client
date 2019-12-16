import classNames from "classnames";
import {Button, Icon, Intent, Popover, PopoverInteractionKind, PopoverPosition} from "@blueprintjs/core";
import * as React from "react";
import {useCallback, useState} from "react";
import {connect} from "react-redux";
import {
  canBeIdentified,
  DeviceBlockedReason,
  getVirtualDeviceId,
  IApplicationState,
  IDeviceState, INetworkDevice,
  isDeviceBlocked,
  PathDescriptor
} from "../store/state";
import {
  connectToSelectedDevice,
  disconnectCurrentDevice,
  identifySelectedDevice,
  selectDevice,
  SparkDispatch,
  SYNC_ALL_AND_SHOW_NOTIFICATIONS,
  syncDevices
} from "../store/actions";
import {
  querySelectedNetworkDevice,
  queryConnectedDescriptor,
  queryDescriptorsInOrder,
  queryDevicesInOrder,
  queryHasGlobalError,
  queryHasRunningDevices,
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
import {stopAllDevices} from "../store/actions/display-actions";

interface IProps {
  selectedDevice?: IDeviceState,
  descriptors: PathDescriptor[],
  devices: IDeviceState[],
  selectedNetworkDevice?: INetworkDevice,
  processStatus: string,
  processing: boolean,
  connected: boolean,
  connectedDescriptor?: PathDescriptor;
  connectable: boolean,
  hasGlobalError: boolean;
  blockedReason?: DeviceBlockedReason;
  hasRunningDevices: boolean;

  onConnect(): void;

  onDisconnect(): void;

  onRescan(): void;

  onIdentify(): void;

  onSelectDevice(device: IDeviceState): void;

  onStopAll(): void;
}

const getBlockedReasonText = (reason: DeviceBlockedReason) => {
  switch (reason) {
    case DeviceBlockedReason.NotConfigured:
      return tt("lbl_device_not_configured");
    case DeviceBlockedReason.Invalid:
      return tt("lbl_device_invalid_can_id")
  }
};

/**
 * This component determines behavior of button located in the top right corner of the screen.
 * When no connected device => it is "Connect" button.
 * When any device is connected and running => it is "Stop All" button.
 * When some device is connected, but not running => it is "Disconnect" button.
 *
 * This button guarantees that user always see "Stop" button when some device is running.
 */
const MainAction = (props: IProps) => {
  const {
    processing, connected, connectable,
    hasRunningDevices,
    onConnect, onDisconnect, onStopAll,
  } = props;

  const disabled = hasRunningDevices ? false : (!connectable || processing);
  const loading = hasRunningDevices ? false : processing;
  const action = hasRunningDevices ? onStopAll : (connected ? onDisconnect : onConnect);
  const text = hasRunningDevices ? tt("lbl_stop_all") : (connected ? tt("lbl_disconnect") : tt("lbl_connect"));
  const tooltip = hasRunningDevices ? tt("lbl_stop_all_tooltip") : undefined;
  const icon = hasRunningDevices ? "stop" : undefined;
  const intent = hasRunningDevices ? Intent.DANGER : undefined;

  return (
    <Button fill={true}
            icon={icon}
            intent={intent}
            disabled={disabled}
            loading={loading}
            title={tooltip}
            onClick={action}>
      {text}
    </Button>
  );
};

const ConnectionStatusBar = (props: IProps) => {
  const {
    devices, selectedDevice, blockedReason, processStatus, connected, hasGlobalError,
    descriptors, connectedDescriptor, selectedNetworkDevice,
    onSelectDevice, onRescan, onIdentify,
  } = props;

  const displayGlobalError = processStatus ? false : hasGlobalError;
  const canIdentify = selectedNetworkDevice ? canBeIdentified(selectedNetworkDevice) : false;
  const isOldVersion = selectedDevice && selectedDevice.isLoaded ? !canIdentify : false;

  const [isSelectOpened, setSelectOpened] = useState(false);
  const onDeviceSelectOpened = useCallback(() => setSelectOpened(true), []);
  const onDeviceSelectClosed = useCallback(() => setSelectOpened(false), []);

  const getDevicePrefix = useCallback((device: IDeviceState) => {
    if (descriptors.length > 1) {
      return `(${descriptors.indexOf(device.descriptor) + 1})`;
    } else {
      return "";
    }
  }, [descriptors]);
  const getDeviceSuffix = useCallback(
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
      <Button minimal={true}
              small={true}
              disabled={!canIdentify}
              title={isOldVersion ? tt("lbl_identify_disabled") : tt("lbl_identify")}
              icon="flash"
              onClick={onIdentify}/>
      <DeviceSelect className="status-bar__device-selector"
                    devices={devices}
                    getPrefix={getDevicePrefix}
                    getMarker={getDeviceSuffix}
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
        <MainAction {...props}/>
      </div>
    </div>
  );
};

export function mapStateToProps(state: IApplicationState) {
  return {
    selectedDevice: querySelectedDevice(state),
    devices: queryDevicesInOrder(state),
    selectedNetworkDevice: querySelectedNetworkDevice(state),
    descriptors: queryDescriptorsInOrder(state),
    connected: queryIsSelectedDeviceConnected(state),
    connectedDescriptor: queryConnectedDescriptor(state),
    hasGlobalError: queryHasGlobalError(state),
    blockedReason: querySelectedDeviceBlockedReason(state),
    processing: queryIsInProcessing(state),
    connectable: queryIsConnectableToAnyDevice(state),
    processStatus: queryProcessStatus(state),
    hasRunningDevices: queryHasRunningDevices(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    onConnect: () => dispatch(connectToSelectedDevice()),
    onDisconnect: () => dispatch(disconnectCurrentDevice()),
    onRescan: () => dispatch(syncDevices(SYNC_ALL_AND_SHOW_NOTIFICATIONS)),
    onIdentify: () => dispatch(identifySelectedDevice()),
    onSelectDevice: (device: IDeviceState) => dispatch(selectDevice(getVirtualDeviceId(device))),
    onStopAll: () => dispatch(stopAllDevices()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionStatusBar);
