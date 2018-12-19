import MotorConfiguration from "../models/MotorConfiguration";
import PIDFProfile from "../models/PIDFProfile";

const MAX_PARAMETERS: number = 58;

const ipcRenderer = (window as any).require("electron").ipcRenderer;

class SparkManager {

  public static getInstance(): SparkManager {
    if (typeof SparkManager._instance === "undefined") {
      SparkManager._instance = new SparkManager();
    }
    return SparkManager._instance;
  }

  private static _instance: SparkManager;

  private constructor() {}

  public discoverAndConnect(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.listDevices().then((devices: string[]) => {
        if (devices.length > 0) {
          this.connect(devices[0]).then(() => {
            resolve(devices[0]);
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
          resolve();
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
        config.controlProfiles.push(new PIDFProfile());
        config.controlProfiles.push(new PIDFProfile());
        config.controlProfiles.push(new PIDFProfile());
        config.controlProfiles.push(new PIDFProfile());
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
        config.currentLimit = values[12];
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
        config.limitSwitchForwardPolarity = values[50];
        config.limitSwitchReversePolarity = values[51];
        config.hardLimitSwitchForwardEnabled = values[52] === 1;
        config.hardLimitSwitchReverseEnabled = values[53] === 1;
        config.softLimitSwitchForwardEnabled = values[54] === 1;
        config.softLimitSwitchReverseEnabled = values[55] === 1;
        config.rampRate = values[56];
        config.followerID = values[57];
        config.followerConfig = values[58];
        resolve(config);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public setParamsFromConfig(config: MotorConfiguration): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const promises: Array<Promise<any>> = [];
      promises.push(this.setParameter(0, config.canID));
      promises.push(this.setParameter(1, config.inputMode));
      promises.push(this.setParameter(2, config.type));
      promises.push(this.setParameter(3, config.commutationAdvance));
      promises.push(this.setParameter(4, config.sensorType));
      promises.push(this.setParameter(5, config.controlType));
      promises.push(this.setParameter(6, config.idleMode));
      promises.push(this.setParameter(7, config.inputDeadband));
      promises.push(this.setParameter(8, config.firmwareVersion));
      promises.push(this.setParameter(9, config.hallOffset));
      promises.push(this.setParameter(10, config.polePairs));
      promises.push(this.setParameter(11, config.currentChop));
      promises.push(this.setParameter(12, config.currentLimit));
      if (typeof config.controlProfiles !== "undefined" && config.controlProfiles.length > 3) {
        promises.push(this.setParameter(13, config.controlProfiles[0].p));
        promises.push(this.setParameter(14, config.controlProfiles[0].i));
        promises.push(this.setParameter(15, config.controlProfiles[0].d));
        promises.push(this.setParameter(16, config.controlProfiles[0].f));
        promises.push(this.setParameter(17, config.controlProfiles[0].iZone));
        promises.push(this.setParameter(18, config.controlProfiles[0].dFilter));
        promises.push(this.setParameter(19, config.controlProfiles[0].minOutput));
        promises.push(this.setParameter(20, config.controlProfiles[0].maxOutput));
        promises.push(this.setParameter(21, config.controlProfiles[1].p));
        promises.push(this.setParameter(22, config.controlProfiles[1].i));
        promises.push(this.setParameter(23, config.controlProfiles[1].d));
        promises.push(this.setParameter(24, config.controlProfiles[1].f));
        promises.push(this.setParameter(25, config.controlProfiles[1].iZone));
        promises.push(this.setParameter(26, config.controlProfiles[1].dFilter));
        promises.push(this.setParameter(27, config.controlProfiles[1].minOutput));
        promises.push(this.setParameter(28, config.controlProfiles[1].maxOutput));
        promises.push(this.setParameter(29, config.controlProfiles[2].p));
        promises.push(this.setParameter(30, config.controlProfiles[2].i));
        promises.push(this.setParameter(31, config.controlProfiles[2].d));
        promises.push(this.setParameter(32, config.controlProfiles[2].f));
        promises.push(this.setParameter(33, config.controlProfiles[2].iZone));
        promises.push(this.setParameter(34, config.controlProfiles[2].dFilter));
        promises.push(this.setParameter(35, config.controlProfiles[2].minOutput));
        promises.push(this.setParameter(36, config.controlProfiles[2].maxOutput));
        promises.push(this.setParameter(37, config.controlProfiles[3].p));
        promises.push(this.setParameter(38, config.controlProfiles[3].i));
        promises.push(this.setParameter(39, config.controlProfiles[3].d));
        promises.push(this.setParameter(40, config.controlProfiles[3].f));
        promises.push(this.setParameter(41, config.controlProfiles[3].iZone));
        promises.push(this.setParameter(42, config.controlProfiles[3].dFilter));
        promises.push(this.setParameter(43, config.controlProfiles[3].minOutput));
        promises.push(this.setParameter(44, config.controlProfiles[3].maxOutput));
      }
      promises.push(this.setParameter(46, config.outputRatio));
      promises.push(this.setParameter(50, config.limitSwitchForwardPolarity));
      promises.push(this.setParameter(51, config.limitSwitchReversePolarity));
      promises.push(this.setParameter(52, config.hardLimitSwitchForwardEnabled ? 1 : 0));
      promises.push(this.setParameter(53, config.hardLimitSwitchReverseEnabled ? 1 : 0));
      promises.push(this.setParameter(54, config.softLimitSwitchForwardEnabled ? 1 : 0));
      promises.push(this.setParameter(55, config.softLimitSwitchReverseEnabled ? 1 : 0));
      promises.push(this.setParameter(56, config.rampRate));
      promises.push(this.setParameter(57, config.followerID));
      promises.push(this.setParameter(58, config.followerConfig));
      Promise.all(promises).then((result: any[]) => {
        resolve(result);
      }).catch((error: any) => {
        reject(error);
      })
    });
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

  public enableHeartbeat(interval: number) {
    ipcRenderer.send("enable-heartbeat", interval);
  }

  public disableHeartbeat() {
    ipcRenderer.once("disable-heartbeat-response", (event: any, error: any, response: any) => {
      console.log(error, response);
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

  public getParameter(id: number): Promise<number> {
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

  private setParameter(id: number, value: number | string): Promise<number> {
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