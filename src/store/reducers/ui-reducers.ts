import {Reducer} from "redux";
import {IUiState} from "../state";
import {ActionType, ApplicationActions} from "../actions";

const initialUiState: IUiState = {
  confirmationOpened: false
};

const uiReducer: Reducer<IUiState> = (state: IUiState = initialUiState, action: ApplicationActions): IUiState => {
  switch (action.type) {
    case ActionType.OPEN_CONFIRMATION:
      return {...state, confirmation: action.payload, confirmationOpened: true};
    case ActionType.ANSWER_CONFIRMATION:
      return {...state, confirmationOpened: false};
    default:
      return state;
  }
};

export default uiReducer;
