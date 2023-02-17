<script lang="ts">
  import type { GroupData } from "$lib/services/group.service";

  export let groupData: GroupData;
</script>

<h3>Expenses</h3>
<ul>
  {#each groupData.expenses as expense}
    <li>
      Subject:{expense.subject}<br />Date:{expense.date}<br />Amount: {expense.amount}
    </li>
  {/each}
</ul>
