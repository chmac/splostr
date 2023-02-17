import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Relay } from "nostr-tools";
import { store } from "../app/store";
import { NostrEvent } from "../app/types";

const relayConnections = new Map<string, Relay>();

export const setRelayConnectionForUrl = (
  url: string,
  relayConnection: Relay
) => {
  if (relayConnections.has(url)) {
    const message = "#IeRk5T Cannot overwrite a relay connection";
    console.error(message, url);
    throw new Error(message);
  }
  relayConnections.set(url, relayConnection);
};

export const getRelayConnectionForUrl = (url: string) => {
  const relayConnection = relayConnections.get(url);
  if (typeof relayConnection === "undefined") {
    const message = "#KvxeUb Relay connection does not exist";
    console.error(message, url);
    throw new Error(message);
  }
  return relayConnection;
};

export const getAllRelayConnections = () => {
  return Array.from(relayConnections.values());
};

type ConnectionStatus = "none" | "connecting" | "connected" | "disconnected";
type PublishStatus = "ok" | "seen" | "failed";
type RelayEntry = {
  url: string;
  connectionStatus: ConnectionStatus;
  lastError: string;
  lastNotice: string;
  published: {
    [eventId: string]: {
      status: PublishStatus;
      error?: string;
    };
  };
};

const emptyRelay: Omit<RelayEntry, "url"> = {
  connectionStatus: "none",
  lastError: "",
  lastNotice: "",
  published: {},
};

type State = {
  relays: { [url: string]: RelayEntry };
  setupComplete: boolean;
};

const initialState: State = {
  relays: {},
  setupComplete: false,
};

export const relaysSlice = createSlice({
  name: "relays",
  initialState,
  reducers: {
    setNostrSetupComplete: (state) => {
      state.setupComplete = true;
    },
    addRelay: (state, action: PayloadAction<string>) => {
      const url = action.payload;
      const existingRelay = state.relays[url];
      if (typeof existingRelay === "undefined") {
        state.relays[url] = { ...emptyRelay, url: action.payload };
      }
    },
    setRelayConnectionStatus: (
      state,
      action: PayloadAction<{
        url: string;
        connectionStatus: ConnectionStatus;
      }>
    ) => {
      const { url, connectionStatus } = action.payload;
      const relay = state.relays[url];
      if (typeof relay === "undefined") {
        throw new Error("#BXkRJf Updating status for non existent relay");
      }
      state.relays[url].connectionStatus = connectionStatus;
    },
    setRelayLastError: (
      state,
      action: PayloadAction<{ url: string; error: string }>
    ) => {
      const { url, error } = action.payload;
      const relay = state.relays[url];
      if (typeof relay === "undefined") {
        throw new Error("#ItosTT Cannot set error for non existent relay");
      }
      state.relays[url].lastError = error;
    },
    setRelayLastNotice: (
      state,
      action: PayloadAction<{ url: string; notice: string }>
    ) => {
      const { url, notice } = action.payload;
      const relay = state.relays[url];
      if (typeof relay === "undefined") {
        throw new Error("#1uNh5n Cannot set notice for non existent relay");
      }
      state.relays[url].lastNotice = notice;
    },
    setRelayPublishState: (
      state,
      action: PayloadAction<{
        url: string;
        eventId: string;
        status: PublishStatus;
        error?: string;
      }>
    ) => {
      const { url, eventId, status, error } = action.payload;
      const relay = state.relays[url];
      if (typeof relay === "undefined") {
        throw new Error(
          "#N4Y5lv Cannot set publish state on non existent relay"
        );
      }
      state.relays[url].published[eventId] = { status, error };
    },
  },
});

export const {
  addRelay,
  setRelayConnectionStatus,
  setNostrSetupComplete,
  setRelayLastError,
  setRelayLastNotice,
  setRelayPublishState,
} = relaysSlice.actions;

export const publish = (event: NostrEvent) => {
  relayConnections.forEach((relayConnection) => {
    const { url } = relayConnection;
    const eventId = event.id;
    const pub = relayConnection.publish(event);
    pub.on("ok", () => {
      store.dispatch(setRelayPublishState({ url, eventId, status: "ok" }));
    });
    pub.on("seen", () => {
      store.dispatch(setRelayPublishState({ url, eventId, status: "seen" }));
    });
    pub.on("failed", (error: string) => {
      store.dispatch(
        setRelayPublishState({ url, eventId, status: "failed", error })
      );
    });
  });
};
