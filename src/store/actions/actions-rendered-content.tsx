/**
 * This file defines content rendered in actions
 */

import * as React from "react";
import {INetworkDevice, NetworkDeviceStatus} from "../state";
import {
  networkDeviceNotConfigured,
  networkDeviceRecoveryModeHowTo,
  networkDeviceRequiresRecoveryMode
} from "../../mls/content";

const networkDeviceStatusWithHelp = [
  NetworkDeviceStatus.NotConfigured,
  NetworkDeviceStatus.RequiresRecoveryMode,
];

export const isNetworkDeviceNeedsHelpText = (device: INetworkDevice) =>
  networkDeviceStatusWithHelp.includes(device.status);

export const renderAllNetworkDevicesHelpText = (devices: INetworkDevice[]) => {
  const notConfigured = devices.filter((device) => device.status === NetworkDeviceStatus.NotConfigured);
  const requiresRecoveryMode = devices.filter((device) => device.status === NetworkDeviceStatus.RequiresRecoveryMode);

  const help = [];

  if (notConfigured.length) {
    help.push(<React.Fragment key="not-configured">{networkDeviceNotConfigured}</React.Fragment>);
  }
  if (requiresRecoveryMode.length) {
    help.push(<React.Fragment key="requires-recovery-mode">{networkDeviceRequiresRecoveryMode}</React.Fragment>);
  }
  return help;
};

export const renderNetworkDeviceHelpText = (device: INetworkDevice) => networkDeviceRecoveryModeHowTo;
