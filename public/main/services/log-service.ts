import {onOneWayCall} from "./ipc-main-calls";
import {rendererLogger} from "../loggers";

/**
 * Writes all UI errors into separate log file
 */
onOneWayCall("log:ui-error", (message, stack) => {
  rendererLogger.error(message, {stack});
});
