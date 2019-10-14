import {SparkAction} from "./action-types";
import WebProvider from "../../providers/WebProvider";
import SparkManager from "../../managers/SparkManager";
import {
  addLog,
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
    dispatch(consoleOutput("[INFO] Check the latest firmware version"));
    configLoadPromise = WebProvider.get("content/sw/max/sparkmax-gui-cfg.json")
      .then((firmwareJSON: any) => {
        dispatch(setFirmwareDownloaded(firmwareJSON));
        const firmware = queryFirmwareByTag(getState(), FirmwareTag.Latest);
        if (firmware) {
          dispatch(consoleOutput(`[INFO] The latest firmware version is ${firmware.version}`));
          return SparkManager.downloadFile(firmware.url)
            .then((msg) => {
              dispatch(consoleOutput(`[INFO] ${msg}`));
              return firmwareJSON;
            })
            .catch(() => dispatch(consoleOutput("[ERROR] Could not download the latest firmware version")));
        }
        return firmwareJSON;
      }).catch((error: any) => {
        dispatch(setFirmwareDownloadError());
        dispatch(addLog(error));
        dispatch(consoleOutput("[ERROR] Could not determine the latest firmware version"))
      });

    return configLoadPromise;
  };
};
