import { Filter, relayInit, matchFilter } from "nostr-tools";
import { useEffect, useState } from "react";
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

export const useNostrQuery = ({
  filter,
  waitForEose = false,
}: {
  filter: Filter;
  waitForEose?: boolean;
}) => {
  const dispatch = useDispatch();
  const [gotEose, setGotEose] = useState(false);
  useEffect(() => {
    const execute = async () => {
      await connected;
      const sub = relay.sub([filter]);

      sub.on("event", (event: EventFromRelay) => {
        dispatch(eventAdded(event));
      });

      sub.on("eose", () => {
        setGotEose(true);
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

  const events = useSelector(createSelectorFromFilter(filter));

  const eventsToReturn = waitForEose && !gotEose ? [] : events;

  return { events: eventsToReturn, gotEose };
};

export const useNostrPublish = () => {
  const [result, setResult] = useState("");

  return {
    result,
    publish: (event: EventFromRelay) => {
      const execute = async () => {
        await connected;
        const pub = relay.publish(event);
        pub.on("ok", () => {
          setResult("ok");
        });
        pub.on("seen", () => {
          setResult("seen");
        });
        pub.on("failed", () => {
          setResult("failed");
        });
      };
      execute();
    },
  };
};
