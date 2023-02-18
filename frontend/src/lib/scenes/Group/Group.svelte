<script lang="ts">
  import { loadGroupById, type GroupData } from "$lib/services/group.service";
  import { relayUrls } from "$lib/services/relays.service";
  import ExpensesList from "./components/ExpensesList.svelte";
  import MembersList from "./components/MembersList.svelte";

  export let params = { id: "" };
  const groupId = params.id;
  let groupData: GroupData;
  let state: "loading" | "loaded" | "error" = "loading";
  let error = "";

  loadGroupById(relayUrls, params.id)
    .then((dataStore) => {
      state = "loaded";
      dataStore.subscribe((data) => {
        groupData = data;
      });
    })
    .catch((e) => {
      error = e;
    });
</script>

{#if state === "loading"}
  <p>Loading</p>
{:else if state === "error"}
  <p>ERROR: #QDuySq Failed to load data</p>
  <p>{error}</p>
{:else if state === "loaded"}
  <h2>{groupData.profile.name}</h2>
  <p>{groupData.profile.about}</p>

  <MembersList {groupData} />
  <ExpensesList {groupData} />

  <details>
    <summary>Full details of the group data</summary>
    <pre>{JSON.stringify(groupData, null, 2)}</pre>
  </details>
{/if}

<style>
  details {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
</style>
