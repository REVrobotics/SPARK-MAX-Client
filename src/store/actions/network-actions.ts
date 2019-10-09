import {initial, isString} from "lodash";
import {
  createNetworkDevice,
  DeviceId,
  FirmwareTag,
  fromDeviceId,
  getNetworkDeviceId,
  isNetworkDeviceNeedFirmwareVersion,
  isNetworkDeviceSelected,
  NetworkDeviceStatus
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
import {concatMapPromises, logError} from "../../utils/promise-utils";
import {
  queryConsoleOutput,
  queryFirmwareByTag,
  queryLastFirmwareLoadingMessage, queryNetworkDevice,
  queryNetworkDevices
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

export const requestFirmwareLoad = (): SparkAction<Promise<any>> => {
  return (dispatch, getState) => {
    const deviceIds = queryNetworkDevices(getState())
      .filter(isNetworkDeviceSelected)
      .map(getNetworkDeviceId);

    if (deviceIds.length === 0) {
      showToastError("No one device is selected");
      return Promise.resolve();
    }

    // Select firmware file to load
    return SparkManager.requestFirmware()
      // Start firmware loading
      .then((paths) => {
        dispatch(setFirmwareLoading(true));
        const path = paths[0];
        // Start loading only if user selected firmware
        if (path) {
          return dispatch(loadFirmware(path, deviceIds))
            .then(() => {
              dispatch(consoleOutput("[INFO] Connecting back to controller..."));
            });
        } else {
          return Promise.resolve();
        }
      })
      .finally(() => {
        dispatch(setFirmwareLoading(false));
        dispatch(consoleOutput("[INFO] Rescan list of devices"));
        dispatch(scanCanBus());
      });
  };
};

const loadFirmware = (path: string, deviceIds: DeviceId[]): SparkAction<Promise<any>> => {
  return (dispatch) => {
    dispatch(consoleOutput(`[INFO] Loading firmware from ${path}`));
    dispatch(updateGlobalIsProcessing(true));
    dispatch(updateGlobalProcessStatus("LOADING FIRMWARE..."));

    return SparkManager.loadFirmware(path, deviceIds.map(fromDeviceId))
      .then((res) => {
        if (res.updateComplete && !res.updateCompletedSuccessfully || hasError(res)) {
          showToastError("Firmware could not be updated. Look at console log for details");
          dispatch(firmwareLoadingError(getErrorText(res)));
          dispatch(firmwareLoadingError());
        } else {
          showToastSuccess("Firmware was successfully updated");
          dispatch(consoleOutput("[INFO] Successfully updated firmware."));
          dispatch(updateFirmwareLoadingProgress(0, ""));
        }
      })
      // Rescan CAN bus to actualize data on Network tab
      .catch((error: any) => {
        dispatch(firmwareLoadingError(error));
        dispatch(firmwareLoadingError());
      });
  };
};

const firmwareLoadingError = (error?: string): SparkAction<void> => {
  return (dispatch) => {
    const msg: string = "[ERROR] " + (typeof error !== "undefined" ? error : "Error loading firmware. Please disconnect the SPARK MAX controller, and try again.");
    dispatch(consoleOutput(msg));
    dispatch(updateFirmwareLoadingProgress(0, ""));
    dispatch(updateGlobalIsProcessing(false));
    dispatch(updateGlobalProcessStatus(""));
  };
};

export const updateLoadFirmwareProgress = (error: any, response: FirmwareResponseDto): SparkAction<void> => {
  return (dispatch, getState) => {
    if (response.updateStarted) {
      dispatch(consoleOutput("[INFO] Started firmware update process..."));
    } else if (response.isUpdating) {
      let updatedOutput = queryConsoleOutput(getState());
      if (response.updateStagePercent != null) {
        updatedOutput = initial(updatedOutput);
        const percentComplete: number = parseFloat(response.updateStagePercent.toFixed(3));

        dispatch(updateFirmwareLoadingProgress(
          percentComplete,
          `${response.updateStageMessage} - (${(percentComplete * 100).toFixed(1)}%)`));

        updatedOutput = updatedOutput.concat([
          `[INFO] (${(percentComplete * 100).toFixed(1)}%) ${response.updateStageMessage}`,
        ]);
      } else if (response.updateStageMessage != null) {
        const lastMessage = queryLastFirmwareLoadingMessage(getState());
        if (lastMessage !== response.updateStageMessage) {
          updatedOutput.push(`[INFO] (0.0%) ${response.updateStageMessage}`);
        }
      }

      dispatch(setLastFirmwareLoadingMessage(response.updateStageMessage));
      dispatch(setConsoleOutput(updatedOutput));
    }
  };
};

export const scanCanBus = (): SparkAction<Promise<any>> => {
  return (dispatch, getState) => {
    dispatch(updateGlobalIsProcessing(true));
    dispatch(updateGlobalProcessStatus("SCANNING CAN BUS"));
    dispatch(setNetworkScanInProgress(true));
    dispatch(setNetworkDevices([]));

    return SparkManager.listAllDevices()
      .then(({extendedList}) => {
        const recoveryVersion = queryFirmwareByTag(getState(), FirmwareTag.RecoveryUpdateRequired);

        const devices = extendedList.map(createNetworkDevice);
        dispatch(setNetworkDevices(devices));

        const updateableDevices = devices.filter(isNetworkDeviceNeedFirmwareVersion);
        // Load firmware for each updateable device
        return concatMapPromises(
          updateableDevices,
          (device) => {
            const deviceId = getNetworkDeviceId(device);

            return SparkManager.getFirmware(fromDeviceId(deviceId))
              .then((response) => {
                if (hasError(response)) {
                  return Promise.reject(getErrorText(response));
                }
                return Promise.resolve(response);
              })
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
              .catch(logError)
              // If we cannot load firmware for some device we mark it with "error" status
              .catch((error) => dispatch(updateNetworkDevice(deviceId, {
                loading: false,
                status: NetworkDeviceStatus.Error,
                error: isString(error) ? error : "",
              })));
          });
      })
      .then(() => {
        dispatch(setNetworkScanInProgress(false));
        dispatch(updateGlobalIsProcessing(false));
        dispatch(updateGlobalProcessStatus(""));
      })
      .then(() => {
        const devices = queryNetworkDevices(getState()).filter(isNetworkDeviceNeedsHelpText);

        if (devices.length === 0) {
          return;
        }

        return dispatch(showAlert({
          content: renderAllNetworkDevicesHelpText(devices),
          intent: Intent.WARNING,
          okLabel: "OK",
        }));
      });
  };
};

export const findObsoletedDevice = (): SparkAction<Promise<boolean>> =>
  (dispatch, getState) => {
    return SparkManager.listAllDevices()
      .then(({extendedList}) => {
        const latestVersion = queryFirmwareByTag(getState(), FirmwareTag.Latest);

        const updateableDevices = extendedList.map(createNetworkDevice).filter(isNetworkDeviceNeedFirmwareVersion);
        // Load firmware for each updateable device
        return concatMapPromises(
          updateableDevices,
          (device) => {
            const deviceId = getNetworkDeviceId(device);

            return SparkManager.getFirmware(fromDeviceId(deviceId))
              .then((response) => hasError(response) ? Promise.reject() : Promise.resolve(response))
              .then((response) => {
                const firmwareVersion = response.version!.substring(1);
                return latestVersion && compareVersions(firmwareVersion, latestVersion.version) < 0;
              });
          })
      })
      .then((obsoletes) => obsoletes.some(Boolean));
  };

export const selectNetworkDevice = (id: DeviceId, selected: boolean): SparkAction<void> => {
  return (dispatch) => dispatch(updateNetworkDevice(id, {selected}));
};

export const showNetworkDeviceHelp = (id: DeviceId): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    const device = queryNetworkDevice(getState(), id);

    if (device == null) {
      return Promise.resolve();
    }

    return dispatch(showAlert({
      content: renderNetworkDeviceHelpText(device),
      intent: Intent.WARNING,
      okLabel: "OK",
    }));
  };
