import * as React from "react";

export const troubleshootContent = (
  <ol>
    <li>Try restarting the program.</li>
    <li>After restarting the program, unplug the usb from the computer and plug it in again.</li>
    <li>Make sure you're using the latest version of the SPARK MAX Client.</li>
    <li>Contact <a href="mailto:support@revrobotics.com">support@revrobotics.com</a></li>
  </ol>
);

export const recoveryModeInstructions = (
  <ol>
    <li>Unplug the USB cable to your SPARK MAX and, if connected, disconnect main power.</li>
    <li>Press and hold the MODE button on the SPARK MAX with a pen or similar.</li>
    <li>While still holding the MODE button, plug the USB cable back in to the SPARK MAX. You can release the button at
      this point.
    </li>
    <li>Press the "Scan Bus" button to check that the device is in recovery mode</li>
  </ol>
);

export const networkDeviceNotConfigured = (
  <p>
    Some devices are <b>Not Configured</b> and are automatically selected.
  </p>
);

export const networkDeviceRequiresRecoveryMode = (
  <>
    <p>
      Some devices <b>should be switched into Recovery Mode</b> for this firmware version.<br/>
      Please follow these steps:
    </p>
    {recoveryModeInstructions}
  </>
);

export const networkDeviceRecoveryModeHowTo = (
  <>
    <p>
      Your SPARK MAX requires a recovery update for this firmware version. Please follow these steps:
    </p>
    {recoveryModeInstructions}
  </>
);

export const networkLoadSuccess = ({success, failed}: { success: number, failed: number }) =>
  <>
    Successfully updated {success} device(s).
  </>;

export const networkLoadError = ({success, failed}: { success: number, failed: number }) =>
  <>
    <p>
      Successfully updated {success} device(s).
    </p>
    <p>
    Failed to updated devices, may require a recovery update following these steps: 
    </p>
    {recoveryModeInstructions}
  </>;
