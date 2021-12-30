import { nanoid } from "nanoid";
import EventEmitter from "../core/EventEmitter";
import { Tile, BuildTile, City } from "./Tile";
import { ObjectEvents, SystemEvents, UnitEvent } from "../events/systemEvents";
import type { TileJson, CityJson } from './Tile';
import type Engine from "../core/Engine";
import type AssetLoader from "../loaders/AssetLoader";
import type { WorldTile } from "./generator/WorldGenerator";
import type { SystemEventListener } from "../core/EventEmitter";
import type {Position, TileBase, Tribe, UUID} from '../core/types';
import type World from "./World";
import type InstancedObject from "./rendered/InstancedObject";
import type CityTile from "./rendered/CityTile";
import { RenderOrder } from "../core/renderOrder";

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
 * @export
 * @class TileController
 * @implements {SystemEventListener}
 */
export default class TileController implements SystemEventListener {
    /**
     * @constructor
     *
     * @static
     * @param {Engine} engine
     * @param {AssetLoader} assets
     * @param {World} world
     * @param {TileControllerJson} json
     * @return {TileController}  {TileController}
     * @memberof TileController
     */
    static createFromJson(engine: Engine, assets: AssetLoader, world: World, json: TileControllerJson): TileController {
        return new TileController(engine,assets,world).initFromJson(json);
    }
    /**
     * @constructor
     *
     * @static
     * @param {Engine} engine
     * @param {AssetLoader} assets
     * @param {World} world
     * @param {WorldTile} tile_data
     * @return {TileController}  {TileController}
     * @memberof TileController
     */
    static createNew(engine: Engine, assets: AssetLoader, world: World, tile_data: WorldTile): TileController {
        return new TileController(engine,assets,world).init(tile_data);
    }
    /**
     * keeps track of want the current selected thing is on this tile.
     * Unit => 0
     * Tile => 1
     * Deselection => 2
     *
     * @private
     * @type {Selected}
     * @memberof TileController
     */
    private selected: Selected = Selected.TILE; 
    /**
     * Whether the tile is selected or not
     *
     * @private
     * @type {boolean}
     * @memberof TileController
     */
    private isSelected: boolean = false;
    /**
     * Static id of the tile
     *
     * @type {UUID}
     * @memberof TileController
     */
    public readonly uuid: UUID = nanoid();
    /**
     * if the tile has a road placed on this tile
     *
     * @type {boolean}
     * @memberof TileController
     */
    public road: boolean = false;
    /**
     * the extra stuff on top of a tile 
     * Example metal in a mountian or fruit
     *
     * @type {(BuildTile | null)}
     * @memberof TileController
     */
    public top: BuildTile | null = null;
    /**
     * The base props of this tile
     *
     * @type {Tile}
     * @memberof TileController
     */
    public base: Tile | City;
    /**
     * A UUID ref to a unit
     *
     * @type {(UUID | null)}
     * @memberof TileController
     */
    public unit: UUID | null = null;
    public events: EventEmitter = new EventEmitter();
    public position: Position;
    /**
     * The tribe that this tile should be rendered as 
     *
     * @private
     * @type {Tribe}
     * @memberof TileController
     */
    private tribe: Tribe;
    /**
     * The tribe that this tile is owned by
     *
     * @type {(Tribe | null)}
     * @memberof TileController
     */
    public owning_tribe: Tribe | null = null;
    /**
     * A event that overrides the default selection events in the `selectionHandle` function.
     *
     * @type {({
     *         type: string;
     *         id: number;
     *         data: {
     *             [prop: string]: any;
     *         }
     *     } | null)}
     * @memberof TileController
     */
    public override: {
        type: string;
        id: number;
        data: {
            [prop: string]: any;
        }
    } | null = null;
    constructor(private engine: Engine, private assets: AssetLoader, private world: World){
        this.events.on(SystemEvents.INTERACTION,(event)=>{
            switch (event.id) {
                case ObjectEvents.TILE_SELECT:
                    this.selectionHandle(event);
                    break;
                case ObjectEvents.RESET:
                    this.resetHandle(event);
                    break;
                case ObjectEvents.DESELECTION:
                    this.deselectionHandle();
                default:
                    break;
            }
        });
       // this.events.onId<SystemEvents,ObjectEvents>({ name: SystemEvents.INTERACTION, id: ObjectEvents.TILE_SELECT },this.selectionHandle);
       // this.events.onId<SystemEvents,ObjectEvents>({ name: SystemEvents.INTERACTION, id: ObjectEvents.RESET }, this.resetHandle);
       // this.events.onId<SystemEvents,ObjectEvents>({ name: SystemEvents.INTERACTION, id: ObjectEvents.DESELECTION }, this.deselectionHandle);
    }
    public get getPreivew(): string[] {
        if(this.unit) {
            const id = this.world.units.get(this.unit)?.model_id;
            if(id) return [id];
            return []
        }
        const data = [this.base.getType(this.tribe)];
        if(this.top) data.push(this.top.getType(this.tribe));
        return data;
    }
    public get uiName(): string | undefined {
        if(this.unit) {
            return this.world.units.get(this.unit)?.type
        }
        if(this.top) {
            return this.top.type;
        }
        return `${this.base.type}`;

    }    
    public terrainBouns(): number {
        switch (this.base.type) {
            case "LAND":
                return 1;
            case "FOREST":
                if(this.owning_tribe && this.world.players.playerHasTech(this.owning_tribe,"archery")) return 1.5;
                return 1;
            case "WATER":
            case "OCEAN":
                if(this.owning_tribe && this.world.players.playerHasTech(this.owning_tribe,"aquatism")) return 1.5;
                return 1;
            case "MOUNTAIN":
                if(this.owning_tribe && this.world.players.playerHasTech(this.owning_tribe,"meditation")) return 1.5;
                return 1;
            case "CITY":
                const unit = this.world.units.get(this.unit as string);
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
            this.base = City.cityDefaultConstructor(tile_data.metadata as any);
        } else {
            this.base = Tile.defaultConstructor(tile_data.base as TileBase, tile_data.metadata);
            if(tile_data.buldings.length > 0) this.top = BuildTile.createNew(tile_data.buldings);
        }
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
    public selectionEvent(type: "unit" | "tile"){
        this.events.emit<SystemEvents,ObjectEvents>({ type: SystemEvents.INTERACTION, id: ObjectEvents.SELECTION, data: {
            world: this.position,
            type
        }});
    }
    public addBuilding(){}
    public removeBuilding(){
        if(!this.top) return;
        try {
            const top_type = this.top.getType(this.tribe);
            let obj = this.engine.scene.getObject<InstancedObject>(top_type);
            if(!obj) throw new Error(`Failed to destory object | ${top_type}:${this.top.id} | Why: Object type does not exist`);
            obj.removeInstanceById(this.top.id);
        } catch (error) {
            console.warn(error);
        }
    }
    /**
     * destorys the renderable component of this tile it does not destory any of the data in this class
     *
     * @memberof TileController
     */
    public destory(){
        try {
            const base_type = this.base.getType(this.tribe);
            let obj = this.engine.scene.getObject<InstancedObject>(base_type);
            if(!obj) throw new Error(`Failed to destory object | ${base_type}:${this.base.id} | Why: Object type does not exist`);

            obj.removeInstanceById(this.base.id);

            this.removeBuilding();

        } catch (error) {
            console.warn(error);
        }
    }
    /**
     * Generate tiles and add them to threejs scene
     *
     * @memberof TileController
     */
    public async render(){
        try {
            if((this.base as City)?.isCity) {

                const base = this.base as City;
                
                let city = this.engine.scene.getObject<CityTile>(base.key);

                if(!city) {
                    const model_type = {
                        child: 0,
                        name: `LAND_${ this.owning_tribe === "xin-xi" ? "IMPERIUS" : this.owning_tribe?.toUpperCase() }`
                    }
                    const model = await this.assets.getAsset("LAND",model_type,"gltf");
                    city = this.engine.scene.createCityInstance(base.key, this.position, this.uuid ,model.geometry,model.material);
                    await base.render(this.assets, this.engine, this.owning_tribe as Tribe, this.uuid);
                }

                return;
            }

            // Generate base level asset
            const base_type = this.base.getType(this.tribe);
            let obj = this.engine.scene.getObject<InstancedObject>(base_type);
            if(!obj) {
                const {asset,type,item} = this.base.manifest(this.tribe);
                const model = await this.assets.getAsset(asset,item,type);
                obj = this.engine.scene.createObjectInstance(base_type,model.geometry,model.material);
                obj.renderOrder = RenderOrder.BASE;
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

            // Genearte top level assets
            if(this.top){
                const top_type = this.top.getType(this.tribe);
                let obj = this.engine.scene.getObject<InstancedObject>(top_type);
                if(!obj){
                    const {asset,item,type} = this.top.manifest(this.tribe);
                    const model = await this.assets.getAsset(asset,item,type);
                    obj = this.engine.scene.createObjectInstance(top_type,model.geometry,model.material);
                    obj.renderOrder = RenderOrder.TOP;
                    
                }

                obj.createInstance({
                    index: 0,
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