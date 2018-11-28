import MotorConfiguration from "../models/MotorConfiguration";

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
        config.canID = values[0];
        config.inputMode = values[1];
        config.type = values[2];
        // TODO - Add more conversions...
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public setParamsFromConfig(config: MotorConfiguration): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      // TODO - Need to think of how to efficiently do this...
      this.setParameter(0, config.canID).then(() => {
        resolve();
      }).catch(() => {
        reject();
      });
    });
  }

  public getAllParameters(): Promise<number[]> {
    const promises: Array<Promise<any>> = [];
    for (let i = 0; i < 54; i++) {
      promises.push(this.getParameter(i));
    }
    return Promise.all(promises);
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

  private setParameter(id: number, value: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      ipcRenderer.once("set-param-" + id + "-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
      ipcRenderer.send("set-param", id);
    });
  }
}

export default SparkManager.getInstance();