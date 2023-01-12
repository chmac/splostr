import { generatePrivateKey } from "nostr-tools";

export const NOSTR_RELAY_URLS = [
  // Doesn't support nip33
  // "wss://nostr-pub.wellorder.net",
  // Doesn't support nip33
  // "wss://relay.nostr.ch",
  "wss://relay.nostr.info",
  "wss://relay.nostr.nu",
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
