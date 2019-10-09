import * as React from "react";
import {INetworkDevice, NetworkDeviceStatus} from "../state";

const networkDeviceStatusWithHelp = [
  NetworkDeviceStatus.NotConfigured,
  NetworkDeviceStatus.RequiresRecoveryMode,
  NetworkDeviceStatus.RecoveryMode,
];

const recoveryModeInstructions = (
  <ol key="recovery-mode-instructions">
    <li key="1">Unplug the USB cable to your SPARK MAX and, if connected, disconnect main power.</li>
    <li key="2">Press and hold the MODE button on the SPARK MAX with a straightened paper clip or something similar.</li>
    <li key="3">While still holding the MODE button, plug the USB cable back in to the SPARK MAX. You can release the button at this point.</li>
    <li key="4">Press "Scan Bus" button to check that device is in recovery mode</li>
  </ol>
);

export const isNetworkDeviceNeedsHelpText = (device: INetworkDevice) =>
  networkDeviceStatusWithHelp.includes(device.status);

export const renderAllNetworkDevicesHelpText = (devices: INetworkDevice[]) => {
  const notConfigured = devices.filter((device) => device.status === NetworkDeviceStatus.NotConfigured);
  const requiresRecoveryMode = devices.filter((device) => device.status === NetworkDeviceStatus.RequiresRecoveryMode);
  const recoveryMode = devices.filter((device) => device.status === NetworkDeviceStatus.RecoveryMode);

  const help = [];

  if (notConfigured.length) {
    help.push(
      <p key="not-configured">
        Some devices are <b>Not Configured</b>. All Not Configured devices will be forcibly updated on Load.
      </p>
    );
  }
  if (recoveryMode.length) {
    help.push(
      <p key="recovery-mode">
        Some devices are <b>in Recovery Mode</b>. All devices in Recovery Mode will be forcibly updated on Load.
      </p>
    );
  }
  if (requiresRecoveryMode.length) {
    help.push(
      <div key="requires-recovery-mode">
        <p>
          Some devices <b>should be switched into Recovery Mode</b> for this firmware version.<br/>
          Please follow these steps:
        </p>
        {recoveryModeInstructions}
      </div>
    )
  }
  return help;
};

export const renderNetworkDeviceHelpText = (device: INetworkDevice) => (
  <>
    <p>
      Your SPARK MAX requires a recovery update for this firmware version. Please follow these steps:
    </p>
    {recoveryModeInstructions}
  </>
);
