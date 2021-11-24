import { nanoid } from "nanoid";
import EventEmitter from "../core/EventEmitter";
import { Tile, BuildTile } from "./Tile";
import { ObjectEvents, SystemEvents } from "../events/systemEvents";
import type Engine from "../core/Engine";
import type AssetLoader from "../loaders/AssetLoader";
import type { WorldTile } from "./generator/WorldGenerator";
import type { SystemEventListener } from "../core/EventEmitter";
import type {Position, Tribe, UUID} from '../core/types';
import type World from "./World";

enum Selected {
    TILE,
    UNIT
}

interface ITileControllerProps {
    engine: Engine;
    assets: AssetLoader;
    world: World
    tile_data: WorldTile;
}

export default class TileController implements SystemEventListener {
    private selected: Selected = Selected.TILE; 
    private isSelected: boolean = false;
    private engine: Engine;
    private assets: AssetLoader;
    private world: World;
    private top: BuildTile | null = null;
    private base: Tile;
    private unit: UUID | null = null; 
    public readonly uuid: UUID = nanoid();
    public events: EventEmitter = new EventEmitter();
    public position: Position;
    public tribe: Tribe;
    public override: {
        type: string;
        id: number;
    } | null = null;

    constructor({ engine, assets, world, tile_data }: ITileControllerProps){
        this.events.onId<SystemEvents,ObjectEvents>({ name: SystemEvents.INTERACTION, id: ObjectEvents.SELECTION },this.selectionHandle);
        this.events.onId<SystemEvents,ObjectEvents>({ name: SystemEvents.INTERACTION, id: ObjectEvents.RESET }, this.resetHandle);
        this.events.onId<SystemEvents,ObjectEvents>({ name: SystemEvents.INTERACTION, id: ObjectEvents.DESELECTION }, this.deselectionHandle);
        this.engine = engine;
        this.assets = assets;
        this.world = world;
        this.position = { row: tile_data.row, col: tile_data.col };
        this.tribe = tile_data.tribe;
        this.base = new Tile(tile_data.base, tile_data.metadata);
        if(tile_data.buldings.length > 0) this.top = new BuildTile(tile_data.buldings);

    }
    private deselectionHandle = (): void => {
        this.selected = Selected.TILE;
        this.isSelected = false;
    }
    private resetHandle = (event: any): void => {
        if(event.data.uuid === this.uuid) return;
        this.deselectionHandle();
    }
    private selectionHandle = (event: any): void => {
        if(event.data.owner !== this.uuid) return;

        if(this.override) {
            return;
        }

        if(!this.isSelected){
            this.events.emit<SystemEvents,ObjectEvents>({type: SystemEvents.INTERACTION, id: ObjectEvents.RESET, data: { uuid: this.uuid } });
            this.isSelected = true;
            if(this.unit) {
                this.events.emit<SystemEvents,ObjectEvents>({ type: SystemEvents.INTERACTION, id: ObjectEvents.UNIT_SELECT, data: {}});
                this.selected = Selected.UNIT;
                return;
            }
            this.selected = Selected.TILE;
            return;
        }

        if(this.selected === Selected.UNIT) {
            this.selected = Selected.TILE;
            return;
        }

        this.deselectionHandle();
        this.events.emit<SystemEvents,ObjectEvents>({ type: SystemEvents.INTERACTION, id: ObjectEvents.DESELECTION, data: { tile_deselection: true } });
    }
    public addBuilding(){}
    public removeBuilding(){}
    public async destory(){
        this.events.offId<SystemEvents,ObjectEvents>({name: SystemEvents.INTERACTION, id: ObjectEvents.SELECTION },this.selectionHandle);
    }
    /**
     * Generate tiles and add them to threejs scene
     *
     * @memberof TileController
     */
    public async render(){
        try {
            // Generate base level asset
            const base_type = this.base.getType(this.tribe);
            let obj = this.engine.scene.getObjectInstance(base_type);
            if(!obj) {
                const {asset,type,item} = this.base.manifest(this.tribe);
                const model = await this.assets.getAsset(asset,item,type);
                obj = this.engine.scene.createObjectInstance(base_type,model.geometry,model.material);
            }

            obj.createInstance({
                index: 0,
                owner: this.uuid,
                rotation: this.base.metadata?.rotation ?? 0,
                shown: true,
                x: this.position.row,
                z: this.position.col,
                y: 0,
                id: this.base.id
            });

            if(this.top){
                const top_type = this.top.getType(this.tribe);
                let obj = this.engine.scene.getObjectInstance(top_type);
                if(!obj){
                    const {asset,item,type} = this.top.manifest(this.tribe);
                    const model = await this.assets.getAsset(asset,item,type);
                    obj = this.engine.scene.createObjectInstance(base_type,model.geometry,model.material);
                }

                obj.createInstance({
                    index: 0,
                    owner: this.uuid,
                    rotation: this.top.metadata?.rotation ?? 0,
                    shown: true,
                    x: this.position.row,
                    z: this.position.col,
                    y: 1,
                    id: this.top.id
                });
            }

            // Genearte top level assets
            
        } catch (error: any) {
            console.warn(
                `Failed to render object | ${this.uuid} |`,
                `Why: ${error.message}`
            );
        }
    }
}