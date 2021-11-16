<style lang="sass">
    canvas 
        height: 100vh
        width: 100vw 
        display: block
        background-color: black
</style>


<div id="game-view">
    <canvas bind:this={canvas} id="polytopia"></canvas>
</div>


<script lang="ts">
    import {onMount, onDestroy} from 'svelte';
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