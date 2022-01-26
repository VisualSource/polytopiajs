import EventEmitter from "../core/EventEmitter";
import { SystemEvents, GameEvent } from "../events/systemEvents";
import {nanoid} from 'nanoid';
import InstancedObject, { type WorldObjectData } from '../world/rendered/InstancedObject';
import { MeshBasicMaterial, BoxBufferGeometry } from 'three';
import type Engine from "../core/Engine";
import type { SystemEventListener } from "../core/EventEmitter";
import type { Tribe } from "../core/types";
import type World from "../world/World";
import type PlayerController from "./PlayerController";
import type NArray from "../../utils/NArray";

export default class Fog implements SystemEventListener {
    public events: EventEmitter = new EventEmitter();
    private fog_layer: NArray<number>;
    constructor(private world: World, private engine: Engine, private players: PlayerController){
        this.events.onId<SystemEvents, GameEvent>({ name: SystemEvents.GAME_EVENT, id: GameEvent.FOG_CHANGE  },(event)=>{
            this.loadFog(event.data.last,event.data.now);
        });
    }
    public async init(size: number): Promise<this> {
        try {
            let data: WorldObjectData[] = [];
            for(let row = 0; row < size; row++){
                for(let col = 0; col < size; col++){
                    data.push({
                        x: row,
                        z: col,
                        y: 0,
                        rotation: 0,
                        type: "tile",
                        shown: true,
                        owner: "fog_controller",
                        id: nanoid(10)
                    });
                }
            }

            const mat = new MeshBasicMaterial();
            const geo = new BoxBufferGeometry(2,2,2);

            const fog = new InstancedObject("FOG",geo,mat,data,4,size**2);
            this.engine.scene.add(fog);
        } catch (error) {
            console.log("Failed to create fog layer");
        }
        return this;
    }
    public getObject(): InstancedObject | undefined {
        return this.engine.scene.getObjectByName("FOG") as ( InstancedObject | undefined )
    }
    public setFogTileVisablity(row: number, col: number, state: boolean): void {
        const obj = this.getObject();
        if(!obj) return;
        const item = obj.data.find(value=>value.x===row&&value.z===col);
        if(!item) {
            console.error("Failed to set fog tile visablity");
            return; 
        }
        obj.setVisibility(item.id,state);
    }
    public showAll(): void {
        for(let row = 0; row < this.fog_layer.size; row++) {
            for(let col = 0; col < this.fog_layer.size; col++) {
                this.updateFog(row,col,1);
            }
        }
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
        const bool = Boolean(state);
        this.fog_layer.set(row,col,state);
        tile.setVisablity(bool);
        this.setFogTileVisablity(row,col,!bool);
    }
}