<script lang="ts">
  import { pushAlert } from "$lib/services/alerts.service";
  import {
    loadGroupById,
    type GroupData,
  } from "$lib/services/group/group.service";
  import { relayUrls } from "$lib/services/relays.service";
  import ExpensesList from "./components/ExpensesList.svelte";
  import MembersList from "./components/MembersList.svelte";
  import SettlementPlan from "./components/SettlementPlan.svelte";

  export let params = { id: "" };
  const groupId = params.id;
  let groupData: GroupData;
  let loading = true;

  loadGroupById(relayUrls, params.id)
    .then((dataStore) => {
      loading = false;
      dataStore.subscribe((data) => {
        groupData = data;
      });
    })
    .catch((error) => {
      console.error("#GgwFFs loadGroupById error", error);
      pushAlert(error.message, "error", -1);
    });
</script>

{#if loading}
  <p>Loading</p>
{:else}
  <h2>{groupData.profile.name}</h2>
  <p>{groupData.profile.about}</p>

  <MembersList {groupData} />
  <ExpensesList {groupData} />
  <SettlementPlan {groupData} />

  <details>
    <summary>Full technical details of the group data</summary>
    <pre>{JSON.stringify(groupData, null, 2)}</pre>
  </details>
{/if}

<style>
  details {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
</style>
