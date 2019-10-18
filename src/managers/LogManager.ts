import {sendOneWay} from "./ipc-renderer-calls";

/**
 * Facade used for logging.
 */
class LogManager {
  public static getInstance(): LogManager {
    if (typeof LogManager._instance === "undefined") {
      LogManager._instance = new LogManager();
    }
    return LogManager._instance;
  }

  private static _instance: LogManager;

  public logUiError(message: string, stack?: string): void {
    sendOneWay("log:ui-error", message, stack);
  }
}

export default LogManager.getInstance();
