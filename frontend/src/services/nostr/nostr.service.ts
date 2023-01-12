import { dateToUnix } from "nostr-react";
import {
  Event,
  generatePrivateKey,
  getEventHash,
  getPublicKey,
  signEvent,
} from "nostr-tools";
import { EVENT_KIND } from "../../app/constants";

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
    kind: EVENT_KIND,
    pubkey: getPublicKey(privateKey),
    content: name,
    created_at: dateToUnix(new Date()),
    tags: [dTag, ...pTags],
  };

  event.id = getEventHash(event);
  event.sig = signEvent(event, privateKey);

  return event;
};
