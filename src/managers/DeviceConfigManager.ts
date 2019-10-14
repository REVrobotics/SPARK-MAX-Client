import {sendTwoWay} from "./ipc-renderer-calls";
import {IRawDeviceConfigDto} from "../models/device-config.dto";

/**
 * Facade used to manage device configurations.
 */
class DeviceConfigManager {
  public static getInstance(): DeviceConfigManager {
    if (typeof DeviceConfigManager._instance === "undefined") {
      DeviceConfigManager._instance = new DeviceConfigManager();
    }
    return DeviceConfigManager._instance;
  }

  private static _instance: DeviceConfigManager;

  public load(): Promise<IRawDeviceConfigDto[]> {
    return sendTwoWay("device-config:load");
  }

  public create(raw: IRawDeviceConfigDto): Promise<IRawDeviceConfigDto> {
    return sendTwoWay("device-config:create", raw);
  }

  public overwrite(raw: IRawDeviceConfigDto): Promise<IRawDeviceConfigDto> {
    return sendTwoWay("device-config:overwrite", raw);
  }

  public remove(fileName: string): Promise<void> {
    return sendTwoWay("device-config:remove", fileName);
  }
}

export default DeviceConfigManager.getInstance();
