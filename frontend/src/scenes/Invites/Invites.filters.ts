import { Filter } from "nostr-tools";
import {
  GROUP_CREATE_EVENT_KIND,
  GROUP_INVITE_EVENT_KIND,
} from "../../app/constants";
import { EventFromRelay } from "../../app/types";
import {
  getGroupIdFromInviteEvent,
  getPublicKeyOfEvent,
} from "../../services/nostr/nostr.service";
import { groupMetadataFilter } from "../Group/Group.filters";

export const invitesFilter = (publicKey: string): Filter => {
  return {
    "#p": [publicKey],
    kinds: [GROUP_INVITE_EVENT_KIND],
  };
};

export const invitedGroupMetadataFilter = (
  id: string,
  creatorPublicKey: string
): Filter => {
  return {
    ids: [id],
    kinds: [GROUP_CREATE_EVENT_KIND],
    authors: [creatorPublicKey],
  };
};

export const invitedGroupMetadataFilters = (
  invites: EventFromRelay[]
): Filter[] => {
  return invites.flatMap((invite) => {
    const id = getGroupIdFromInviteEvent(invite);
    const creatorPublicKey = getPublicKeyOfEvent(invite);
    return [
      invitedGroupMetadataFilter(id, creatorPublicKey),
      groupMetadataFilter(id, creatorPublicKey),
    ];
  });
};
