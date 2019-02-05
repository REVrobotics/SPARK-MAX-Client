import MotorConfiguration from "../models/MotorConfiguration";
import PIDFProfile from "../models/PIDFProfile";
import {ConfigParameter} from "../models/ConfigParameter";

const MAX_PARAMETERS: number = 58;

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
    return new Promise<string>((resolve, reject) => {
      this.listDevices().then((devices: string[]) => {
        if (devices.length > 0) {
          this.connect(devices[0]).then((response: any) => {
            if (!response.connected) {
              reject(response.root.error);
            } else {
              resolve(devices[0]);
            }
          }).catch((error: any) => {
            reject(error);
          });
        } else {
          reject("No devices were found.");
        }
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public listDevices(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      ipcRenderer.once("list-device-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.deviceList);
        }
      });
      ipcRenderer.send("list-device");
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

  public disconnect(device: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      ipcRenderer.once("disconnect-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
      ipcRenderer.send("disconnect", device);
    });
  }

  public downloadFile(url: string) {
    ipcRenderer.send("download", url);
  }

  public restoreDefaults(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      ipcRenderer.once("restore-defaults-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
      ipcRenderer.send("restore-defaults");
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

  public saveConfig(device: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ipcRenderer.once("save-config-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
      ipcRenderer.send("save-config", device);
    });
  }

  public onDisconnect(f: () => void): void {
    ipcRenderer.on("disconnection", () => f());
  }

  public getConfigFromParams(): Promise<MotorConfiguration> {
    return new Promise<MotorConfiguration>((resolve, reject) => {
      this.getAllParameters().then((values: any[]) => {
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
        config.limitSwitchForwardPolarity = values[50] === 0;
        config.limitSwitchReversePolarity = values[51] === 0;
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
        resolve(config);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public async setControlProfile(profileNumber: number, profile: PIDFProfile): Promise<any> {
    const values: any[] = [];
    const startParam: number = 13 + (profileNumber * 8);
    values.push(await this.setParameter(startParam, profile.p));
    values.push(await this.setParameter(startParam + 1, profile.i));
    values.push(await this.setParameter(startParam + 2, profile.d));
    values.push(await this.setParameter(startParam + 3, profile.f));
    values.push(await this.setParameter(startParam + 4, profile.iZone));
    values.push(await this.setParameter(startParam + 5, profile.dFilter));
    values.push(await this.setParameter(startParam + 6, profile.minOutput));
    values.push(await this.setParameter(startParam + 7, profile.maxOutput));
    return values;
  }

  public async setParamsFromConfig(config: MotorConfiguration): Promise<any> {
    const values: any[] = [];
    values.push(await this.setParameter(0, config.canID));
    values.push(await this.setParameter(1, config.inputMode));
    values.push(await this.setParameter(2, config.type));
    values.push(await this.setParameter(3, config.commutationAdvance));
    values.push(await this.setParameter(4, config.sensorType));
    values.push(await this.setParameter(5, config.controlType));
    values.push(await this.setParameter(6, config.idleMode));
    values.push(await this.setParameter(7, config.inputDeadband));
    values.push(await this.setParameter(8, config.firmwareVersion));
    values.push(await this.setParameter(9, config.hallOffset));
    values.push(await this.setParameter(10, config.polePairs));
    values.push(await this.setParameter(11, config.currentChop));
    values.push(await this.setParameter(12, config.currentChopCycles));
    if (typeof config.controlProfiles !== "undefined" && config.controlProfiles.length > 3) {
      values.push(await this.setParameter(13, config.controlProfiles[0].p));
      values.push(await this.setParameter(14, config.controlProfiles[0].i));
      values.push(await this.setParameter(15, config.controlProfiles[0].d));
      values.push(await this.setParameter(16, config.controlProfiles[0].f));
      values.push(await this.setParameter(17, config.controlProfiles[0].iZone));
      values.push(await this.setParameter(18, config.controlProfiles[0].dFilter));
      values.push(await this.setParameter(19, config.controlProfiles[0].minOutput));
      values.push(await this.setParameter(20, config.controlProfiles[0].maxOutput));
      values.push(await this.setParameter(21, config.controlProfiles[1].p));
      values.push(await this.setParameter(22, config.controlProfiles[1].i));
      values.push(await this.setParameter(23, config.controlProfiles[1].d));
      values.push(await this.setParameter(24, config.controlProfiles[1].f));
      values.push(await this.setParameter(25, config.controlProfiles[1].iZone));
      values.push(await this.setParameter(26, config.controlProfiles[1].dFilter));
      values.push(await this.setParameter(27, config.controlProfiles[1].minOutput));
      values.push(await this.setParameter(28, config.controlProfiles[1].maxOutput));
      values.push(await this.setParameter(29, config.controlProfiles[2].p));
      values.push(await this.setParameter(30, config.controlProfiles[2].i));
      values.push(await this.setParameter(31, config.controlProfiles[2].d));
      values.push(await this.setParameter(32, config.controlProfiles[2].f));
      values.push(await this.setParameter(33, config.controlProfiles[2].iZone));
      values.push(await this.setParameter(34, config.controlProfiles[2].dFilter));
      values.push(await this.setParameter(35, config.controlProfiles[2].minOutput));
      values.push(await this.setParameter(36, config.controlProfiles[2].maxOutput));
      values.push(await this.setParameter(37, config.controlProfiles[3].p));
      values.push(await this.setParameter(38, config.controlProfiles[3].i));
      values.push(await this.setParameter(39, config.controlProfiles[3].d));
      values.push(await this.setParameter(40, config.controlProfiles[3].f));
      values.push(await this.setParameter(41, config.controlProfiles[3].iZone));
      values.push(await this.setParameter(42, config.controlProfiles[3].dFilter));
      values.push(await this.setParameter(43, config.controlProfiles[3].minOutput));
      values.push(await this.setParameter(44, config.controlProfiles[3].maxOutput));
    }
    values.push(await this.setParameter(46, config.outputRatio));
    values.push(await this.setParameter(50, config.limitSwitchForwardPolarity ? 1 : 0));
    values.push(await this.setParameter(51, config.limitSwitchReversePolarity ? 1 : 0));
    values.push(await this.setParameter(52, config.hardLimitSwitchForwardEnabled ? 1 : 0));
    values.push(await this.setParameter(53, config.hardLimitSwitchReverseEnabled ? 1 : 0));
    values.push(await this.setParameter(54, config.softLimitSwitchForwardEnabled ? 1 : 0));
    values.push(await this.setParameter(55, config.softLimitSwitchReverseEnabled ? 1 : 0));
    values.push(await this.setParameter(56, config.rampRate));
    values.push(await this.setParameter(57, config.followerID));
    values.push(await this.setParameter(58, config.followerConfig));
    return values;
  }

  public async setControlMode(mode: number): Promise<any> {
    return await this.setParameter(5, mode);
  }

  public async getAllParameters(): Promise<any> {
    const values: any[] = [];
    for (let i = 0; i < MAX_PARAMETERS + 1; i++) {
      values.push(await this.getParameter(i));
    }
    return values;
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

  public burnFlash(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      ipcRenderer.once("burn-flash-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(error);
        }
      });
      ipcRenderer.send("burn-flash");
    });
  }

  public async setAndGetParameter(parameter: ConfigParameter, value: number | string | boolean): Promise<IServerResponse> {
    const setResponse: any = await this.setParameter(parameter, value);
    const getResponse: any = await this.getParameter(parameter);
    return {requestValue: value, responseValue: getResponse, status: setResponse.status, type: setResponse.type};
  }

  private getParameter(id: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      ipcRenderer.once("get-param-" + id + "-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.value);
        }
      });
      ipcRenderer.send("get-param", id);
    });
  }

  public showInfoBox(title: string, message: string) {
    ipcRenderer.send("show-info", title, message);
  }

  private setParameter(id: number, value: number | string | boolean): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      ipcRenderer.once("set-param-" + id + "-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
      ipcRenderer.send("set-param", id, value);
    });
  }
}

export default SparkManager.getInstance();