<script lang="ts">
  import Kitchen from "@smui/snackbar/kitchen";
  import { alertsStore, type Alert } from "$lib/services/alerts.service";
  import "./Alerts.scss";

  let kitchen: Kitchen;

  alertsStore.subscribe((alerts) => {
    if (alerts.length === 0) {
      return;
    }
    alerts.forEach((alert) => {
      const { message, timeoutSeconds, type } = alert;

      kitchen.push({
        props: {
          timeoutMs: timeoutSeconds === -1 ? -1 : timeoutSeconds * 1_000,
          class: type,
        },
        label: message,
        dismissButton: true,
        dismissText: "close",
        dismissTitle: "Dismiss",
      });
    });
    alertsStore.set([]);
  });
</script>

<Kitchen bind:this={kitchen} dismiss$class="material-icons" />
