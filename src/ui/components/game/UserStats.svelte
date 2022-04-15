<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import Game from '../../../game/core/Game';
    import type {Subscription} from 'rxjs';

    let turn: number = 0;
    let stars: number = 0;
    let score: number = 0;
    let star_gain: number = 0;
    let player_sub: Subscription;
    let turn_sub: Subscription;

    onMount(()=>{
        let game = Game.Get();

        player_sub = game.players.active.player.subscribe(value=>{
            stars = value.stars;
            score = value.score;
            star_gain = value.star_gain;
        });

        turn_sub = game.players.turn.subscribe(value=>{
            turn = value;
        });

    });

    onDestroy(()=>{
        if(player_sub) player_sub.unsubscribe();
        if(turn_sub) turn_sub.unsubscribe();
    });
  
</script>

<style lang="sass">
    @use "../../_variables"
    #stats
        position: absolute 
        top: 5px 
        color: darken(#f8f9fa, 10%)
        display: flex 
        gap: 5px
        right: 0
        left: 0
        margin: 0 auto
        user-select: none
        z-index: variables.$z_scores
        width: max-content
        > div 
            @include variables.flex-column-center()
            > h6, span 
                font-weight: bold
            

</style>

<div id="stats">
    <div id="score">
        <h6>Score</h6>
        <span>{score}</span>
    </div>
    <div id="stars">
        <h6>Stars (+{star_gain})</h6>
        <span>{stars}</span>
    </div>
    <div id="turn">
        <h6>Turn</h6>
        <span>{turn}</span>
    </div>
</div>