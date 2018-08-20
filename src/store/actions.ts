import {ActionCreator} from "redux";
import {IUpdateConnectionStatus, SET_CONNECTION_STATUS} from "./types";

export const updateConnectionStatus: ActionCreator<IUpdateConnectionStatus> = (isConnected: boolean, connectionStatus: string) => ({
  payload: {
    connectionStatus,
    isConnected
  },
  type: SET_CONNECTION_STATUS
});