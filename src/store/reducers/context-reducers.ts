import {first} from "lodash";
import {Reducer} from "redux";
import {getVirtualDeviceId, IApplicationState, IContextState} from "../state";
import {ActionType, ApplicationActions} from "../actions";
import {setField, setNestedField} from "../../utils/object-utils";
import {queryConnectedDescriptor, queryDevicesByDescriptor, queryDevicesInOrder} from "../selectors";

const initialContextState: IContextState = {
  isProcessing: false,
  processStatus: "",
};

const contextReducer: Reducer<IContextState> = (state: IContextState = initialContextState,
                                                action: ApplicationActions): IContextState => {
  switch (action.type) {
    case ActionType.SET_SELECTED_DEVICE:
      return setField(state, "selectedVirtualDeviceId", action.payload.virtualDeviceId);
    case ActionType.SET_CONNECTED_DESCRIPTOR:
      return setField(state, "connectedDescriptor", action.payload.descriptor);
    case ActionType.SET_GLOBAL_PROCESS_STATUS:
      return setField(state, "processStatus", action.payload.processStatus);
    case ActionType.SET_GLOBAL_PROCESSING:
      return setField(state, "isProcessing", action.payload.isProcessing);
    default:
      return state;
  }
};

const syncSelectedVirtualDeviceIdReducer = (state: IApplicationState,
                                            action: ApplicationActions): IApplicationState => {
  switch (action.type) {
    case ActionType.REPLACE_DEVICES: {
      const {selectedVirtualDeviceId} = state.context;
      if (selectedVirtualDeviceId && state.deviceSet.devices[selectedVirtualDeviceId]) {
        return state;
      }
      const connectedDescriptor = queryConnectedDescriptor(state);
      const firstDevice = first(connectedDescriptor ?
        queryDevicesByDescriptor(state, connectedDescriptor)
        : queryDevicesInOrder(state));
      return setNestedField(
        state,
        ["context", "selectedVirtualDeviceId"],
        firstDevice ? getVirtualDeviceId(firstDevice) : undefined);
    }
    default:
      return state;
  }
};

export { syncSelectedVirtualDeviceIdReducer };

export default contextReducer;
