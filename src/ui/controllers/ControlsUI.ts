import { writable } from 'svelte/store';

export default class ControlsUI {
    public turnText = writable("End Turn"); // End Turn - Finish Game
    public turnColor = writable("bg-dark"); // bg-dark - bd-primary - bg-success
    constructor(){

    }
    public setActions(){
        this.turnText.set("End Turn");
        this.turnColor.set("bg-dark");
    }
    public setNoActions(){
        this.turnText.set("End Turn");
        this.turnColor.set("bg-primary");
    }
    public setEndGame(){
        this.turnText.set("Finish Game");
        this.turnColor.set("bg-success");
    }
}