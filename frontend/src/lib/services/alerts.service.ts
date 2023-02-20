import { writable } from "svelte/store";

export type Alert = {
  message: string;
  type: "info" | "success" | "warning" | "error";
  /** The number of seconds this alert should be shown for, -1 to show forever */
  timeoutSeconds: number;
};

export const alertsStore = writable<Alert[]>([]);

export function pushAlert(
  message: string,
  type: Alert["type"] = "info",
  timeoutSeconds?: number
) {
  const timeoutWasProvided = typeof timeoutSeconds === "number";
  const defaultTimeout = type === "error" ? -1 : 6;
  const calculatedTimeout = timeoutWasProvided
    ? timeoutSeconds
    : defaultTimeout;

  const incomingAlert = {
    message,
    type,
    timeoutSeconds: calculatedTimeout,
  };

  alertsStore.update((alerts) => {
    return (alerts || []).concat(incomingAlert);
  });
}
