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
  timeoutSeconds = 10
) {
  const incomingAlert = {
    message,
    timeoutSeconds,
    type,
  };
  alertsStore.update((alerts) => {
    return (alerts || []).concat(incomingAlert);
  });
}
