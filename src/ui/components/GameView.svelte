<script lang="ts">
    import Router, { replace } from 'svelte-spa-router';
    import {onMount, onDestroy} from 'svelte';
    import Game from '../../game/core/Game';
    import { timer } from '../../utils/time';
    import { game_routes } from '../routes';

    import TileInteraction from './game/TileInteraction.svelte';
    import UserStats from './game/UserStats.svelte';
    import Controls from './game/Controls.svelte';
    
    let game: Game;
    let canvas: HTMLCanvasElement;
    let routes = game_routes;
    let ready: boolean = false;
    const prefix = "/playing";

    onMount( async ()=>{
        replace("/playing/loading");
        await timer(100);
        game = Game.Get();

        game.ready.subscribe(async (value)=>{
            if(!value) return;
        
            await game.initEngine(canvas);
            await timer(1000);

            replace(game.settings.confirm_turn ? "/playing/change" : "/playing");

            ready = true;
        });
    });
    onDestroy(()=>game?.destory());
</script>


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
    {#if ready}
        <UserStats/>
    {/if}
    <canvas bind:this={canvas} id="polytopia"></canvas>
    <Router {routes} {prefix}/>
    <TileInteraction/>
    <Controls/>
</div>
