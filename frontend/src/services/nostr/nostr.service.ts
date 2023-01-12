import { dateToUnix } from "nostr-react";
import {
  Event,
  generatePrivateKey,
  getEventHash,
  getPublicKey,
  signEvent,
} from "nostr-tools";
import { EXPENSE_EVENT_KIND, GROUP_EVENT_KIND } from "../../app/constants";
import { EventFromRelay } from "../../app/types";

const filterForTag = (key: string) => (tags: string[]) => tags[0] === key;

export const getDTag = (event: EventFromRelay) => {
  const tag = event.tags.find(filterForTag("d"));
  return typeof tag === "undefined" ? tag : tag[1];
};

export const getGroupMembers = (event: EventFromRelay) => {
  const pTags = event.tags.filter(filterForTag("p"));
  const pValues = pTags.map(([, val]) => val);
  return pValues;
};

export const createGroupEvent = (
  name: string,
  privateKey: string,
  hash?: string,
  pubKeys?: string[]
) => {
  const groupHash = typeof hash === "string" ? hash : generatePrivateKey();

  const dTag = ["d", groupHash];

  const pTagsArray = pubKeys || [];
  const pTags = pTagsArray
    .filter((key, index) => pTagsArray.indexOf(key) === index)
    .map((key) => ["p", key]);

  const event: Event = {
    kind: GROUP_EVENT_KIND,
    pubkey: getPublicKey(privateKey),
    content: name,
    created_at: dateToUnix(new Date()),
    tags: [dTag, ...pTags],
  };

  event.id = getEventHash(event);
  event.sig = signEvent(event, privateKey);

  return event;
};

export const createExpenseEvent = (
  group: Required<Event>,
  amount: string,
  privateKey: string
) => {
  const id = getDTag(group);
  if (typeof id === "undefined") {
    throw new Error(
      "#Jsr69v createExpenseEvent() called for event without d tag"
    );
  }

  const event: Event = {
    kind: EXPENSE_EVENT_KIND,
    pubkey: getPublicKey(privateKey),
    content: amount,
    created_at: dateToUnix(new Date()),
    tags: [["e", id]],
  };

  event.id = getEventHash(event);
  event.sig = signEvent(event, privateKey);

  console.log("#RhVTXF createExpenseEvent", event);

  return event;
};
