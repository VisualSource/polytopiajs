<script lang="ts">
    import Router from 'svelte-spa-router';
    import {onMount, onDestroy} from 'svelte';
    import Game from '../../game/core/Game';

    import TileInteraction from './game/TileInteraction.svelte';
    import UserStats from './game/UserStats.svelte';
    import Controls from './game/Controls.svelte';
    import Settings from './game/Settings.svelte';
    import TechTree from './game/techtree/TechTree.svelte';
    import GlobalStats from './game/GlobalStats.svelte';
    import Portals from './game/Portals.svelte';

    let canvas: HTMLCanvasElement;
    const routes = { 
        "/settings": Settings,
        "/tech-tree": TechTree,
        "/stats": GlobalStats,
        "/portals": Portals 
    };
    
    onMount(()=>{
        Game.INSTANCE?.init().then(self=>{
            self.initEngine(canvas);
        });
    });
    onDestroy(()=>{
        Game.INSTANCE?.destory();
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
    <UserStats/>
    <canvas bind:this={canvas} id="polytopia"></canvas>
    <Router {routes} />
    <TileInteraction/>
    <Controls/>
</div>
