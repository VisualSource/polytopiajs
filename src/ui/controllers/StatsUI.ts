import { writable } from 'svelte/store';
import { SystemEvents, UIEvent } from '../../game/events/systemEvents';
import Game from '../../game/core/Game';


export default class StatsUI {
    public score = writable(0);
    public stars = writable(0);
    public star_gain = writable(0);
    public turn = writable(0);
    private game = new Game();
    constructor(){
        this.game.events.on(SystemEvents.UI,this.eventHandle);
    }
    private eventHandle = (event: any) => {
        switch (event.id) {
            case UIEvent.ALL:
                this.score.set(event.data.score);
                this.star_gain.set(event.data.star_gain);
                this.stars.set(event.data.stars);
                this.turn.set(event.data.turn);
                break;
            case UIEvent.SCORE_CHANGE:
                this.score.set(event.data.score);
                break;
            case UIEvent.STARS_CHANGE:
                this.stars.set(event.data.stars);
                break;
            case UIEvent.STAR_GAIN_CHANGE:
                this.star_gain.set(event.data.star_gain);
                break;
            case UIEvent.TURN_CHANGE:
                this.turn.set(event.data.turn);
                break;
            default:
                break;
        }
    }
}