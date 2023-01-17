import { PUBLIC_KEY } from "../../app/constants";
import { store } from "../../app/store";
import { getNostrData } from "../../nostr-redux";
import { useAsyncWithCleanup } from "../../utils/useAsyncWithCleanup";
import { invitedGroupMetadataFilters, invitesFilter } from "./Invites.filters";
import { makeSelectInvites } from "./Invites.selectors";

export const useInvitesData = (publicKey: string) => {
  useAsyncWithCleanup(async () => {
    const unsubscribeOne = await getNostrData({
      filters: [invitesFilter(publicKey)],
      waitForEose: true,
    });

    const inviteEvents = makeSelectInvites(PUBLIC_KEY)(store.getState());

    const unsubscribeTwo = await getNostrData({
      filters: invitedGroupMetadataFilters(inviteEvents),
    });

    return () => {
      unsubscribeOne();
      unsubscribeTwo();
    };
  });
};
