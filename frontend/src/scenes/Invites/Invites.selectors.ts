import { createSelector } from "@reduxjs/toolkit";
import { matchFilter } from "nostr-tools";
import { selectAllEvents } from "../../nostr-redux/events";
import {
  getGroupIdFromInviteEvent,
  getProfileFromEvent,
  getPublicKeyOfEvent,
} from "../../services/nostr/nostr.service";
import { invitedGroupMetadataFilter, invitesFilter } from "./Invites.filters";

export const makeSelectInvites = (publicKey: string) =>
  createSelector(selectAllEvents, (events) =>
    events.filter((event) => matchFilter(invitesFilter(publicKey), event))
  );

export const makeSelectInvitesWithData = (publicKey: string) =>
  createSelector(
    makeSelectInvites(publicKey),
    selectAllEvents,
    (invites, events) => {
      return invites.map((inviteEvent) => {
        const groupId = getGroupIdFromInviteEvent(inviteEvent);
        const createGroupEvent = events.find((event) => event.id === groupId);
        const creatorPublicKey = getPublicKeyOfEvent(inviteEvent);
        const metadataFilter = invitedGroupMetadataFilter(
          groupId,
          creatorPublicKey
        );
        const profileEvent = events.find((event) =>
          matchFilter(metadataFilter, event)
        );
        const profile = getProfileFromEvent(profileEvent);
        return { groupId, inviteEvent, createGroupEvent, profile };
      });
    }
  );
