import { createSelector } from "@reduxjs/toolkit";
import { matchFilter } from "nostr-tools";
import { GROUP_METADATA_EVENT_KIND } from "../../app/constants";
import { selectAllEvents } from "../../nostr-redux/events";
import {
  getGroupIdFromInviteEvent,
  getProfileFromEvent,
  getPublicKeyOfEvent,
  NostrProfile,
} from "../../services/nostr/nostr.service";
import {
  createdGroupMetadatasFilter,
  joinedGroupInviteResponsesFilter,
} from "./Groups.filters";

export const makeGroupsSelector = (publicKey: string) =>
  createSelector(
    selectAllEvents,
    (
      events
    ): {
      id: string;
      creatorPublicKey?: string;
      profile: NostrProfile;
    }[] => {
      const createdGroupMetadatas = events.filter((event) =>
        matchFilter(createdGroupMetadatasFilter(publicKey), event)
      );

      const createdGroups = createdGroupMetadatas.map((event) => {
        const profile = getProfileFromEvent(event);
        return { id: event.id, creatorPublicKey: publicKey, profile };
      });

      const joinedGroupInviteResponses = events.filter((event) =>
        matchFilter(joinedGroupInviteResponsesFilter(publicKey), event)
      );

      const joinedGroups = joinedGroupInviteResponses.map((event) => {
        const id = getGroupIdFromInviteEvent(event);
        const groupCreateEvent = events.find((event) => event.id === id);
        if (typeof groupCreateEvent === "undefined") {
          return { id, profile: {} };
        }
        const creatorPublicKey = getPublicKeyOfEvent(groupCreateEvent);
        const groupMetadataEvent = events.find((event) =>
          matchFilter(
            {
              authors: [creatorPublicKey],
              kinds: [GROUP_METADATA_EVENT_KIND],
            },
            event
          )
        );
        const profile = getProfileFromEvent(groupMetadataEvent);
        return { id, creatorPublicKey, profile };
      });

      return [...createdGroups, ...joinedGroups];
    }
  );
