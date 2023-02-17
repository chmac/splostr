<script lang="ts">
  import { loadGroupById, type GroupData } from "$lib/services/group.service";

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
</script>

{#if state === "loading"}
  <p>Loading</p>
{:else if state === "error"}
  <p>ERROR: #QDuySq Failed to load data</p>
  <p>{error}</p>
{:else if state === "loaded"}
  <h2>{groupData.profile.name}</h2>
  <p>{groupData.profile.about}</p>
  <h3>Members</h3>
  <ul>
    {#each Object.entries(groupData.members) as [id, member]}
      <li>{member.name} (id: {member.id}) for {member.shares} share(s)</li>
    {/each}
  </ul>
  <h3>Expenses</h3>
  <ul>
    {#each groupData.expenses as expense}
      <li>
        Subject:{expense.subject}<br />Date:{expense.date}<br />Amount: {expense.amount}
      </li>
    {/each}
  </ul>
  <details>
    <summary>Full details of the group data</summary>
    <pre>{JSON.stringify(groupData, null, 2)}</pre>
  </details>
{/if}
