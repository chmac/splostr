<script lang="ts">
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton, { Icon } from "@smui/icon-button";
  import { Svg } from "@smui/common";
  import Menu from "@smui/menu";
  import List, { Item, Separator, Text } from "@smui/list";
  import { mdiGithub } from "@mdi/js";
  import Alerts from "$lib/components/Alerts.svelte";

  let menu: Menu;
</script>

<TopAppBar variant="fixed">
  <Row>
    <Section>
      <IconButton class="material-icons" on:click={() => menu.setOpen(true)}
        >menu</IconButton
      >
      <Menu bind:this={menu}>
        <List>
          <Item>
            <Text>Menu item 1</Text>
          </Item><Separator />
          <Item>
            <Text>Menu item 2</Text>
          </Item><Separator />
          <Item>
            <Text>Menu item 3</Text>
          </Item><Separator />
          <Item>
            <Text>Menu item four</Text>
          </Item>
        </List>
      </Menu>
      <Title>Splostr</Title>
    </Section>
    <Section align="end">
      <IconButton href="https://github.com/chmac/splostr/" target="_blank">
        <Icon component={Svg} viewBox="0 0 24 24"
          ><path fill="currentColor" d={mdiGithub} /></Icon
        >
      </IconButton>
    </Section>
  </Row>
</TopAppBar>

<Alerts />

<div class="container">
  <slot />
</div>

<style>
  :global(body) {
    margin: 0;
    padding-top: 48px;
  }
  :global(header.mdc-top-app-bar) {
    top: 0;
  }
  .container {
    padding: 1rem;
  }
</style>
