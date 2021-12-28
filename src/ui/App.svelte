<script lang="ts">
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
  </div>


<style lang="sass">
  .App
    height: 100vh
    width: 100vw
</style>