import {Reducer} from "redux";
import {ActionType, ApplicationActions} from "../actions";

const initialLogsState: string[] = [];

const logReducer: Reducer<string[]> = (state: string[] = initialLogsState, action: ApplicationActions): string[] => {
  switch (action.type) {
    case ActionType.ADD_LOG:
      return [...state, action.payload.log];
    default:
      return state;
  }
};

export default logReducer;
