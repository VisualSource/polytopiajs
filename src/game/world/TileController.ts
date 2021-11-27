import { nanoid } from "nanoid";
import EventEmitter from "../core/EventEmitter";
import { Tile, BuildTile, TileJson } from "./Tile";
import { ObjectEvents, SystemEvents, UnitEvent } from "../events/systemEvents";
import type Engine from "../core/Engine";
import type AssetLoader from "../loaders/AssetLoader";
import type { WorldTile } from "./generator/WorldGenerator";
import type { SystemEventListener } from "../core/EventEmitter";
import type {Position, Tribe, UUID} from '../core/types';
import type World from "./World";

/**
 * The selected object on this tile.
 *
 * @enum {number}
 */
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

export interface TileControllerJson {
    tribe: Tribe;
    position: Position;
    top: TileJson | null;
    base: TileJson;
}

/**
 * @listens INTERACTION
 * @emits UNIT 
 * @emits INTERACTION
 * @export
 * @class TileController
 * @implements {SystemEventListener}
 */
export default class TileController implements SystemEventListener {
    static createFromJson(json: TileControllerJson){}
    private selected: Selected = Selected.TILE; 
    private isSelected: boolean = false;
    private engine: Engine;
    private assets: AssetLoader;
    private world: World;
    private top: BuildTile | null = null;
    public base: Tile;
    public unit: UUID | null = null; 
    public readonly uuid: UUID = nanoid();
    public events: EventEmitter = new EventEmitter();
    public position: Position;
    public tribe: Tribe;
    public override: {
        type: string;
        id: number;
        data: {
            [prop: string]: any;
        }
    } | null = null;

    constructor({ engine, assets, world, tile_data }: ITileControllerProps){
        this.events.onId<SystemEvents,ObjectEvents>({ name: SystemEvents.INTERACTION, id: ObjectEvents.TILE_SELECT },this.selectionHandle);
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
    public toJSON(): TileControllerJson {
        return {
            top: this.top?.toJSON() ?? null,
            base: this.base.toJSON(),
            tribe: this.tribe,
            position: this.position
        };
    }
    public setUnit(id: UUID | null = null) {
        this.unit = id;
    }
    private deselectionHandle = (): void => {
        this.selected = Selected.TILE;
        this.isSelected = false;
    }
    private resetHandle = (event: any): void => {
        if(event.data.uuid === this.uuid) return;
        this.override = null;
        this.deselectionHandle();
    }
    private selectionHandle = (event: any): void => {
        if(event.data.owner !== this.uuid) return;
      
        if(this.override) {
            this.events.dispatchEvent(this.override);
            return;
        }

        if(!this.isSelected){
            this.events.emit<SystemEvents,ObjectEvents>({type: SystemEvents.INTERACTION, id: ObjectEvents.RESET, data: { uuid: this.uuid } });
            this.isSelected = true;
            if(this.unit) {
                this.selected = Selected.UNIT;
                this.selectionEvent("unit");
                this.events.emit<SystemEvents,UnitEvent>({ type: SystemEvents.UNIT, id: UnitEvent.GENERATE, data: { unit: this.unit } });
                return;
            }
            this.selected = Selected.TILE;
            this.selectionEvent("tile");
            this.events.emit<SystemEvents,UnitEvent>({ type: SystemEvents.UNIT, id: UnitEvent.HIDE_SELECTOR, data: {} });
            return;
        }

        if(this.selected === Selected.UNIT) {
            this.selected = Selected.TILE;
            this.selectionEvent("tile");
            this.events.emit<SystemEvents,UnitEvent>({ type: SystemEvents.UNIT, id: UnitEvent.HIDE_SELECTOR, data: {} });
            return;
        }

        this.deselectionHandle();
        this.events.emit<SystemEvents,ObjectEvents>({ type: SystemEvents.INTERACTION, id: ObjectEvents.DESELECTION, data: { tile_deselection: true } });
    }
    public selectionEvent(type: "unit" | "tile"){
        this.events.emit<SystemEvents,ObjectEvents>({ type: SystemEvents.INTERACTION, id: ObjectEvents.SELECTION, data: {
            world: this.position,
            type
        }});
    }
    public addBuilding(){}
    public removeBuilding(){}
    public async destory(){
        this.events.offId<SystemEvents,ObjectEvents>({name: SystemEvents.INTERACTION, id: ObjectEvents.TILE_SELECT },this.selectionHandle);
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
                id: this.base.id,
                type: "tile"
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
                    id: this.top.id,
                    type: "tile"
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