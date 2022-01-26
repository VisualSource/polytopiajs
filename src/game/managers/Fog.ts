import EventEmitter from "../core/EventEmitter";
import type Engine from "../core/Engine";
import type { SystemEventListener } from "../core/EventEmitter";
import type { Tribe } from "../core/types";
import type World from "../world/World";
import type PlayerController from "./PlayerController";
import { SystemEvents, GameEvent } from "../events/systemEvents"
import type NArray from "../../utils/NArray";

export default class Fog implements SystemEventListener {
    public events: EventEmitter = new EventEmitter();
    private fog_layer: NArray<number>;
    constructor(private world: World, private engine: Engine, private players: PlayerController){
        this.events.onId<SystemEvents, GameEvent>({ name: SystemEvents.GAME_EVENT, id: GameEvent.FOG_CHANGE  },(event)=>{
            this.loadFog(event.data.last,event.data.now);
        });
    }
    public loadFog(old: Tribe | undefined, next: Tribe): void {
        if(old) {
            let fog = this.players.players.get(old);
            if(fog) fog.fog_map = this.fog_layer;
        }

        const player = this.players.players.get(next);
        if(!player) return;
        if(!player.fog_map) return;
        this.fog_layer = player.fog_map;

        for(let row = 0; row < this.fog_layer.size; row++) {
            for(let col = 0; col < this.fog_layer.size; col++) {
                this.updateFog(row,col,this.fog_layer.get(row,col));
            }
        }
        if(player.camera) this.engine.setCameraPos = player.camera;
    }
    public updateFog(row: number, col: number, state: number) {
        const tile = this.world.level.get(row,col);
        if(!tile) return;
        tile.setVisablity(Boolean(state));
    }
}