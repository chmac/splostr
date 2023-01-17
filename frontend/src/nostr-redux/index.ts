import { Filter, matchFilter, matchFilters, relayInit } from "nostr-tools";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, store } from "../app/store";
import { EventFromRelay } from "../app/types";
import { eventAdded, selectAllEvents } from "./events";
import { gotEose, subscribed, unsubscribed } from "./subscriptions";

const relay = relayInit("wss://relay.nostr.nu");
// const relay = relayInit("wss://relay.nostr.info");
const connected = relay.connect();

// NOTE: This is not actually used
export const createSelectorFromFilters =
  (filters: Filter[]) => (state: RootState) => {
    const events = selectAllEvents(state);
    const eventsForFilters = filters.map((filter) => {
      const matchingEvents = events.filter((event) =>
        matchFilter(filter, event)
      );
      return matchingEvents;
    });
    const allMatchingEvents = events.filter((event) =>
      matchFilters(filters, event)
    );
    return { allMatchingEvents, eventsForFilters };
  };

export const useNostrQuery = ({
  filters,
  waitForEose = false,
}: {
  filters: Filter[];
  waitForEose?: boolean;
}): {
  allMatchingEvents: EventFromRelay[];
  eventsForFilters: EventFromRelay[][];
} => {
  const dispatch = useDispatch();
  const [gotEose, setGotEose] = useState(false);
  useEffect(() => {
    const execute = async () => {
      await connected;
      const sub = relay.sub(filters);

      sub.on("event", (event: EventFromRelay) => {
        dispatch(eventAdded(event));
      });

      sub.on("eose", () => {
        setGotEose(true);
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
  }, [dispatch, filters]);

  const selectorResult = useSelector(createSelectorFromFilters(filters));

  const emptyResult = {
    allMatchingEvents: [],
    eventsForFilters: filters.map(() => []),
  };

  const toBeReturned = waitForEose && !gotEose ? emptyResult : selectorResult;

  return toBeReturned;
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

export const getNostrData = async ({
  filters,
  waitForEose = false,
  subscriptionId = Math.random().toString().slice(2),
}: {
  filters: Filter[];
  waitForEose?: boolean;
  subscriptionId?: string;
}): Promise<() => void> => {
  await connected;
  return new Promise((resolve, reject) => {
    const subscription = relay.sub(filters, { id: subscriptionId });

    const unsubscribe = () => {
      subscription.unsub();
      store.dispatch(unsubscribed(subscriptionId));
    };

    subscription.on("event", (event: EventFromRelay) => {
      store.dispatch(eventAdded(event));
    });

    subscription.on("eose", () => {
      store.dispatch(subscribed({ id: subscriptionId, filters }));
      if (waitForEose) {
        store.dispatch(gotEose(subscriptionId));
        resolve(unsubscribe);
      }
      // setGotEose(true);
    });

    if (!waitForEose) {
      resolve(unsubscribe);
    }
  });
};
