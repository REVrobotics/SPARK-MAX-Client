import {SparkAction} from "./action-types";
import {getSelectedVirtualDeviceId} from "../selectors";

export function forSelectedDevice<A>(action: any) {
  return (...args: any[]): SparkAction<any> =>
    (dispatch, getState) => {
      const selectedId = getSelectedVirtualDeviceId(getState());
      if (selectedId) {
        return dispatch(action(selectedId, ...args));
      }
    };
}
