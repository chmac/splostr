<script lang="ts">
  import {
    getMemberNameFromGroupData,
    getSettlementPlan,
    type GroupData,
  } from "$lib/services/group/group.service";

  export let groupData: GroupData;

  const paymentPlan = getSettlementPlan(groupData);
</script>

<h2>Settlement</h2>

<ul>
  {#each paymentPlan as { from, to, amount }}
    <li>
      From {getMemberNameFromGroupData(groupData, from)} to {getMemberNameFromGroupData(
        groupData,
        to
      )} for {amount}
    </li>
  {/each}
</ul>
