import { generatePrivateKey } from "nostr-tools";

export const NOSTR_RELAY_URLS = [
  "wss://nostr-pub.wellorder.net",
  "wss://relay.nostr.ch",
];

export const EVENT_KIND = 32910;

const storageKeyKey = "__nostrKey";

export const PRIVATE_KEY = globalThis.localStorage.getItem(
  storageKeyKey
) as string;

if (PRIVATE_KEY === null || PRIVATE_KEY.length !== 64) {
  const key = globalThis.prompt("Enter your private key") as string;
  if (key === null || key.length !== 64) {
    globalThis.alert(
      `ERROR #1GcNrT - Invalid private key, try ${generatePrivateKey()}.`
    );
  }
  localStorage.setItem(storageKeyKey, key);
  globalThis.document.location.reload();
}
