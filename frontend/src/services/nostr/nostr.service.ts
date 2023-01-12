import { dateToUnix } from "nostr-react";
import { Event, getEventHash, getPublicKey, signEvent } from "nostr-tools";

export const createGroupEvent = (name: string, privateKey: string) => {
  const event: Event = {
    kind: 1,
    pubkey: getPublicKey(privateKey),
    content: name,
    created_at: dateToUnix(new Date()),
    tags: [],
  };

  event.id = getEventHash(event);
  event.sig = signEvent(event, privateKey);

  return event;
};
