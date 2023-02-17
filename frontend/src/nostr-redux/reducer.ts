import { combineReducers } from "@reduxjs/toolkit";
import { eventsSlice } from "./events";
import { relaysSlice } from "./relays";
import { subscriptionsSlice } from "./subscriptions";

export const NOSTR_REDUX_KEY = "nostr" as const;

export const reducer = combineReducers({
  [eventsSlice.name]: eventsSlice.reducer,
  [subscriptionsSlice.name]: subscriptionsSlice.reducer,
  [relaysSlice.name]: relaysSlice.reducer,
});
