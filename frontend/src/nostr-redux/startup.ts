import { relayInit } from "nostr-tools";
import { AppDispatch, RootState } from "../app/store";
import {
  setRelayConnectionStatus,
  setRelayLastError,
  setRelayLastNotice,
} from "./relays";
import { setRelayConnectionForUrl } from "./relays";

export const startupNostr = (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  const { relays } = getState().nostr.relays;
  for (const key in relays) {
    const relay = relays[key];
    const { url } = relay;
    const relayConnection = relayInit(url);

    setRelayConnectionForUrl(url, relayConnection);

    dispatch(
      setRelayConnectionStatus({
        url,
        connectionStatus: "connecting",
      })
    );

    relayConnection.on("connect", () => {
      dispatch(
        setRelayConnectionStatus({
          url,
          connectionStatus: "connected",
        })
      );
    });

    relayConnection.on("disconnect", () => {
      dispatch(
        setRelayConnectionStatus({ url, connectionStatus: "disconnected" })
      );
    });

    relayConnection.on("notice", (notice: string) => {
      dispatch(setRelayLastNotice({ url, notice }));
    });

    relayConnection.on("error", (error: string) => {
      dispatch(setRelayLastError({ url, error }));
    });
  }
};
