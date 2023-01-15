import { Filter, relayInit, matchFilter } from "nostr-tools";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../app/store";
import { EventFromRelay } from "../app/types";
import { eventAdded, selectEvents } from "./events";

const relay = relayInit("wss://relay.nostr.nu");
const connected = relay.connect();

export const createSelectorFromFilter =
  (filter: Filter) => (state: RootState) => {
    const events = selectEvents(state);
    const matchingEvents = events.filter((event) => matchFilter(filter, event));
    return matchingEvents;
  };

export const useNostrQuery = (filter: Filter) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const execute = async () => {
      await connected;
      const sub = relay.sub([filter]);

      sub.on("event", (event: EventFromRelay) => {
        dispatch(eventAdded(event));
      });

      sub.on("eose", () => {
        // TODO - Dispatch an action here
      });

      return () => {
        sub.unsub();
      };
    };
    const cleanupPromise = execute();
    return () => {
      const doAsyncCleanup = async () => {
        const finished = await cleanupPromise;
        finished();
      };
      doAsyncCleanup();
    };
  }, [dispatch, filter]);

  const result = useSelector(createSelectorFromFilter(filter));

  return result;
};
