import { Filter } from "nostr-tools";
import {
  GROUP_INVITE_RESPONSE_EVENT_KIND,
  GROUP_METADATA_EVENT_KIND,
} from "../../app/constants";

export const createdGroupMetadatasFilter = (publicKey: string): Filter => {
  return {
    kinds: [GROUP_METADATA_EVENT_KIND],
    authors: [publicKey],
  };
};

export const joinedGroupInviteResponsesFilter = (publicKey: string): Filter => {
  return {
    kinds: [GROUP_INVITE_RESPONSE_EVENT_KIND],
    authors: [publicKey],
  };
};
