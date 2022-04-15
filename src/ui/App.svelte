<script lang="ts">
    import Router from 'svelte-spa-router';
    import { register, init, getLocaleFromNavigator, isLoading } from 'svelte-i18n';
    import { routes }from './routes';


    register("en-US",()=>import("../lang/en-us.json"));

    init({
      fallbackLocale: 'en-US',
      initialLocale: getLocaleFromNavigator()
    });

</script>

<div class="App">
  {#if $isLoading}
    <div>
      Loading...
    </div>
    {:else}
    <Router {routes} />
  {/if}
</div>

<style lang="sass">
  .App
    height: 100vh
    width: 100vw
</style>