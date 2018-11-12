const ipcRenderer = (window as any).require("electron").ipcRenderer;

class ConfigManager {
  public static getInstance(): ConfigManager {
    if (typeof ConfigManager._instance === "undefined") {
      ConfigManager._instance = new ConfigManager();
    }
    return ConfigManager._instance;
  }

  private static _instance: ConfigManager;

  private constructor() {
    ipcRenderer.send("config-init");
  }

  public getString(path: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      ipcRenderer.once("config-get-response", (event: any, error: any, response: string) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
      ipcRenderer.send("config-get", path);
    });
  }

  public getNumber(path: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      ipcRenderer.send("config-get-response", (event: any, error: any, response: number) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
      ipcRenderer.send("config-get", path);
    });
  }

  public getAll(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      ipcRenderer.send("config-get-all-response", (event: any, error: any, response: number) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
      ipcRenderer.send("config-get-all");
    });
  }

  public set(path: string, value: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      ipcRenderer.once("config-set-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
      ipcRenderer.send("config-set", path, value);
    });
  }

  public setAll(value: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      ipcRenderer.once("config-set-all-response", (event: any, error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
      ipcRenderer.send("config-set-all", value);
    });
  }

}

export default ConfigManager.getInstance();