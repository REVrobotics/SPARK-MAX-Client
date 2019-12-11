import {SparkAction} from "./action-types";
import WebProvider from "../../providers/WebProvider";
import SparkManager from "../../managers/SparkManager";
import {
  consoleOutput,
  setFirmwareDownloaded,
  setFirmwareDownloadError,
  setFirmwareDownloading
} from "./atom-actions";
import {
  queryFirmwareByTag,
  queryFirmwareConfig,
  queryIsFirmwareDownloaded,
  queryIsFirmwareDownloading
} from "../selectors";
import {FirmwareTag} from "../state";
import {onError, useErrorHandler} from "./error-actions";

let configLoadPromise: Promise<void>;

export const downloadLatestFirmware = (): SparkAction<Promise<void>> => {
  return (dispatch, getState) => {
    const config = queryFirmwareConfig(getState());
    const isLoaded = queryIsFirmwareDownloaded(getState());
    const isLoading = queryIsFirmwareDownloading(getState());

    if (isLoaded) {
      return Promise.resolve(config);
    } else if (isLoading) {
      return configLoadPromise;
    }

    dispatch(setFirmwareDownloading());
    dispatch(consoleOutput(tt("msg_console_output:check_firmware_version")));
    configLoadPromise = WebProvider.get("content/sw/max/sparkmax-gui-cfg-2.json")
      .then((firmwareJSON: any) => {
        dispatch(setFirmwareDownloaded(firmwareJSON));
        const firmware = queryFirmwareByTag(getState(), FirmwareTag.Latest);
        if (firmware) {
          dispatch(consoleOutput(tt("msg_console_output:latest_firmware_version", {version: firmware.version})));
          return SparkManager.downloadFile(firmware.url)
            .then((msg) => {
              dispatch(consoleOutput(tt("msg_console_output:info", {message: msg})));
              return firmwareJSON;
            })
            .catch(() => dispatch(consoleOutput(tt("msg_console_output:cannot_download_firmware_version"))));
        }
        return firmwareJSON;
      })
      .catch(onError(() => {
        dispatch(setFirmwareDownloadError());
        dispatch(consoleOutput(tt("msg_console_output:cannot_determine_firmware_version")))
      }))
      .catch(useErrorHandler(dispatch));

    return configLoadPromise;
  };
};
