<script lang="ts">
  import {
    updateMemberData,
    type GroupData,
  } from "$lib/services/group/group.service";
  import { getPublicKeyOfEvent } from "$lib/services/nostr.service";
  import { configStore } from "$lib/stores/config.store";
  import Button from "@smui/button";
  import List, { Item, PrimaryText, SecondaryText, Text } from "@smui/list";
  import Textfield from "@smui/textfield";
  import { getPublicKey } from "nostr-tools";
  import { prop, sortBy } from "remeda";

  export let groupData: GroupData;

  let error = "";
  let dialog: HTMLDialogElement;
  let editingId = "";
  let editingName = "";
  let editingShares = "";

  let privateKey: string | undefined;
  $: publicKey =
    typeof privateKey === "string" ? getPublicKey(privateKey) : undefined;
  configStore.subscribe((config) => (privateKey = config.privateKey));
  $: isGroupOwner =
    typeof groupData?.events?.create !== "undefined"
      ? getPublicKeyOfEvent(groupData.events.create) === publicKey
      : false;

  const openEditMember = (id?: string) => {
    error = "";
    if (typeof id === "undefined") {
      editingId = "";
      editingName = "";
      editingShares = "1";
    } else {
      editingId = id;
      editingName = groupData.members[id].name;
      editingShares = groupData.members[id].shares.toString();
    }
    dialog.showModal();
  };

  const membersArray = sortBy(Object.values(groupData.members), prop("name"));
</script>

<h3>Members</h3>
<List twoLine nonInteractive>
  {#each membersArray as member}
    <Item>
      <Text>
        <PrimaryText>
          {member.name}
        </PrimaryText>
        <SecondaryText>
          Shares: {member.shares}
          {#if isGroupOwner}
            <Button
              variant="outlined"
              style="height: 1.4rem;"
              on:click={() => {
                openEditMember(member.id);
              }}>Edit</Button
            >
          {/if}
        </SecondaryText>
      </Text>
    </Item>
  {/each}
</List>

{#if isGroupOwner}
  <Button on:click={() => openEditMember()}>Add new member</Button>

  <dialog bind:this={dialog}>
    <form
      method="dialog"
      on:submit|preventDefault={() => {
        updateMemberData(groupData, {
          id: editingId,
          name: editingName,
          shares: parseInt(editingShares),
        }).then((result) => {
          if (result.success) {
            dialog.close();
          } else {
            error = result.message;
          }
        });
      }}
    >
      {#if error === ""}
        <p>
          <Textfield bind:value={editingName} label="Name" />
        </p>
        <p>
          <Textfield bind:value={editingShares} label="Shares" type="number" />
        </p>
        <p class="buttons">
          <Button on:click={() => dialog.close()}>Cancel</Button>
          <Button type="save">Save</Button>
        </p>
      {:else}
        <h3>Error</h3>
        <p>{error}</p>
        <p class="buttons">
          <Button on:click={() => dialog.close()}>Close</Button>
        </p>
      {/if}
    </form>
  </dialog>
{/if}

<style>
  dialog::backdrop {
    background-color: lightgrey;
    opacity: 0.8;
  }
  p.buttons {
    display: flex;
    justify-content: flex-end;
  }
</style>
