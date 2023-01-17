import { createSelector } from "@reduxjs/toolkit";
import { matchFilter } from "nostr-tools";
import { RootState } from "../../app/store";
import { EventFromRelay } from "../../app/types";
import { makeSelectEventById, selectAllEvents } from "../../nostr-redux/events";
import {
  getProfileFromEvent,
  getPublicKeyOfEvent,
  getRecipientIdsFromInviteEvent,
  NostrProfile,
} from "../../services/nostr/nostr.service";
import {
  groupInviteFilter,
  groupInviteResponseFilter,
  groupMetadataFilter,
  userProfileFilter,
} from "./Group.filters";

export const makeSelectGroupAdminPublicKey =
  (id: string) => (state: RootState) => {
    // TODO - Ideally we should block here waiting for the subscriptions to finish and returning an empty value and `isLoading = true`.
    const event = makeSelectEventById(id)(state);
    if (typeof event === "undefined") {
      return undefined;
      throw new Error("#twM4y4 Cannot find event by ID");
    }
    const publicKey = getPublicKeyOfEvent(event);
    return publicKey;
  };

export const makeSelectGroupMetadata = (id: string) => (state: RootState) => {
  const adminPublicKey = makeSelectGroupAdminPublicKey(id)(state);
  if (typeof adminPublicKey === "undefined") {
    return {};
  }
  const events = selectAllEvents(state);
  const filter = groupMetadataFilter(id, adminPublicKey);
  const event = events.find((event) => matchFilter(filter, event));
  if (typeof event === "undefined") {
    return {};
  }
  try {
    const metadata = JSON.parse(event.content);
    return metadata;
  } catch (error) {
    console.error("#9KGzNM Error parsing metadata", error, id, event);
    return {};
  }
};

export const makeSelectEventsByAuthorAndKind = (author: string, kind: number) =>
  createSelector(selectAllEvents, (events) =>
    events.filter((event) => matchFilter(userProfileFilter(author), event))
  );

export const makeSelectMemberProfile = (id: string) =>
  createSelector(makeSelectEventsByAuthorAndKind(id, 0), (events) =>
    getProfileFromEvent(events[0])
  );

export const makeSelectGroupMembers = (id: string) =>
  createSelector(
    selectAllEvents,
    makeSelectGroupAdminPublicKey(id),
    (events, adminPublicKey) => {
      if (typeof adminPublicKey === "undefined") {
        console.log("#lNj1ic makeSelectGroupMembers returning EMPTY");
        return [];
      }
      const groupMemberFilter = groupInviteFilter(id, adminPublicKey);
      const invites = events.filter((event) =>
        matchFilter(groupMemberFilter, event)
      );

      const members: {
        id: string;
        profile: NostrProfile;
        invite: EventFromRelay;
        response?: EventFromRelay;
      }[] = invites
        .map((invite) => {
          const ids = getRecipientIdsFromInviteEvent(invite);

          const inviteMembers = ids.map((id) => {
            const inviteFilter = groupInviteResponseFilter(id, [id]);
            const response = events.find((event) =>
              matchFilter(inviteFilter, event)
            );

            const profileFilter = userProfileFilter(id);
            const profileEvent = events.find((event) =>
              matchFilter(profileFilter, event)
            );
            const profile = getProfileFromEvent(profileEvent);

            return { id, profile, invite, response };
          });

          return inviteMembers;
        })
        .flat();

      const profileFilter = userProfileFilter(adminPublicKey);
      const profileEvent = events.find((event) =>
        matchFilter(profileFilter, event)
      );
      const profile = getProfileFromEvent(profileEvent);
      const admin = { id: adminPublicKey, profile };

      return [admin, ...members];
    }
  );
