import Player from "./Player";
import type { Tech, Tribe } from "../core/types";


export default class PlayerController {
    static loadFromJson(): PlayerController {
        return new PlayerController();
    }
    public players: Map<Tribe,Player> = new Map();
    public active_player: Tribe = "imperius";
    constructor(){
        this.players.set("imperius",new Player("imperius",null));
        this.players.set("bardur",new Player("bardur",null));
    }
    public playerHasTech(tribe: Tribe, tech: Tech): boolean {
        const player = this.players.get(tribe);
        if(!player) return false;
        return (player.tech as any)[tech] ?? false;
    }
    public toJson(){}

}