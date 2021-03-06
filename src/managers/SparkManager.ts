import {isString} from "lodash";
import {ConfigParam} from "../models/ConfigParam";
import {
  ControlType,
  FirmwareResponseDto,
  getErrorText,
  hasError,
  ISignalDestinationDto,
  ListRequestDto,
  ListResponseDto,
  TelemetryEvent,
  TelemetryListResponseDto
} from "../models/dto";
import {onCallback, sendOneWay, sendTwoWay} from "./ipc-renderer-calls";
import {LogicError, SYSTEM_ERROR_SPARKMAX_CATEGORY, SystemError} from "../models/errors";
import FileFilter = Electron.FileFilter;

const ipcRenderer = (window as any).require("electron").ipcRenderer;
const remote = (window as any).require("electron").remote;

export interface IServerResponse {
  requestValue: number | string | boolean,
  responseValue: number | string | boolean,
  type: number,
  status: number,
}

const serializeData = (data: Blob | string): Promise<ArrayBuffer | string> => {
  if (isString(data)) {
    return Promise.resolve(data);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        resolve(new Buffer(reader.result as ArrayBuffer));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(data);
  });
};

function wrapSparkError<T>(promise: Promise<T>): Promise<T> {
  return promise
    // Specialize SystemError to make it obvious what is the source of error
    .catch((error: SystemError) => Promise.reject(error.specialize(() => ({category: SYSTEM_ERROR_SPARKMAX_CATEGORY}))))
    .then((response) => {
      // If sparkmax returns error => promise should be rejected with error
      if (hasError(response)) {
        return Promise.reject<T>(LogicError.create("sparkmax", getErrorText(response)))
      } else {
        return response;
      }
    });
}

class SparkManager {

  public static getInstance(): SparkManager {
    if (typeof SparkManager._instance === "undefined") {
      SparkManager._instance = new SparkManager();
    }
    return SparkManager._instance;
  }

  private static _instance: SparkManager;

  private constructor() {
  }

  public onDownloadProgress(listener: (event: any, downloadJSON: any) => void) {
    ipcRenderer.on("install-progress", listener);
  }

  public onUpdateDownloaded(listener: () => void) {
    ipcRenderer.removeAllListeners("download-progress");
    ipcRenderer.on("install-ready", listener);
  }

  public checkForUpdates(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      ipcRenderer.on("install-available", () => {
        ipcRenderer.removeAllListeners("install-not-available");
        resolve(true);
      });
      ipcRenderer.on("install-not-available", () => {
        ipcRenderer.removeAllListeners("install-available");
        resolve(false);
      });
      ipcRenderer.send("update-check");
    });
  }

  public beginDownload() {
    ipcRenderer.send("install-download");
  }

  public installUpdate() {
    ipcRenderer.send("install-new");
  }

  public getVersion() {
    return remote.app.getVersion();
  }

  public openURL(url: string) {
    ipcRenderer.send("open-url", url);
  }

  public listAllDevices(): Promise<ListResponseDto> {
    return this.listDevices({all: true});
  }

  public listDevices(request: ListRequestDto): Promise<ListResponseDto> {
    return wrapSparkError(sendTwoWay("list-device", request));
  }

  public connect(deviceId: string, descriptor?: string): Promise<any> {
    return wrapSparkError(sendTwoWay("connect", deviceId, descriptor));
  }

  public disconnect(): Promise<string> {
    return wrapSparkError(sendTwoWay("disconnect"));
  }

  public identify(canId: number, uniqueId: number): Promise<any> {
    return wrapSparkError(sendTwoWay("identify", canId, uniqueId));
  }

  public downloadFile(url: string): Promise<string> {
    return sendTwoWay("download", url);
  }

  public restoreDefaults(device: string, fullWipe: boolean): Promise<any> {
    return wrapSparkError(sendTwoWay("restore-defaults", device, fullWipe));
  }

  public requestFirmware(): Promise<any[]> {
    return sendTwoWay("request-firmware");
  }

  public getFirmware(device: string): Promise<FirmwareResponseDto> {
    return wrapSparkError(sendTwoWay("get-firmware", device));
  }

  public loadFirmware(recover: boolean, filename: string, devicesToUpdate: string[]): Promise<FirmwareResponseDto> {
    return wrapSparkError(sendTwoWay("load-firmware", recover, filename, devicesToUpdate));
  }

  public telemetryList(): Promise<TelemetryListResponseDto> {
    return wrapSparkError(sendTwoWay("telemetry-list"));
  }

  public saveAsFile(request: { fileName: string, data: Blob | string, filters: FileFilter[] }): Promise<boolean> {
    return serializeData(request.data).then((data) => sendTwoWay("save-as-file", {...request, data}));
  }

  public telemetryStart(): void {
    sendOneWay("telemetry-start");
  }

  public telemetryStop(): void {
    sendOneWay("telemetry-stop");
  }

  public telemetryAddSignal(device: string, signalId: number): void {
    sendOneWay("telemetry-signal-add", device, signalId);
  }

  public telemetryRemoveSignal(device: string, signalId: number): void {
    sendOneWay("telemetry-signal-remove", device, signalId);
  }

  public telemetryRunningSignals(): Promise<ISignalDestinationDto[]> {
    return sendTwoWay("telemetry-running-signals");
  }

  public onTelemetryEvent(listener: (event: TelemetryEvent) => void): void {
    onCallback("telemetry-event", listener);
  }

  public onLoadFirmwareProgress(listener: (error: any, recover: boolean, response: FirmwareResponseDto) => void): void {
    onCallback("load-firmware-progress", listener);
  }

  public onDisconnect(f: (device: string) => void): () => void {
    return onCallback("disconnect", (err: Error, device: string) => f(device));
  }

  public onResync(listener: (error: any, response: any) => void): () => void {
    return onCallback("resync", listener);
  }

  public onHeartbeat(listener: (error: any, device: string, response: any) => void): () => void {
    return onCallback("heartbeat", listener);
  }

  public getConfigFromParams(device: string): Promise<number[]> {
    return this.getAllParameters(device);
  }

  public async setControlMode(device: string, mode: number): Promise<any> {
    return await this.setParameter(device, 5, mode);
  }

  public async getAllParameters(device: string): Promise<any> {
    return await this.getParameterList(device);
  }

  public setSetpoint(device: string, pidSlot: number, setpoint: number) {
    return sendOneWay("set-setpoint", device, pidSlot, setpoint);
  }

  public enableHeartbeat(device: string, pidSlot: number, mode: ControlType, controlValue: number, interval: number) {
    sendOneWay("enable-heartbeat", device, pidSlot, mode, controlValue, interval);
  }

  public disableHeartbeat(device: string) {
    sendOneWay("disable-heartbeat", device);
  }

  public burnFlash(device: string): Promise<any> {
    return wrapSparkError(sendTwoWay("burn-flash", device));
  }

  public idAssignment(canId: number, uniqueId: number): Promise<any> {
    return wrapSparkError(sendTwoWay("id-assignment", canId, uniqueId));
  }

  public async setAndGetParameter(device: string,
                                  parameter: ConfigParam,
                                  value: number | string | boolean): Promise<IServerResponse> {
    const setResponse: any = await this.setParameter(device, parameter, value);
    // TODO: Often getParameter call returns error when it follows setParameter call and CAN ID was just modified.
    //       We do not get CAN ID from the server in this case (as for other parameters) to make UI work as expected.
    //       Potentially we can hide real error.
    const getResponse: any = parameter === ConfigParam.kCanID ? value : await this.getParameter(device, parameter);
    return {requestValue: value, responseValue: getResponse, status: setResponse.status, type: setResponse.type};
  }

  public getParameter(device: string, id: number): Promise<number> {
    return wrapSparkError(sendTwoWay("get-param", device, id).then((response) => Number(response.value)));
  }

  private getParameterList(device: string): Promise<number[]> {
    return wrapSparkError(sendTwoWay("get-param-list", device));
  }

  public showInfoBox(title: string, message: string) {
    sendOneWay("show-info", title, message);
  }

  private setParameter(device: string, id: number, value: number | string | boolean): Promise<number> {
    return wrapSparkError(sendTwoWay("set-param", device, id, value));
  }
}

export default SparkManager.getInstance();
