import {SparkAction} from "./types";
import {getSelectedDeviceId} from "./selectors";

export function forSelectedDevice<A>(action: any) {
  return (...args: any[]): SparkAction<any> =>
    (dispatch, getState) => {
      const selectedDeviceId = getSelectedDeviceId(getState());
      if (selectedDeviceId) {
        return dispatch(action(selectedDeviceId, ...args));
      }
    };
}
