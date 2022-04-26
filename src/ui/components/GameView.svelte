<script lang="ts">
    import Router, { replace, querystring } from 'svelte-spa-router';
    import {parse} from 'qs';
    import {onMount, onDestroy} from 'svelte';
    import Game from '../../game/core/Game';
    import { timer } from '../../utils/time';
    import { game_routes } from '../routes';

    import TileInteraction from './game/TileInteraction.svelte';
    import UserStats from './game/UserStats.svelte';
    import Controls from './game/Controls.svelte';
import type { Subscription } from 'rxjs';
    
    let game: Game;
    let canvas: HTMLCanvasElement;
    let routes = game_routes;
    let ready: boolean = false;
    let sub: Subscription;
    const prefix = "/playing";

    onMount( async ()=>{
        let settings = parse($querystring ?? "",{ comma: true });
        replace("/playing/loading");
        await timer(100);
        
        game = Game.Get();

        sub = game.ready.subscribe(async (value)=>{
            if(!value) return;
        
            const ok = await game.launchGame(settings as any,canvas);
            if(!ok) return;
            await timer(1000);

            replace(game.settings.confirm_turn ? "/playing/change" : "/playing");

            ready = true;
        });
    });
    onDestroy(()=>{
        game?.destory();
        sub?.unsubscribe();
    });
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
