import {Action, AnyAction, Reducer} from "redux";

/**
 * This function accepts one or more reducers and creates a new one.
 * Returned reducer calls `otherReducers` only if `mainReducer` has changed state.
 */
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

export function composeReducers<S, A extends Action = AnyAction>(...reducers: Array<Reducer<S, A>>): Reducer<S, A> {
  return (state, action) => reducers.reduce((previousState, reducer) => reducer(previousState, action), state) as S;
}
