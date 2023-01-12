import { generatePrivateKey } from "nostr-tools";

export const PRIVATE_KEY = globalThis.prompt(
  "Enter your private key"
) as string;
if (PRIVATE_KEY === null || PRIVATE_KEY.length !== 64) {
  globalThis.alert(
    `ERROR #1GcNrT - Invalid private key, try ${generatePrivateKey()}.`
  );
  globalThis.document.location.reload();
}

export const NOSTR_RELAY_URLS = [
  "wss://nostr-pub.wellorder.net",
  "wss://relay.nostr.ch",
];
