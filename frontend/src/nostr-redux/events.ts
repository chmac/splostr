import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../app/store";
import { EventFromRelay } from "../app/types";

const eventsAdapter = createEntityAdapter<EventFromRelay>({
  selectId: (event) => {
    if (event.kind === 0 || (event.kind >= 1e5 && event.kind < 2e5)) {
      return `${event.kind}.${event.pubkey}`;
    }

    return event.id;
  },
});

export const eventsSlice = createSlice({
  name: "events",
  initialState: eventsAdapter.getInitialState(),
  reducers: {
    eventAdded: eventsAdapter.addOne,
  },
});

export const { eventAdded } = eventsSlice.actions;

export const { selectAll: selectAllEvents, selectById: selectEventByCacheId } =
  eventsAdapter.getSelectors<RootState>(
    (state) => state.nostr[eventsSlice.name]
  );

// NOTE: We need to search all events in the array because we use the
// `selectId` above to automatically overwrite duplicates.
export const makeSelectEventById = (id: string) => (state: RootState) => {
  const events = selectAllEvents(state);
  return events.find((event) => event.id === id);
};
