import { writable } from 'svelte/store';
import Game from '../../game/core/Game';

export default class ControlsUI {
    public turnText = writable("End Turn"); // End Turn - Finish Game
    public turnColor = writable("bg-dark"); // bg-dark - bd-primary - bg-success
    private game = new Game();
    constructor(){

    }
    public nextTurn = () => {
        this.game.players.changeTurn();
    }
    public setActions(){
        this.turnText.set("game.ui.btn.end_turn");
        this.turnColor.set("bg-dark");
    }
    public setNoActions(){
        this.turnText.set("game.ui.btn.end_turn");
        this.turnColor.set("bg-primary");
    }
    public setEndGame(){
        this.turnText.set("game.ui.btn.finish_turn");
        this.turnColor.set("bg-success");
    }
}