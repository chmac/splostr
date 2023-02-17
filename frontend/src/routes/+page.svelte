<script type="ts">
  import Group from "$lib/scenes/Group.svelte";
  import Home from "$lib/scenes/Home.svelte";
  import Router from "svelte-spa-router";
  // import { SvelteComponent } from "svelte";

  const routes = {
    "/": Home,
    "/group/:id": Group,
  };
</script>

<div>
  <Router {routes} />
</div>
