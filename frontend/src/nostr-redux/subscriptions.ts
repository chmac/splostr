import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Filter } from "nostr-tools";

type Subscription = {
  id: string;
  gotEose: boolean;
  filters: Filter[];
};
type State = {
  [id: string]: Subscription;
};

const initialState: State = {};

export const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    subscribed: (
      state,
      action: PayloadAction<{ id: string; filters: Filter[] }>
    ) => {
      const { id, filters } = action.payload;
      state[id] = { id, gotEose: false, filters };
    },
    gotEose: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state[id].gotEose = true;
    },
    unsubscribed: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state[id];
    },
  },
});

export const { subscribed, gotEose, unsubscribed } = subscriptionsSlice.actions;
