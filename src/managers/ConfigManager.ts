import {sendOneWay, sendTwoWay} from "./ipc-renderer-calls";

class ConfigManager {
  public static getInstance(): ConfigManager {
    if (typeof ConfigManager._instance === "undefined") {
      ConfigManager._instance = new ConfigManager();
    }
    return ConfigManager._instance;
  }

  private static _instance: ConfigManager;

  private constructor() {
    sendOneWay("config-init");
  }

  public getString(path: string): Promise<string> {
    return sendTwoWay("config-get", path);
  }

  public getNumber(path: string): Promise<number> {
    return sendTwoWay("config-get", path);
  }

  public getAll(): Promise<number> {
    return sendTwoWay("config-get-all");
  }

  public set(path: string, value: any): Promise<any> {
    return sendTwoWay("config-set", path, value);
  }

  public setAll(value: any): Promise<any> {
    return sendTwoWay("config-set-all", value);
  }

}

export default ConfigManager.getInstance();