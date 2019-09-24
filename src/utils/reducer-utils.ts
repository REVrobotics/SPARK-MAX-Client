import {Action, AnyAction, Reducer} from "redux";

export function onChangeReducer<S, A extends Action = AnyAction>(mainReducer: Reducer<S, A>,
                                                                 ...otherReducers: Array<Reducer<S, A>>): Reducer<S, A> {
  return (oldState, action) => {
    const newState = mainReducer(oldState, action);
    if (newState === oldState) {
      return oldState;
    }

    return otherReducers.reduce((stageState, reducer) => reducer(stageState, action), newState);
  };
}
