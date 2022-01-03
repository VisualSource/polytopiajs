import Player from "./Player";
import type { Tech, Tribe } from "../core/types";

export default class PlayerController {
    static loadFromJson(): PlayerController {
        return new PlayerController().jsonConstructor();
    }
    static init(tribes: Tribe[]): PlayerController {
        return new PlayerController().defaultConstructor(tribes);
    }
    public players: Map<Tribe,Player> = new Map();
    private _active_player: Tribe = "imperius";
    constructor(){}
    set activePlayer(value: Tribe){
        this._active_player = value;
        // should throw a event here if need
    }
    get activePlayer(): Tribe {
        return this._active_player;
    }
    public jsonConstructor(): this {
        return this;
    }
    public defaultConstructor(tribes: Tribe[]): this {
        for(const tribe of tribes){
            this.players.set(tribe,new Player(tribe,null));
        }
        return this;
    }
    public activePlayerHas(tech: Tech): boolean {
        return this.playerHasTech(this.activePlayer,tech);
    }
    public playerHasTech(tribe: Tribe, tech: Tech): boolean {
        const player = this.players.get(tribe);
        if(!player) return false;
        return (player.tech as any)[tech] ?? false;
    }
    public toJson(){
        let players: any[] = [];
        this.players.forEach((value)=>{
            players.push(value.toJSON());
        });
        return {
            players,
            active_player: this._active_player
        };
    }

}