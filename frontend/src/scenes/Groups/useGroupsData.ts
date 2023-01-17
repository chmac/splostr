import { getNostrData } from "../../nostr-redux";
import { useAsyncWithCleanup } from "../../utils/useAsyncWithCleanup";
import {
  joinedGroupInviteResponsesFilter,
  createdGroupMetadatasFilter,
} from "./Groups.filters";

export const useGroupsData = (publicKey: string) => {
  useAsyncWithCleanup(async () => {
    const unsubscribeOne = await getNostrData({
      filters: [
        createdGroupMetadatasFilter(publicKey),
        joinedGroupInviteResponsesFilter(publicKey),
      ],
      waitForEose: true,
    });

    return () => {
      unsubscribeOne();
    };
  });
};
