import { store } from "../../app/store";
import { getNostrData } from "../../nostr-redux";
import { useAsyncWithCleanup } from "../../utils/useAsyncWithCleanup";
import {
  groupCreateByIdFilter,
  groupExpensesFilter,
  groupInviteFilter,
  groupInviteResponseFilter,
  groupMetadataFilter,
  userProfilesFilter,
} from "./Group.filters";
import {
  makeSelectGroupAdminPublicKey,
  makeSelectGroupMembers,
} from "./Group.selectors";

export const useGroupData = ({ id }: { id: string }) => {
  useAsyncWithCleanup(async () => {
    const unsubscribeOne = await getNostrData({
      filters: [groupCreateByIdFilter(id)],
      waitForEose: true,
    });

    const adminPublicKey = makeSelectGroupAdminPublicKey(id)(store.getState());

    if (typeof adminPublicKey === "undefined") {
      const message = "#HakYYC Failed to load group creation event";
      console.error(message, id);
      throw new Error(message);
    }

    const unsubscribeTwo = await getNostrData({
      filters: [
        groupMetadataFilter(id, adminPublicKey),
        groupInviteFilter(id, adminPublicKey),
      ],
      waitForEose: true,
    });

    const groupMemberPublicKeys = makeSelectGroupMembers(id)(
      store.getState()
    ).map((member) => member.id);

    const unsubscribeThree = await getNostrData({
      filters: [
        groupInviteResponseFilter(id, groupMemberPublicKeys),
        groupExpensesFilter(id, groupMemberPublicKeys),
        userProfilesFilter(groupMemberPublicKeys),
      ],
      waitForEose: true,
    });

    return () => {
      unsubscribeOne();
      unsubscribeTwo();
      unsubscribeThree();
    };
  }, [id]);
};
