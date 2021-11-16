<script lang="ts">
    import AppInfo from './components/AppInfo.svelte';
    import GameView from './components/GameView.svelte';

    import {onMount} from 'svelte';


    let count: number = 0;
    onMount(() => {
      const interval = setInterval(() => count++, 1000);
      return () => {
        clearInterval(interval);
      };
    });
  </script>

  <div class="App">
    <GameView/>
    <AppInfo/>
  </div>


<style lang="sass">
  .App
    height: 100vh
</style>