import { SimplePool } from "nostr-tools";

export const relaysInit = async (relayUrls: string[]) => {
  const pool = new SimplePool();

  await Promise.all(
    relayUrls.map(async (relayUrl) => {
      await pool.ensureRelay(relayUrl);
    })
  );

  return pool;
};
