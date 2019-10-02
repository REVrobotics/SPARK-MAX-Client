import {Reducer} from "redux";
import {IUiState, TabId} from "../state";
import {ActionType, ApplicationActions} from "../actions";
import {setField} from "../../utils/object-utils";

const initialUiState: IUiState = {
  selectedTabId: TabId.Basic,
  confirmationOpened: false
};

const uiReducer: Reducer<IUiState> = (state: IUiState = initialUiState, action: ApplicationActions): IUiState => {
  switch (action.type) {
    case ActionType.OPEN_CONFIRMATION:
      return {...state, confirmation: action.payload, confirmationOpened: true};
    case ActionType.ANSWER_CONFIRMATION:
      return {...state, confirmationOpened: false};
    case ActionType.SET_SELECTED_TAB:
      return setField(state, "selectedTabId", action.payload.tab);
    default:
      return state;
  }
};

export default uiReducer;
