import { Filter } from "nostr-tools";
import {
  EXPENSE_EVENT_KIND,
  GROUP_CREATE_EVENT_KIND,
  GROUP_INVITE_EVENT_KIND,
  GROUP_INVITE_RESPONSE_EVENT_KIND,
  GROUP_METADATA_EVENT_KIND,
} from "../../app/constants";

export const groupCreateByIdFilter = (id: string): Filter => {
  return {
    ids: [id],
    kinds: [GROUP_CREATE_EVENT_KIND],
  };
};

export const userProfileFilter = (id: string): Filter => {
  return {
    authors: [id],
    kinds: [0],
  };
};

export const userProfilesFilter = (ids: string[]): Filter => {
  return {
    authors: ids,
    kinds: [0],
  };
};

export const groupMetadataFilter = (
  id: string,
  adminPublicKey: string
): Filter => {
  return {
    "#d": [id],
    kinds: [GROUP_METADATA_EVENT_KIND],
    authors: [adminPublicKey],
  };
};

export const groupInviteFilter = (
  id: string,
  adminPublicKey: string
): Filter => {
  return {
    "#e": [id],
    kinds: [GROUP_INVITE_EVENT_KIND],
    authors: [adminPublicKey],
  };
};

export const groupInviteResponseFilter = (
  id: string,
  groupMemberPublicKeys: string[]
): Filter => {
  return {
    "#e": [id],
    kinds: [GROUP_INVITE_RESPONSE_EVENT_KIND],
    authors: groupMemberPublicKeys,
  };
};

export const groupExpensesFilter = (
  id: string,
  groupMemberPublicKeys: string[]
): Filter => {
  return {
    "#e": [id],
    kinds: [EXPENSE_EVENT_KIND],
    authors: groupMemberPublicKeys,
  };
};
