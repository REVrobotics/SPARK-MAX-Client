import {initial} from "lodash";
import {
  createDfuDevice,
  createNetworkDevice,
  DeviceId,
  FirmwareTag,
  getNetworkDeviceId,
  isNetworkDeviceNeedFirmwareVersion,
  isNetworkDeviceSelected,
  NetworkDeviceStatus,
  toDtoDeviceId
} from "../state";
import {SparkAction} from "./action-types";
import SparkManager from "../../managers/SparkManager";
import {
  consoleOutput,
  setConsoleOutput,
  setFirmwareLoading,
  setLastFirmwareLoadingMessage,
  setNetworkDevices,
  setNetworkScanInProgress,
  updateFirmwareLoadingProgress,
  updateGlobalIsProcessing,
  updateGlobalProcessStatus,
  updateNetworkDevice
} from "./atom-actions";
import {concatMapPromises} from "../../utils/promise-utils";
import {
  queryConnectedDescriptor,
  queryConsoleOutput,
  queryDfuDevicesToUpdate,
  queryFirmwareByTag,
  queryLastFirmwareLoadingMessage,
  queryNetworkDevice,
  queryNetworkDevices, querySelectableNetworkDevices
} from "../selectors";
import {compareVersions} from "../../utils/string-utils";
import {FirmwareResponseDto, getErrorText, hasError} from "../../models/dto";
import {showAlert, showToastError, showToastSuccess} from "./ui-actions";
import {Intent} from "@blueprintjs/core";
import {
  isNetworkDeviceNeedsHelpText,
  renderAllNetworkDevicesHelpText,
  renderNetworkDeviceHelpText
} from "./actions-rendered-content";
import {onError, useErrorHandler} from "./error-actions";
import {ApplicationError} from "../../models/errors";
import {connectDevice} from "./connection-actions";

/**
 * Selects firmware and starts loading process
 */
export const requestFirmwareLoad = (): SparkAction<Promise<any>> => {
  return (dispatch, getState) => {
    const deviceIds = queryNetworkDevices(getState())
      .filter(isNetworkDeviceSelected)
      .map(getNetworkDeviceId);

    const dfuDeviceIds = queryDfuDevicesToUpdate(getState());

    if (deviceIds.length === 0 && dfuDeviceIds.length === 0) {
      showToastError(tt("msg_no_device_selected"));
      return Promise.resolve();
    }

    const connectedDescriptor = queryConnectedDescriptor(getState());

    // Select firmware file to load
    return SparkManager.requestFirmware()
      // Start firmware loading
      .then((paths) => {
        dispatch(setFirmwareLoading(true));
        const path = paths[0];
        // Start loading only if user selected firmware
        if (path) {
          return dispatch(loadFirmware(path, deviceIds, dfuDeviceIds))
            .then(() => {
              if (connectedDescriptor) {
                dispatch(consoleOutput(tt("msg_console_output:connect_to_controller")));
                return dispatch(connectDevice(connectedDescriptor));
              } else {
                return Promise.resolve();
              }
            });
        } else {
          return Promise.resolve();
        }
      })
      .finally(() => {
        dispatch(setFirmwareLoading(false));
        dispatch(consoleOutput(tt("msg_console_output:rescan")));
        dispatch(scanCanBus());
      });
  };
};

/**
 * Starts loading process
 */
const loadFirmware = (path: string, deviceIds: DeviceId[], dfuDeviceIds: string[]): SparkAction<Promise<any>> => {
  return (dispatch) => {
    dispatch(consoleOutput(tt("msg_console_output:loading_firmware", {path})));
    dispatch(updateGlobalIsProcessing(true));
    dispatch(updateGlobalProcessStatus(tt("lbl_status_loading_firmware")));

    return dispatch(updateOrRecoverFirmware(false, path, deviceIds.map(toDtoDeviceId)))
      .then(() => dispatch(updateOrRecoverFirmware(true, path, dfuDeviceIds)))
      .finally(() => {
        dispatch(updateGlobalIsProcessing(false));
        dispatch(updateGlobalProcessStatus(""));
      });
  };
};

/**
 * Main firmware loading logic. This action either update or recover target devices.
 */
const updateOrRecoverFirmware = (recover: boolean, path: string, ids: string[]): SparkAction<Promise<any>> => {
  return (dispatch) => {
    if (ids.length === 0) {
      return Promise.resolve();
    }

    return SparkManager.loadFirmware(recover, path, ids)
      .then((res) => {
        if (res.updateComplete && !res.updateCompletedSuccessfully || hasError(res)) {
          showToastError(tt(recover ? "msg_firmware_cannot_be_recovered" : "msg_firmware_cannot_be_updated"));
          dispatch(firmwareLoadingError(getErrorText(res)));
          dispatch(firmwareLoadingError());
        } else {
          showToastSuccess(tt(recover ? "msg_firmware_recovered" : "msg_firmware_updated"));
          dispatch(consoleOutput(tt(recover ?
            "msg_console_output:successfully_recovered_firmware"
            : "msg_console_output:successfully_updated_firmware")));
          dispatch(updateFirmwareLoadingProgress(0, ""));
        }
      })
      // Rescan CAN bus to actualize data on Network tab
      .catch(onError((error: any) => {
        dispatch(firmwareLoadingError(error));
        dispatch(firmwareLoadingError());
      }))
      .catch(useErrorHandler(dispatch));
  }
};

/**
 * Completes loading process with error
 */
const firmwareLoadingError = (error?: string): SparkAction<void> => {
  return (dispatch) => {
    const msg = tt("msg_console_output:error", {
      message: error ? error : tt("msg_loading_error"),
    });
    dispatch(consoleOutput(msg));
    dispatch(updateFirmwareLoadingProgress(0, ""));
  };
};

/**
 * Updates progress of loading
 */
export const updateLoadFirmwareProgress = (error: any,
                                           recover: boolean,
                                           response: FirmwareResponseDto): SparkAction<void> => {
  return (dispatch, getState) => {
    if (response.updateStarted) {
      dispatch(consoleOutput(tt(recover ?
        "msg_console_output:started_firmware_recover"
        : "msg_console_output:started_firmware_update")));
    } else if (response.isUpdating) {
      let updatedOutput = queryConsoleOutput(getState());
      if (response.updateStagePercent != null) {
        updatedOutput = initial(updatedOutput);
        const percentComplete: number = parseFloat(response.updateStagePercent.toFixed(3));

        dispatch(updateFirmwareLoadingProgress(
          percentComplete,
          tt("lbl_firmware_loading_progress", {
            progress: (percentComplete * 100).toFixed(1),
            message: response.updateStageMessage,
          })));

        updatedOutput = updatedOutput.concat([
          tt("msg_console_output:firmware_loading_progress", {
            progress: (percentComplete * 100).toFixed(1),
            message: response.updateStageMessage,
          }),
        ]);
      } else if (response.updateStageMessage != null) {
        const lastMessage = queryLastFirmwareLoadingMessage(getState());
        if (lastMessage !== response.updateStageMessage) {
          updatedOutput.push(tt("msg_console_output:firmware_loading_progress", {
            progress: "0.0",
            message: response.updateStageMessage,
          }));
        }
      }

      dispatch(setLastFirmwareLoadingMessage(response.updateStageMessage || ""));
      dispatch(setConsoleOutput(updatedOutput));
    }
  };
};

/**
 * Scans the bus of currently connected device
 */
export const scanCanBus = (): SparkAction<Promise<any>> => {
  return (dispatch, getState) => {
    dispatch(updateGlobalIsProcessing(true));
    dispatch(updateGlobalProcessStatus(tt("lbl_status_scanning_can_bus")));
    dispatch(setNetworkScanInProgress(true));
    dispatch(setNetworkDevices([], []));

    return SparkManager.listAllDevices()
      .then(({extendedList, dfuDevice}) => {
        // Get the version that require recovery update
        const recoveryVersion = queryFirmwareByTag(getState(), FirmwareTag.RecoveryUpdateRequired);

        // All devices connected via CAN bus
        const devices = extendedList.map(createNetworkDevice);
        dispatch(setNetworkDevices(devices, dfuDevice.map(createDfuDevice)));

        // All updateable devices connected via CAN bus
        const updateableDevices = devices.filter(isNetworkDeviceNeedFirmwareVersion);

        // Load firmware for each updateable device one by one
        return concatMapPromises(
          updateableDevices,
          (device) => {
            const deviceId = getNetworkDeviceId(device);

            return SparkManager.getFirmware(toDtoDeviceId(deviceId))
              // Determine status of device based on retrieved firmware version
              .then((response) => {
                const firmwareVersion = response.version!.substring(1);

                if (recoveryVersion && compareVersions(firmwareVersion, recoveryVersion.version) < 0) {
                  dispatch(updateNetworkDevice(deviceId, {
                    loading: false,
                    firmwareVersion,
                    status: NetworkDeviceStatus.RequiresRecoveryMode,
                  }));
                } else {
                  dispatch(updateNetworkDevice(deviceId, {
                    loading: false,
                    firmwareVersion,
                    status: NetworkDeviceStatus.Updateable,
                  }));
                }
              })
              // If we cannot load firmware for some device we mark it with "error" status
              .catch((error) => dispatch(updateNetworkDevice(deviceId, {
                loading: false,
                status: NetworkDeviceStatus.Error,
                error: ApplicationError.from(error).message,
              })));
          });
      })
      .then(() => {
        // Completes scanning process
        dispatch(setNetworkScanInProgress(false));
        dispatch(updateGlobalIsProcessing(false));
        dispatch(updateGlobalProcessStatus(""));
      })
      .then(() => {
        // Displays help dialog, if necessary
        const devices = queryNetworkDevices(getState()).filter(isNetworkDeviceNeedsHelpText);

        if (devices.length === 0) {
          return;
        }

        return dispatch(showAlert({
          content: renderAllNetworkDevicesHelpText(devices),
          intent: Intent.WARNING,
          okLabel: tt("lbl_close"),
        }));
      })
      .catch(useErrorHandler(dispatch));
  };
};

/**
 * Checks if any device on CAN bus has obsoleted version.
 */
export const findObsoletedDevice = (): SparkAction<Promise<boolean>> =>
  (dispatch, getState) => {
    return SparkManager.listAllDevices()
      .then(({extendedList}) => {
        // Get the latest firmware version
        const latestVersion = queryFirmwareByTag(getState(), FirmwareTag.Latest);

        // Find all updateable devices
        const updateableDevices = extendedList.map(createNetworkDevice).filter(isNetworkDeviceNeedFirmwareVersion);

        // Load firmware for each updateable device one by one
        return concatMapPromises(
          updateableDevices,
          (device) => {
            const deviceId = getNetworkDeviceId(device);

            return SparkManager.getFirmware(toDtoDeviceId(deviceId))
              .then((response) => {
                const firmwareVersion = response.version!.substring(1);
                // Check if device has the latest version
                return latestVersion && compareVersions(firmwareVersion, latestVersion.version) < 0;
              });
          })
      })
      .then((obsoletes) => obsoletes.some(Boolean))
      .catch(useErrorHandler(dispatch));
  };

export const selectNetworkDevice = (id: DeviceId, selected: boolean): SparkAction<void> => {
  return (dispatch) => dispatch(updateNetworkDevice(id, {selected}));
};

export const selectAllNetworkDevices = (selected: boolean): SparkAction<void> => {
  return (dispatch, getState) => {
    const devices = querySelectableNetworkDevices(getState());
    devices.forEach((device) => dispatch(updateNetworkDevice(getNetworkDeviceId(device), {selected})));
  };
};

/**
 * Shows help dialog for specific device.
 */
export const showNetworkDeviceHelp = (id: DeviceId): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    const device = queryNetworkDevice(getState(), id);

    if (device == null) {
      return Promise.resolve();
    }

    return dispatch(showAlert({
      content: renderNetworkDeviceHelpText(device),
      intent: Intent.WARNING,
      okLabel: tt("lbl_close"),
    }));
  };
