import {SparkAction} from "./action-types";
import {querySelectedVirtualDeviceId} from "../selectors";

/**
 * Adapts action for selected device.
 *
 * If we have some device-specific action which accepts virtual device ID as the first parameter.
 * We can use this function to create a new one action that always applies original action to the selected device.
 *
 * ```ts
 * const someDeviceAction = (virtualDeviceId, param1, param2) => ...;
 *
 * const someSelectedDeviceAction = forSelectedDevice(someDeviceAction);
 * // someSelectedDeviceAction has the following signature
 * // virtualDeviceId is always for currently selected device
 * // const someDeviceAction = (param1, param2) => ...;
 * ```
 */
export function forSelectedDevice<A>(action: any) {
  return (...args: any[]): SparkAction<any> =>
    (dispatch, getState) => {
      const selectedId = querySelectedVirtualDeviceId(getState());
      if (selectedId) {
        return dispatch(action(selectedId, ...args));
      }
    };
}
