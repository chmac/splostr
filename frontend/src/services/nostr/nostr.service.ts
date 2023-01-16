import { dateToUnix } from "nostr-react";
import {
  Event,
  getEventHash,
  getPublicKey,
  nip26,
  signEvent,
} from "nostr-tools";
import {
  EXPENSE_EVENT_KIND,
  GROUP_CREATE_EVENT_KIND,
  GROUP_INVITE_EVENT_KIND,
  GROUP_INVITE_RESPONSE_EVENT_KIND,
  GROUP_METADATA_EVENT_KIND,
} from "../../app/constants";
import { EventFromRelay } from "../../app/types";

export type NostrProfile = {
  name?: string;
  about?: string;
  picture?: string;
};

export const filterForTag = (key: string) => (tags: string[]) =>
  tags[0] === key;

export const getDTag = (event: EventFromRelay) => {
  const tag = event.tags.find(filterForTag("d"));
  return typeof tag === "undefined" ? tag : tag[1];
};

export const getEventTagValue = (event: EventFromRelay, key: string) => {
  const tag = event.tags.find(filterForTag(key));
  if (typeof tag === "undefined") {
    return;
  }
  return tag[1];
};

export const getEvent = (event: EventFromRelay) => {
  const tag = event.tags.find(filterForTag("subject"));
  if (typeof tag === "undefined") {
    return "";
  }
  return tag[1];
};

export const getGroupIdFromInviteEvent = (event: EventFromRelay) => {
  const eTags = event.tags.filter(filterForTag("e"));
  const eventIdTag = eTags.find((event) => event[3] === "root");
  if (typeof eventIdTag === "undefined") {
    debugger;
    throw new Error("#CzhDSe Invite acceptance does not contain e root tag");
  }
  const id = eventIdTag[1];
  return id;
};

export const getGroupIdFromMetadataEvent = (event: EventFromRelay) => {
  const id = getDTag(event);
  if (typeof id === "undefined") {
    debugger;
    throw new Error("#zyo3Rl Metadata event does not contain a d tag");
  }
  return id;
};

export const getPubkeyOfEvent = (event: EventFromRelay) => {
  const maybeDelegator = nip26.getDelegator(event);
  return maybeDelegator || event.pubkey;
};

export const getProfileFromEvent = (event?: EventFromRelay) => {
  if (typeof event === "undefined") {
    return {};
  }
  const profileJson = event.content;
  try {
    const profile = JSON.parse(profileJson);
    return profile;
  } catch (e) {}
  return {};
};

export const getGroupMembers = (event: EventFromRelay) => {
  const pTags = event.tags.filter(filterForTag("p"));
  const pValues = pTags.map(([, val]) => val);
  return pValues;
};

export const signEventWithPrivateKey = (
  unsignedEvent: Event,
  privateKey: string
): EventFromRelay => {
  const id = getEventHash(unsignedEvent);
  const toSign = { id, ...unsignedEvent };
  const sig = signEvent(toSign, privateKey);
  return { sig, ...toSign };
};

export const createProfileUpdateEvent = (
  profile: { name: string; about?: string; picture?: string },
  privateKey: string
) => {
  const profileJson = JSON.stringify(profile);
  const unsignedEvent: Event = {
    kind: 0,
    pubkey: getPublicKey(privateKey),
    content: profileJson,
    created_at: dateToUnix(new Date()),
    tags: [],
  };

  const event = signEventWithPrivateKey(unsignedEvent, privateKey);

  return event;
};

export const createGroupCreateEvent = (privateKey: string) => {
  const unsignedEvent: Event = {
    kind: GROUP_CREATE_EVENT_KIND,
    pubkey: getPublicKey(privateKey),
    content: "",
    created_at: dateToUnix(new Date()),
    tags: [],
  };

  const event = signEventWithPrivateKey(unsignedEvent, privateKey);

  return event;
};

export const createGroupMetadataEvent = (
  privateKey: string,
  groupId: string,
  metadata: {
    name: string;
    about?: string;
    picture?: string;
  }
) => {
  const metaJson = JSON.stringify(metadata);

  const unsignedEvent: Event = {
    kind: GROUP_METADATA_EVENT_KIND,
    pubkey: getPublicKey(privateKey),
    content: metaJson,
    created_at: dateToUnix(new Date()),
    tags: [["d", groupId]],
  };

  const event = signEventWithPrivateKey(unsignedEvent, privateKey);

  return event;
};

export const createGroupInviteEvent = (
  privateKey: string,
  groupId: string,
  publicKey: string
) => {
  const unsignedEvent: Event = {
    kind: GROUP_INVITE_EVENT_KIND,
    pubkey: getPublicKey(privateKey),
    content: "",
    created_at: dateToUnix(new Date()),
    tags: [
      ["e", groupId, "", "root"],
      ["p", publicKey],
    ],
  };

  const event = signEventWithPrivateKey(unsignedEvent, privateKey);

  return event;
};

export const createGroupInviteAcceptEvent = (
  privateKey: string,
  groupId: string,
  inviteEvent: EventFromRelay
) => {
  const unsignedEvent: Event = {
    kind: GROUP_INVITE_RESPONSE_EVENT_KIND,
    pubkey: getPublicKey(privateKey),
    content: "",
    created_at: dateToUnix(new Date()),
    tags: [
      ["e", groupId, "", "root"],
      ["e", inviteEvent.id, "", "reply"],
    ],
  };

  const event = signEventWithPrivateKey(unsignedEvent, privateKey);

  return event;
};

export const createExpenseEvent = (
  privateKey: string,
  groupId: string,
  amount: string,
  publicKeys: string[],
  date: string,
  subject: string
) => {
  const unsignedEvent: Event = {
    kind: EXPENSE_EVENT_KIND,
    pubkey: getPublicKey(privateKey),
    content: amount,
    created_at: dateToUnix(new Date()),
    tags: [
      ["e", groupId, "", "root"],
      ...publicKeys.map((key) => ["p", key]),
      ["subject", subject],
      ["date", date],
    ],
  };

  const event = signEventWithPrivateKey(unsignedEvent, privateKey);

  return event;
};
