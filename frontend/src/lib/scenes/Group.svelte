<script lang="ts">
  import { loadGroupById, type GroupData } from "$lib/services/group.service";
  import { dataset_dev } from "svelte/internal";

  export let params = { id: "" };
  let groupData: GroupData;
  let state: "loading" | "loaded" | "error" = "loading";
  let error = "";

  loadGroupById(["wss://nostr-1.afarazit.eu"], params.id)
    .then((dataStore) => {
      state = "loaded";
      dataStore.subscribe((data) => {
        groupData = data;
      });
    })
    .catch((e) => {
      error = e;
    });
  console.log("#cvVetc Group.svelte", params);
</script>

<h1>Group</h1>
<p>Group id is {params.id}</p>
{#if state === "loading"}
  <p>Loading</p>
{:else if state === "error"}
  <p>ERROR: #QDuySq Failed to load data</p>
  <p>{error}</p>
{:else if state === "loaded"}
  <p>Group data coming atcha...</p>
  <pre>{JSON.stringify(groupData, null, 2)}</pre>
{/if}
