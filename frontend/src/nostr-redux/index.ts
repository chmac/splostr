import { Filter, matchFilter, matchFilters } from "nostr-tools";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, store } from "../app/store";
import { NostrEvent } from "../app/types";
import { eventAdded, selectAllEvents } from "./events";
import { getAllRelayConnections } from "./relays";
import { gotEose, subscribed, unsubscribed } from "./subscriptions";

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
  allMatchingEvents: NostrEvent[];
  eventsForFilters: NostrEvent[][];
} => {
  const dispatch = useDispatch();
  const [gotEose, setGotEose] = useState(false);
  useEffect(() => {
    const execute = async () => {
      const relayConnections = getAllRelayConnections();

      const cleanupFunctions = await Promise.all(
        relayConnections.map((relayConnection) => {
          const sub = relayConnection.sub(filters);

          sub.on("event", (event: NostrEvent) => {
            dispatch(eventAdded(event));
          });

          sub.on("eose", () => {
            setGotEose(true);
          });

          return () => {
            sub.unsub();
          };
        })
      );

      return cleanupFunctions;
    };
    const cleanupPromise = execute();
    return () => {
      // This must be a nested async loop so that we can run it as the cleanup
      // function inside `useEffect()`
      const doAsyncCleanup = async () => {
        const cleanupFunctions = await cleanupPromise;
        cleanupFunctions.forEach((cleanupFunction) => {
          cleanupFunction();
        });
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

export const getNostrData = async ({
  filters,
  waitForEose = false,
  subscriptionId = Math.random().toString().slice(2),
}: {
  filters: Filter[];
  waitForEose?: boolean;
  subscriptionId?: string;
}): Promise<() => void> => {
  return new Promise((resolve, reject) => {
    const relayConnections = getAllRelayConnections();

    // TODO - Check that relays are ready

    const unsubscribeFunctionsPromise = Promise.all<() => void>(
      relayConnections.map((relayConnection) => {
        return new Promise((resolve) => {
          const subscription = relayConnection.sub(filters, {
            id: subscriptionId,
          });

          const unsubscribe = () => {
            subscription.unsub();
            store.dispatch(unsubscribed(subscriptionId));
          };

          subscription.on("event", (event: NostrEvent) => {
            store.dispatch(eventAdded(event));
          });

          subscription.on("eose", () => {
            store.dispatch(subscribed({ id: subscriptionId, filters }));
            if (waitForEose) {
              store.dispatch(gotEose(subscriptionId));
              resolve(unsubscribe);
            }
          });

          if (!waitForEose) {
            resolve(unsubscribe);
          }
        });
      })
    );

    const unsubscribeFromAllRelays = () => {
      unsubscribeFunctionsPromise.then((unsubscribeFunctions) => {
        unsubscribeFunctions.forEach((unsubscribeFunction) => {
          unsubscribeFunction();
        });
      });
    };

    if (waitForEose) {
      unsubscribeFunctionsPromise.then(() => {
        resolve(unsubscribeFromAllRelays);
      });
    } else {
      resolve(unsubscribeFromAllRelays);
    }
  });
};
