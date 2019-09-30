import {Reducer} from "redux";
import {getVirtualDeviceId, IContextState} from "../state";
import {ActionType, ApplicationActions} from "../actions";
import {setField} from "../../utils/object-utils";

const initialContextState: IContextState = {
  isProcessing: false,
  processStatus: "",
};

const contextReducer: Reducer<IContextState> = (state: IContextState = initialContextState,
                                                action: ApplicationActions): IContextState => {
  switch (action.type) {
    case ActionType.SET_SELECTED_DEVICE:
      return setField(state, "selectedVirtualDeviceId", action.payload.virtualDeviceId);
    case ActionType.REPLACE_DEVICES: {
      // Ensure that selected device id always points out to the existing device
      if (state.selectedVirtualDeviceId && action.payload.replaceIds.includes(state.selectedVirtualDeviceId)) {
        return setField(state, "selectedVirtualDeviceId", getVirtualDeviceId(action.payload.device));
      } else {
        return state;
      }
    }
    case ActionType.SET_CONNECTED_DEVICE:
      return setField(state, "connectedVirtualDeviceId", action.payload.connected ? action.payload.virtualDeviceId : undefined);
    case ActionType.SET_GLOBAL_PROCESS_STATUS:
      return setField(state, "processStatus", action.payload.processStatus);
    case ActionType.SET_GLOBAL_PROCESSING:
      return setField(state, "isProcessing", action.payload.isProcessing);
    default:
      return state;
  }
};

export default contextReducer;