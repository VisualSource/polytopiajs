import { nanoid } from "nanoid";
import EventEmitter, { type SystemEventListener } from "../core/EventEmitter";
import { Tile, BuildTile, City } from "./Tile";
import { ObjectEvents, SystemEvents, UnitEvent } from "../events/systemEvents";
import { RenderOrder } from "../core/renderOrder";
import type { TileJson, CityJson } from './Tile';
import type { WorldTile } from "./generator/WorldGenerator";
import type {Position, TileBase, Tribe, UUID} from '../core/types';
import type InstancedObject from "./rendered/InstancedObject";
import type CityTile from "./rendered/CityTile";
import type Game from "../core/Game";
import { GreaterDepth } from "three";

/**
 * The selected object on this tile.
 *
 * @enum {number}
 */
enum Selected {
    TILE,
    UNIT
}
export interface TileControllerJson {
    tribe: Tribe;
    position: Position;
    top: TileJson | null;
    base: TileJson | CityJson;
    road: boolean;
    owning_tribe: Tribe | null;
}

/**
 * @listens INTERACTION
 * @emits UNIT 
 * @emits INTERACTION
 */
export default class TileController implements SystemEventListener {
    /**
     * @constructor
     */
    static createFromJson(game: Game, json: TileControllerJson): TileController {
        return new TileController(game).initFromJson(json);
    }
    /**
     *@constructor
     */
    static createNew(game: Game, tile_data: WorldTile): TileController {
        return new TileController(game).init(tile_data);
    }
    public selected: Selected = Selected.TILE; 
    public readonly uuid: UUID = nanoid();
    public visible: boolean = false;
    public road: boolean = false;
    public top: BuildTile | null = null;
    public base: Tile | City;
    public unit: UUID | null = null;
    public events: EventEmitter = new EventEmitter();
    public position: Position;
    public owning_tribe: Tribe | null = null;
    public owning_city: UUID | null = null;
    // A event to throw when tile is selected instead of the default behavior
    public override: {
        type: string;
        id: number;
        data: {
            [prop: string]: any;
        }
    } | null = null;
    private tribe: Tribe;
    private isSelected: boolean = false;
    private constructor(private game: Game){
        this.events.on(SystemEvents.INTERACTION,(event)=>{
            switch (event.id) {
                case ObjectEvents.TILE_SELECT:
                    return this.selectionHandle(event);
                case ObjectEvents.RESET:
                    return this.resetHandle(event);
                case ObjectEvents.DESELECTION:
                    return this.deselectionHandle();
                default:
                    break;
            }
        });
    }  
    public getTopModalName(): string | undefined {
        return this.top?.getType(this.tribe);
    }
    public getBaseModalName(): string {
        return this.base.getType(this.tribe);
    }
    public terrainBouns(): number {
        switch (this.base.type) {
            case "LAND":
                return 1;
            case "FOREST":
                if(this.owning_tribe && this.game.players.playerHasTech(this.owning_tribe,"archery")) return 1.5;
                return 1;
            case "WATER":
            case "OCEAN":
                if(this.owning_tribe && this.game.players.playerHasTech(this.owning_tribe,"aquatism")) return 1.5;
                return 1;
            case "MOUNTAIN":
                if(this.owning_tribe && this.game.players.playerHasTech(this.owning_tribe,"meditation")) return 1.5;
                return 1;
            case "CITY":
                const unit = this.game.engine.scenes. unit.getUnit(this.unit as UUID);
                if(this.base.metadata?.cityWall && unit?.tribe === this.owning_tribe && unit?.skills.includes("FORTIFY")) return 4;
                return 1;
            default:
                return 1;
        }
    }
    /**
     * @constructor
     *
     * @param {WorldTile} tile_data
     * @return {*}  {this}
     * @memberof TileController
     */
    public init(tile_data: WorldTile): this {
        this.position = { row: tile_data.row, col: tile_data.col };
        this.tribe = tile_data.tribe;
        if(tile_data.base === "CITY") {
            this.owning_tribe = this.tribe;
            this.road = true;
            this.base = City.cityDefaultConstructor({ tribe: this.tribe, ...tile_data.metadata } as any);
        } else {
            this.base = Tile.defaultConstructor(tile_data.base as TileBase, tile_data.metadata);
            if(tile_data.buldings.length > 0) this.top = BuildTile.createNew(tile_data.buldings);
        }
        this.game.engine.scenes.tile.insertTile(this.uuid,this.position);
        return this;
    }
    /**
     * @constructor
     * @memberof TileController
     */
    public initFromJson(json: TileControllerJson): this {
        this.position = json.position;
        this.tribe = json.tribe;
        if(json.base.type === "CITY") {
            this.base = City.cityJsonConstructor(json.base as CityJson)
        } else {
            this.base = Tile.jsonConstructor(json.base);
            this.top = BuildTile.createFromJson(json.top);
        }
        this.road = json.road;
        this.owning_tribe = json.owning_tribe;
        this.game.engine.scenes.tile.insertTile(this.uuid,this.position);
        return this;
    }
    public toJSON(): TileControllerJson {
        return {
            top: this.top?.toJSON() ?? null,
            base: this.base.toJSON(),
            tribe: this.tribe,
            position: this.position,
            road: this.road,
            owning_tribe: this.owning_tribe
        };
    }
    public setUnit(id: UUID | null = null): this {
        this.unit = id;
        return this;
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
    public selectionEvent(type: "unit" | "tile"): void {
        this.events.emit<SystemEvents,ObjectEvents>({ type: SystemEvents.INTERACTION, id: ObjectEvents.SELECTION, data: {
            world: this.position,
            type
        }});
    }
    public async addBuilding(): Promise<void> {
        try {
            if(this.top) throw new Error(`${this.top.type} already exists on this tile`);
        } catch (error) {
            console.error(error);
        }
    }
    public removeBuilding(): void {
        if(!this.top) return;
        try {
            console.log(this.position);
            const top_type = this.top.getType(this.tribe);
            let obj = this.game.engine.scenes.tile.getObject<InstancedObject>(top_type);
            if(!obj) throw new Error(`Failed to destory object | ${top_type}:${this.top.id} | Why: Object type does not exist`);
            obj.removeInstance(this.top.id);
        } catch (error) {
            console.warn(error);
        } finally {
            this.top = null;
        }
    }
    public destory(): void {
        try {
            this.removeBuilding();

            const base_type = this.base.getType(this.tribe);
            let obj = this.game.engine.scenes.tile.getObject<InstancedObject>(base_type);
            if(!obj) throw new Error(`Failed to destory object | ${base_type}:${this.base.id} | Why: Object type does not exist`);

            obj.removeInstance(this.base.id);

            this.game.engine.scenes.tile.deleteTile(this.uuid);
        } catch (error) {
            console.warn(error);
        }
    }
    public setVisablity(show: boolean): void  {
        this.visible = show;

        if(this.unit) {
            this.game.world.unit_controller.setUnitVisibility(this.unit,show);
        }

        if((this.base as City)?.isCity) {
            let obj = this.game.engine.scenes.tile.getObject<CityTile>((this.base as City).key);
            if(obj) {   
                obj.visible = show;
            }
            return;
        }

        const base_type = this.getBaseModalName();
        let obj = this.game.engine.scenes.tile.getObject<InstancedObject>(base_type);
        if(obj) {
           obj.setVisibility(this.base.id,show);
        }
        if(this.top){
            const top_type = this.getTopModalName();
            if(!top_type) throw new Error("Failed to get top modal name.");
            let obj = this.game.engine.scenes.tile.getObject<InstancedObject>(top_type);
            if(obj) {
              obj.setVisibility(this.top.id,show);
            }
        }
    }
    public async render(): Promise<void> {
        try {
            if((this.base as City)?.isCity) {

                const base = this.base as City;
                
                let city = this.game.engine.scenes.tile.getObject<CityTile>(base.key);

                if(!city) {
                    const model_type = {
                        child: 0,
                        name: `LAND_${ this.owning_tribe === "xin-xi" ? "IMPERIUS" : this.owning_tribe?.toUpperCase() }`
                    }
                    const model = await this.game.assets.getAsset("LAND",model_type,"gltf");
                    city = this.game.engine.scenes.tile.createCityInstance(base.key, this.position, this.uuid ,model.geometry,model.material);
                    city.visible = true;
                    await base.render(this.game.assets,this.game.engine,this.owning_tribe as Tribe, this.uuid);
                }
                return;
            }

            // Generate base level asset
            const base_type = this.getBaseModalName();
            let obj = this.game.engine.scenes.tile.getObject<InstancedObject>(base_type);
            if(!obj) {
                const {asset,type,item} = this.base.manifest(this.tribe);
                const model = await this.game.assets.getAsset(asset,item,type);
                obj = this.game.engine.scenes.tile.createObjectInstance(base_type,model.geometry,model.material);
            }

            obj.createInstance({
                owner: this.uuid,
                rotation: this.base.metadata?.rotation ?? 0,
                shown: true,
                x: this.position.row,
                z: this.position.col,
                y: 0,
                id: this.base.id,
                type: "tile"
            });

            // Genearte top level assets
            if(this.top){
                const top_type = this.getTopModalName();
                if(!top_type) throw new Error("Failed to get top modal name.");
                let obj = this.game.engine.scenes.tile.getObject<InstancedObject>(top_type);
                if(!obj){
                    const {asset,item,type} = this.top.manifest(this.tribe);
                    const model = await this.game.assets.getAsset(asset,item,type);
                    obj = this.game.engine.scenes.tile.createObjectInstance(top_type,model.geometry,model.material);
                }

                obj.createInstance({
                    owner: this.uuid,
                    rotation: this.top.metadata?.rotation ?? 0,
                    shown: true,
                    x: this.position.row,
                    z: this.position.col,
                    y: 0,
                    id: this.top.id,
                    type: "tile"
                });
            }

            
        } catch (error: any) {
            console.warn(
                `Render | Failed to render object | ${this.uuid} | Why: ${error.message}`
            );
        }
    }
}