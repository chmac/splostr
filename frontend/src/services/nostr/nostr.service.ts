import { dateToUnix } from "nostr-react";
import {
  Event,
  generatePrivateKey,
  getEventHash,
  getPublicKey,
  signEvent,
} from "nostr-tools";
import { EXPENSE_EVENT_KIND, GROUP_EVENT_KIND } from "../../app/constants";

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
  const event: Event = {
    kind: EXPENSE_EVENT_KIND,
    pubkey: getPublicKey(privateKey),
    content: amount,
    created_at: dateToUnix(new Date()),
    tags: [["e", group.id]],
  };

  event.id = getEventHash(event);
  event.sig = signEvent(event, privateKey);

  console.log("#RhVTXF createExpenseEvent", event);

  return event;
};
