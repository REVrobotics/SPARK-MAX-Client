import {Reducer} from "redux";
import {ApplicationActions, IApplicationState, SET_CONNECTING, SET_CONNECTION_STATUS} from "./types";

export const initialState: IApplicationState = {
  connectionStatus: "NOT CONNECTED",
  isConnected: false,
  isConnecting: false,
};

const reducer: Reducer<IApplicationState> = (state: IApplicationState = initialState, action: any) => {
  switch ((action as ApplicationActions).type) {
    case SET_CONNECTION_STATUS:
      return {...state, isConnected: action.payload.isConnected, connectionStatus: action.payload.connectionStatus};
    case SET_CONNECTING:
      return {...state, isConnecting: action.payload.isConnecting};
    default:
      return state;
  }
};

export default reducer;