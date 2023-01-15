import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import {
  NOSTR_REDUX_KEY as nostrKey,
  reducer as nostrReducer,
} from "../nostr-redux/reducer";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [nostrKey]: nostrReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
