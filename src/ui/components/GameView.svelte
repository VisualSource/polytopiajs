<style lang="sass">
    #game-view 
        height: 100%
        width: 100%
    canvas 
        height: 100vh
        width: 100vw 
        display: block
        background-color: var(--bs-dark)
</style>


<div id="game-view">
    <canvas bind:this={canvas} id="polytopia"></canvas>
    <TileInteraction/>
</div>


<script lang="ts">
    import {onMount, onDestroy} from 'svelte';
    import TileInteraction from './game/TileInteraction.svelte';
    import Game from '../../game/core/Game';
    let canvas: HTMLCanvasElement;

    onMount(()=>{
        Game.INSTANCE?.init().then(self=>{
            self.initEngine(canvas);
        });
    });
    onDestroy(()=>{
        Game.INSTANCE?.destory();
    });
    
</script>