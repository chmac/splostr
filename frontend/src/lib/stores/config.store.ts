import { persist, createLocalStorage } from "@macfja/svelte-persistent-store";
import { get, writable } from "svelte/store";
import { z } from "zod";

const BaseSchema = z.object({
  relayUrls: z.string().array(),
});
const OptionalPrivateKeySchema = z.object({
  privateKey: z.string().optional(),
});
const RequiredPrivateKeySchema = z.object({
  privateKey: z
    .string()
    .length(64, "#2CttE3 Private key must be exactly 64 characters")
    .regex(/[0-9a-f]/),
});

const ConfigSchema = BaseSchema.and(OptionalPrivateKeySchema);
const ConfigWithPrivateKeySchema = BaseSchema.and(RequiredPrivateKeySchema);

type Config = z.infer<typeof ConfigSchema>;
type ConfigWithPrivateKey = z.infer<typeof ConfigWithPrivateKeySchema>;

const empty: Config = {
  relayUrls: ["wss://nostr-1.afarazit.eu"],
};

export const configStore = persist(
  writable<Config>(empty),
  createLocalStorage(),
  "__splostrConfig"
);

export const configSetPrivateKey = (privateKey: string) => {
  if (privateKey.length !== 64) {
    const message = "#jhpCBI Cannot set invalid private key";
    console.error(message, privateKey);
    throw new Error(message);
  }

  configStore.update((config) => {
    return { ...config, privateKey };
  });
};

export const configHasPrivateKey = () => {
  const config = get(configStore);
  if (typeof config.privateKey === "undefined") {
    return false;
  }
  return true;
};

export const getConfig = (): Config => {
  const config = get(configStore);
  const safeConfig = ConfigSchema.parse(config);
  return safeConfig;
};

export const getConfigWithPrivateKey = (): ConfigWithPrivateKey => {
  const config = getConfig();
  const safeConfig = ConfigWithPrivateKeySchema.parse(config);
  return safeConfig;
};

export const getRelayUrls = () => {
  const { relayUrls } = get(configStore);
  return relayUrls;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).setPrivateKey = configSetPrivateKey;
