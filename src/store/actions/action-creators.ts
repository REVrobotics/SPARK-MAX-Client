import {SparkAction} from "./action-types";
import {querySelectedVirtualDeviceId} from "../selectors";

export function forSelectedDevice<A>(action: any) {
  return (...args: any[]): SparkAction<any> =>
    (dispatch, getState) => {
      const selectedId = querySelectedVirtualDeviceId(getState());
      if (selectedId) {
        return dispatch(action(selectedId, ...args));
      }
    };
}
