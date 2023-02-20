import { getConfigWithPrivateKey } from "$lib/stores/config.store";
import dateToUnix from "$lib/utils";
import {
  getEventHash,
  getPublicKey,
  signEvent,
  SimplePool,
  type EventTemplate,
} from "nostr-tools";

export type PublishEvent = Omit<EventTemplate, "created_at">;

export const relayUrls = ["wss://nostr-1.afarazit.eu"];

export const pool = new SimplePool();

export function publish(event: PublishEvent): Promise<void> {
  return new Promise((resolve, reject) => {
    // TODO - Figure out how to reconnect if necessary here
    try {
      const { privateKey, relayUrls } = getConfigWithPrivateKey();

      const created_at = dateToUnix();
      const pubkey = getPublicKey(privateKey);
      const unsignedEventWithoutId = { ...event, pubkey, created_at };
      const id = getEventHash(unsignedEventWithoutId);
      const unsignedEvent = { ...unsignedEventWithoutId, id };
      const sig = signEvent(unsignedEvent, privateKey);
      const signedEvent = { ...unsignedEvent, sig };

      console.log("#5aKhLP Publishing", signedEvent);
      const publications = pool.publish(relayUrls, signedEvent);

      let successes = 0;

      publications.forEach((publication) => {
        publication.on("ok", () => {
          successes++;
          if (successes === publications.length) {
            resolve();
          }
        });
        publication.on("failed", () => {
          const message = "#N3pXox Publication partially failed";
          console.error(message);
          reject(new Error(message));
        });
      });

      setTimeout(() => {
        reject(new Error("#8DknBA Publishing timed out"));
      }, 3000);
    } catch (error) {
      reject(error);
    }
  });
}
