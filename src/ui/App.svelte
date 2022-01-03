<script lang="ts">
    import Router from 'svelte-spa-router';
    import routes from './routes';
</script>

<div class="App">
  <Router {routes} />
</div>

<style lang="sass">
  .App
    height: 100vh
    width: 100vw
</style>