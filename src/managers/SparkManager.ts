import {ConfigParam} from "../models/ConfigParam";
import {ListRequestDto, ListResponseDto, ParameterResponseDto} from "../models/dto";
import {onCallback, sendOneWay, sendTwoWay} from "./ipc-renderer-calls";

const ipcRenderer = (window as any).require("electron").ipcRenderer;
const remote = (window as any).require("electron").remote;

export interface IServerResponse {
  requestValue: number | string | boolean,
  responseValue: number | string | boolean,
  type: number,
  status: number,
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

  public discoverAndConnect(): Promise<string> {
    return this.listUsbDevices()
      .then(({deviceList}) => deviceList)
      .then((devices: string[]) => {
        if (devices.length > 0) {
          return this.connect(devices[0])
            .then((response: any) => {
              if (!response.connected) {
                return Promise.reject(response.root.error);
              } else {
                return Promise.resolve(devices[0]);
              }
            });
        } else {
          return Promise.reject("No devices were found.");
        }
      });
  }

  public listUsbDevices(): Promise<ListResponseDto> {
    // TODO: As temporary solution we take the first one device as USB device.
    //       In future this logic will be changed to use descriptors
    return this.listDevices({all: true}).then((response) => ({
      ...response,
      extendedList: response.extendedList.slice(0, 1),
    }));
  }

  public listCanDevices(deviceId: string): Promise<ListResponseDto> {
    return this.listDevices({all: true, root: {device: deviceId}})
  }

  public listAllDevices(): Promise<string[]> {
    return this.listDevices({all: true}).then(({deviceList}) => deviceList);
  }

  public listDevices(request: ListRequestDto): Promise<ListResponseDto> {
    return sendTwoWay("list-device", request);
  }

  public connect(device: string): Promise<any> {
    return sendTwoWay("connect", device);
  }

  public disconnect(device: string): Promise<string> {
    return sendTwoWay("disconnect", device);
  }

  public downloadFile(url: string) {
    ipcRenderer.send("download", url);
  }

  public restoreDefaults(device: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      ipcRenderer.once("restore-defaults-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
      ipcRenderer.send("restore-defaults", device);
    });
  }

  public requestFirmware(): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      ipcRenderer.once("request-firmware-response", (event: any, paths: any[]) => {
        resolve(paths);
      });
      ipcRenderer.send("request-firmware");
    });
  }

  public getFirmware(): Promise<any> {
    return new Promise((resolve, reject) => {
      ipcRenderer.once("get-firmware-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
      ipcRenderer.send("get-firmware");
    });
  }

  public loadFirmware(filename: string, listener: (event: any, error: any, response: any) => void): Promise<any> {
    return new Promise<any[]>((resolve, reject) => {
      ipcRenderer.on("load-firmware-response", listener);
      ipcRenderer.once("load-firmware-finish", (event: any, error: any, response: any) => {
        ipcRenderer.removeListener("load-firmware-response", listener);
        if (error && !response.updateCompletedSuccessfully) {
          reject({error, response});
        } else {
          resolve(response);
        }
      });
      ipcRenderer.send("load-firmware", filename);
    });
  }

  public onDisconnect(f: (device: string) => void): () => void {
    return onCallback("disconnect", (err: Error, device: string) => f(device));
  }

  public onHeartbeat(listener: (error: any, response: any) => void): () => void {
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

  // IMPORTANT - The setpoint MUST come in a [-1023, 1024] range!
  public setSetpoint(setpoint: number) {
    return sendOneWay("set-setpoint", setpoint);
  }

  public enableHeartbeat(interval: number) {
    sendOneWay("enable-heartbeat", interval);
  }

  public disableHeartbeat(listener?: (event: any, error: any, response: any) => void) {
    sendOneWay("disable-heartbeat");
  }

  public burnFlash(device: string): Promise<any> {
    return sendTwoWay("burn-flash", device);
  }

  public idAssignment(canId: number, uniqueId: number): Promise<any> {
    return sendTwoWay("id-assignment", canId, uniqueId);
  }

  public async setAndGetParameter(device: string,
                                  parameter: ConfigParam,
                                  value: number | string | boolean): Promise<IServerResponse> {
    const setResponse: any = await this.setParameter(device, parameter, value);
    const getResponse: any = await this.getParameter(device, parameter);
    return {requestValue: value, responseValue: getResponse, status: setResponse.status, type: setResponse.type};
  }

  private getParameter(device: string, id: number): Promise<number> {
    return sendTwoWay<ParameterResponseDto>("get-param", device, id).then((response) => Number(response.value));
  }

  private getParameterList(device: string): Promise<number[]> {
    return sendTwoWay("get-param-list", device);
  }

  public showInfoBox(title: string, message: string) {
    sendOneWay("show-info", title, message);
  }

  private setParameter(device: string, id: number, value: number | string | boolean): Promise<number> {
    return sendTwoWay("set-param", device, id, value);
  }
}

export default SparkManager.getInstance();
