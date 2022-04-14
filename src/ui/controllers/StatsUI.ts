import { writable } from 'svelte/store';
import Game from '../../game/core/Game';


export default class StatsUI {
    public score = writable(0);
    public stars = writable(0);
    public star_gain = writable(0);
    public turn = writable(0);
    private game = new Game();
    constructor(){
        this.game.players.active.player.subscribe(value=>{
            this.score.set(value.score);
            this.stars.set(value.stars);
            this.star_gain.set(value.star_gain);
        });
        this.game.players.turn.subscribe(turn=>{
            this.turn.set(turn);
        });
    }
}