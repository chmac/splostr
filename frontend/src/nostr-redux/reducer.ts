import { combineReducers } from "@reduxjs/toolkit";
import { eventsSlice } from "./events";

export const NOSTR_REDUX_KEY = "nostr" as const;

export const reducer = combineReducers({
  [eventsSlice.name]: eventsSlice.reducer,
});
