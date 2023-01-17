import { Filter } from "nostr-tools";
import { getNostrData } from ".";
import { RootState, store } from "../app/store";
import { useAsyncWithCleanup } from "../utils/useAsyncWithCleanup";

type FilterCreator = (state: RootState) => Filter[];
type UnsubscribeFunction = () => void;

export const useNostrData = (filterCreators: FilterCreator[]) => {
  useAsyncWithCleanup(async () => {
    const cleanupFunctionsPromise = filterCreators.reduce<
      Promise<UnsubscribeFunction[]>
    >(async (previousValue, filterCreator) => {
      const result = await previousValue;

      const filters = filterCreator(store.getState());

      const unsubscribe = await getNostrData({
        filters,
        waitForEose: true,
      });
      return [...result, unsubscribe];
    }, Promise.resolve([]));

    const cleanup = () => {
      cleanupFunctionsPromise.then((cleanupFunctions) => {
        cleanupFunctions.forEach((cleanupFunction) => {
          cleanupFunction();
        });
      });
    };

    return cleanup;
  });
};
