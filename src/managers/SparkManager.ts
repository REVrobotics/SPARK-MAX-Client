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

  public getAllParameters(): Promise<number[]> {
    return Promise.all([
      this.getCanID(),
      this.getInputType(),
      this.getMotorType(),
      this.getCommutationAdvance(),
      this.getSensorType(),
      this.getControlType(),
      this.getIdleMode(),
      this.getDeadband()]);
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

  public getCanID(): Promise<number> {
    return this.getParameter(0);
  }

  public getInputType(): Promise<number> {
    return this.getParameter(1);
  }

  public getMotorType(): Promise<number> {
    return this.getParameter(2);
  }

  public getCommutationAdvance(): Promise<number> {
    return this.getParameter(3);
  }

  public getSensorType(): Promise<number> {
    return this.getParameter(4);
  }

  public getControlType(): Promise<number> {
    return this.getParameter(5);
  }

  public getIdleMode(): Promise<number> {
    return this.getParameter(6);
  }

  public getDeadband(): Promise<number> {
    return this.getParameter(7);
  }

  public setCanID(value: number): Promise<any> {
    return this.setParameter(0, value);
  }

  public setInputType(value: number): Promise<any> {
    return this.setParameter(1, value);
  }

  public setMotorType(value: number): Promise<any> {
    return this.setParameter(2, value);
  }

  public setCommutationAdvance(value: number): Promise<any> {
    return this.setParameter(3, value);
  }

  public setSensorType(value: number): Promise<any> {
    return this.setParameter(4, value);
  }

  public setControlType(value: number): Promise<any> {
    return this.setParameter(5, value);
  }

  public setIdleMode(value: number): Promise<any> {
    return this.setParameter(6, value);
  }

  public setDeadband(value: number): Promise<any> {
    return this.setParameter(7, value);
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