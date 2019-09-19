import MotorConfiguration from "../models/MotorConfiguration";
import PIDFProfile from "../models/PIDFProfile";
import {ConfigParam} from "../models/ConfigParam";
import {ListRequestDto, ListResponseDto} from "../models/dto";

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

  private constructor() {}

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
      .then(({ deviceList }) => deviceList)
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
    return this.listDevices({ all: false });
  }

  public listAllDevices(): Promise<string[]> {
    return this.listDevices({ all: true }).then(({ deviceList }) => deviceList);
  }

  public listDevices(request: ListRequestDto): Promise<ListResponseDto> {
    return new Promise<ListResponseDto>((resolve, reject) => {
      ipcRenderer.once("list-device-response", (event: any, error: any, response: ListResponseDto) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
      ipcRenderer.send("list-device", request);
    });
  }

  public connect(device: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      ipcRenderer.once("connect-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
      ipcRenderer.send("connect", device)
    });
  }

  public disconnect(device: string): Promise<string> {
    return new Promise<any>((resolve, reject) => {
      ipcRenderer.once("disconnect-response", (event: any, error: any, disconnectedDevice: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(disconnectedDevice);
        }
      });
      ipcRenderer.send("disconnect", device);
    });
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

  public onDisconnect(f: (device: string) => void): void {
    ipcRenderer.on("disconnect-response", (err: Error, device: string) => f(device));
  }

  public getConfigFromParams(device: string): Promise<MotorConfiguration> {
    return this.getAllParameters(device).then((values: any[]) => {
      const config: MotorConfiguration = new MotorConfiguration("REV Brushless", 1);
      config.canID = values[0];
      config.inputMode = values[1];
      config.type = values[2];
      config.commutationAdvance = values[3];
      config.sensorType = values[4];
      config.controlType = values[5];
      config.idleMode = values[6];
      config.inputDeadband = values[7];
      config.firmwareVersion = values[8];
      config.hallOffset = values[9];
      config.polePairs = values[10];
      config.currentChop = values[11];
      config.currentChopCycles = values[12];
      config.controlProfiles[0].p = values[13];
      config.controlProfiles[0].i = values[14];
      config.controlProfiles[0].d = values[15];
      config.controlProfiles[0].f = values[16];
      config.controlProfiles[0].iZone = values[17];
      config.controlProfiles[0].dFilter = values[18];
      config.controlProfiles[0].minOutput = values[19];
      config.controlProfiles[0].maxOutput = values[20];
      config.controlProfiles[1].p = values[21];
      config.controlProfiles[1].i = values[22];
      config.controlProfiles[1].d = values[23];
      config.controlProfiles[1].f = values[24];
      config.controlProfiles[1].iZone = values[25];
      config.controlProfiles[1].dFilter = values[26];
      config.controlProfiles[1].minOutput = values[27];
      config.controlProfiles[1].maxOutput = values[28];
      config.controlProfiles[2].p = values[29];
      config.controlProfiles[2].i = values[30];
      config.controlProfiles[2].d = values[31];
      config.controlProfiles[2].f = values[32];
      config.controlProfiles[2].iZone = values[33];
      config.controlProfiles[2].dFilter = values[34];
      config.controlProfiles[2].minOutput = values[35];
      config.controlProfiles[2].maxOutput = values[36];
      config.controlProfiles[3].p = values[37];
      config.controlProfiles[3].i = values[38];
      config.controlProfiles[3].d = values[39];
      config.controlProfiles[3].f = values[40];
      config.controlProfiles[3].iZone = values[41];
      config.controlProfiles[3].dFilter = values[42];
      config.controlProfiles[3].minOutput = values[43];
      config.controlProfiles[3].maxOutput = values[44];
      config.outputRatio = values[46];
      config.limitSwitchForwardPolarity = values[50] === 1;
      config.limitSwitchReversePolarity = values[51] === 1;
      config.hardLimitSwitchForwardEnabled = values[52] === 1;
      config.hardLimitSwitchReverseEnabled = values[53] === 1;
      config.softLimitSwitchForwardEnabled = values[54] === 1;
      config.softLimitSwitchReverseEnabled = values[55] === 1;
      config.rampRate = values[56];
      config.followerID = values[57];
      config.followerConfig = values[58];
      config.smartCurrentStallLimit = values[59];
      config.smartCurrentFreeLimit = values[60];
      config.smartCurrentConfig = values[61];
      config.motorKv = values[63];
      config.motorR = values[64];
      config.motorL = values[65];
      config.encoderCountsPerRevolution = values[69];
      config.encoderAverageDepth = values[70];
      config.encoderSampleDelta = values[71];
      return config;
    });
  }

  public async setControlProfile(device: string, profileNumber: number, profile: PIDFProfile): Promise<any> {
    const values: any[] = [];
    const startParam: number = 13 + (profileNumber * 8);
    values.push(await this.setParameter(device, startParam, profile.p));
    values.push(await this.setParameter(device, startParam + 1, profile.i));
    values.push(await this.setParameter(device, startParam + 2, profile.d));
    values.push(await this.setParameter(device, startParam + 3, profile.f));
    values.push(await this.setParameter(device, startParam + 4, profile.iZone));
    values.push(await this.setParameter(device, startParam + 5, profile.dFilter));
    values.push(await this.setParameter(device, startParam + 6, profile.minOutput));
    values.push(await this.setParameter(device, startParam + 7, profile.maxOutput));
    return values;
  }

  public async setParamsFromConfig(device: string, config: MotorConfiguration): Promise<any> {
    const values: any[] = [];
    values.push(await this.setParameter(device, 0, config.canID));
    values.push(await this.setParameter(device, 1, config.inputMode));
    values.push(await this.setParameter(device, 2, config.type));
    values.push(await this.setParameter(device, 3, config.commutationAdvance));
    values.push(await this.setParameter(device, 4, config.sensorType));
    values.push(await this.setParameter(device, 5, config.controlType));
    values.push(await this.setParameter(device, 6, config.idleMode));
    values.push(await this.setParameter(device, 7, config.inputDeadband));
    values.push(await this.setParameter(device, 8, config.firmwareVersion));
    values.push(await this.setParameter(device, 9, config.hallOffset));
    values.push(await this.setParameter(device, 10, config.polePairs));
    values.push(await this.setParameter(device, 11, config.currentChop));
    values.push(await this.setParameter(device, 12, config.currentChopCycles));
    if (typeof config.controlProfiles !== "undefined" && config.controlProfiles.length > 3) {
      values.push(await this.setParameter(device, 13, config.controlProfiles[0].p));
      values.push(await this.setParameter(device, 14, config.controlProfiles[0].i));
      values.push(await this.setParameter(device, 15, config.controlProfiles[0].d));
      values.push(await this.setParameter(device, 16, config.controlProfiles[0].f));
      values.push(await this.setParameter(device, 17, config.controlProfiles[0].iZone));
      values.push(await this.setParameter(device, 18, config.controlProfiles[0].dFilter));
      values.push(await this.setParameter(device, 19, config.controlProfiles[0].minOutput));
      values.push(await this.setParameter(device, 20, config.controlProfiles[0].maxOutput));
      values.push(await this.setParameter(device, 21, config.controlProfiles[1].p));
      values.push(await this.setParameter(device, 22, config.controlProfiles[1].i));
      values.push(await this.setParameter(device, 23, config.controlProfiles[1].d));
      values.push(await this.setParameter(device, 24, config.controlProfiles[1].f));
      values.push(await this.setParameter(device, 25, config.controlProfiles[1].iZone));
      values.push(await this.setParameter(device, 26, config.controlProfiles[1].dFilter));
      values.push(await this.setParameter(device, 27, config.controlProfiles[1].minOutput));
      values.push(await this.setParameter(device, 28, config.controlProfiles[1].maxOutput));
      values.push(await this.setParameter(device, 29, config.controlProfiles[2].p));
      values.push(await this.setParameter(device, 30, config.controlProfiles[2].i));
      values.push(await this.setParameter(device, 31, config.controlProfiles[2].d));
      values.push(await this.setParameter(device, 32, config.controlProfiles[2].f));
      values.push(await this.setParameter(device, 33, config.controlProfiles[2].iZone));
      values.push(await this.setParameter(device, 34, config.controlProfiles[2].dFilter));
      values.push(await this.setParameter(device, 35, config.controlProfiles[2].minOutput));
      values.push(await this.setParameter(device, 36, config.controlProfiles[2].maxOutput));
      values.push(await this.setParameter(device, 37, config.controlProfiles[3].p));
      values.push(await this.setParameter(device, 38, config.controlProfiles[3].i));
      values.push(await this.setParameter(device, 39, config.controlProfiles[3].d));
      values.push(await this.setParameter(device, 40, config.controlProfiles[3].f));
      values.push(await this.setParameter(device, 41, config.controlProfiles[3].iZone));
      values.push(await this.setParameter(device, 42, config.controlProfiles[3].dFilter));
      values.push(await this.setParameter(device, 43, config.controlProfiles[3].minOutput));
      values.push(await this.setParameter(device, 44, config.controlProfiles[3].maxOutput));
    }
    values.push(await this.setParameter(device, 46, config.outputRatio));
    values.push(await this.setParameter(device, 50, config.limitSwitchForwardPolarity ? 1 : 0));
    values.push(await this.setParameter(device, 51, config.limitSwitchReversePolarity ? 1 : 0));
    values.push(await this.setParameter(device, 52, config.hardLimitSwitchForwardEnabled ? 1 : 0));
    values.push(await this.setParameter(device, 53, config.hardLimitSwitchReverseEnabled ? 1 : 0));
    values.push(await this.setParameter(device, 54, config.softLimitSwitchForwardEnabled ? 1 : 0));
    values.push(await this.setParameter(device, 55, config.softLimitSwitchReverseEnabled ? 1 : 0));
    values.push(await this.setParameter(device, 56, config.rampRate));
    values.push(await this.setParameter(device, 57, config.followerID));
    values.push(await this.setParameter(device, 58, config.followerConfig));
    return values;
  }

  public async setControlMode(device: string, mode: number): Promise<any> {
    return await this.setParameter(device, 5, mode);
  }

  public async getAllParameters(device: string): Promise<any> {
    return await this.getParameterList(device);
  }

  // IMPORTANT - The setpoint MUST come in a [-1023, 1024] range!
  public setSetpoint(setpoint: number) {
    ipcRenderer.send("set-setpoint", setpoint);
  }

  public enableHeartbeat(interval: number, listener?: (event: any, error: any, response: any) => void) {
    if (typeof listener !== "undefined") {
      ipcRenderer.on("enable-heartbeat-response", listener);
    }
    ipcRenderer.send("enable-heartbeat", interval);
  }

  public disableHeartbeat(listener?: (event: any, error: any, response: any) => void) {
    ipcRenderer.once("disable-heartbeat-response", (event: any, error: any, response: any) => {
      if (typeof listener !== "undefined") {
        ipcRenderer.removeListener("enable-heartbeat-response", listener);
      }
    });
    ipcRenderer.send("disable-heartbeat");
  }

  public burnFlash(device: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      ipcRenderer.once("burn-flash-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(error);
        }
      });
      ipcRenderer.send("burn-flash", device);
    });
  }

  public async setAndGetParameter(device: string,
                                  parameter: ConfigParam,
                                  value: number | string | boolean): Promise<IServerResponse> {
    const setResponse: any = await this.setParameter(device, parameter, value);
    const getResponse: any = await this.getParameter(device, parameter);
    return {requestValue: value, responseValue: getResponse, status: setResponse.status, type: setResponse.type};
  }

  private getParameter(device: string, id: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      ipcRenderer.once("get-param-" + id + "-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.value);
        }
      });
      ipcRenderer.send("get-param", device, id);
    });
  }

  private getParameterList(device: string): Promise<number[]> {
    return new Promise<number[]>((resolve, reject) => {
      ipcRenderer.once("get-param-list-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
      ipcRenderer.send("get-param-list", device);
    });
  }

  public showInfoBox(title: string, message: string) {
    ipcRenderer.send("show-info", title, message);
  }

  private setParameter(device: string, id: number, value: number | string | boolean): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      ipcRenderer.once("set-param-" + id + "-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
      ipcRenderer.send("set-param", device, id, value);
    });
  }
}

export default SparkManager.getInstance();