import WorldGenerator from "./generator/WorldGenerator";
import TileController, { TileControllerJson } from './TileController';
import UnitController from "./UnitController";
import SelectorTile from "./rendered/SelectorTile";
import { Unit, UnitJson } from "./Unit";
import NArray from "../../utils/NArray";
import type { VariantGLTF } from "../loaders/KHR_Variants";
import type { Position, Tribe, UUID } from "../core/types";
import type Engine from "../core/Engine";
import type AssetLoader from "../loaders/AssetLoader";


export interface WorldJson {
    size: number;
    leveldata: {
        [levelname: string]: TileControllerJson[];
    }
    units: UnitJson[];
}

export default class World {
    // this problily will need to be a map for when working with different dimensions and the like.
    public level: NArray<TileController>;
    public units: Map<string,Unit> = new Map();
    public selector: SelectorTile;
    public unit_controller: UnitController;
    constructor(private engine: Engine, private assets: AssetLoader){
        // this is here for testing, in production this is not a great place to do this.
        this.createWorld(["imperius","bardur"],11).then(a=>{
            this.createUnit("imperius","warrior",{row: 4, col: 2}).then(unit=>{
                this.saveWorld().then(value=>{
                    console.log(value);
                });
            });
       });
    }
    public async createUnit(tribe: Tribe, type: string, position: Position){
        const unit = new Unit(this.engine,this.assets,{
            type,
            tribe,
            position
        });
        this.units.set(unit.uuid,unit);
        this.level.get(position.row,position.col).setUnit(unit.uuid);
        await unit.render(this.level.get(position.row,position.col).uuid);
        return unit;
    }
    public async destoryUnit(id: UUID){
        const unit = this.units.get(id);
        if(!unit) return;
        unit.destory();
        this.units.delete(id);
    }
    public async createWorld(tribes: Tribe[], size: number): Promise<NArray<TileController>> {
       
        // Add ui and selector objects
        try {
            const model = this.assets.getVarient("SELECTOR") as VariantGLTF;
            this.selector = new SelectorTile(model);
            this.selector.render(this.engine);
            this.unit_controller = new UnitController(this.engine,this.assets,this);
            await this.unit_controller.init();
        } catch (error) {
            console.error(error);
        }

        const leveldata = WorldGenerator.gen(tribes,size);
        
        const level: NArray<TileController> = new NArray(size);

        this.engine.scene.activeLevelReady();

        for(const tile of leveldata){
            level.set(tile.row,tile.col,new TileController({
                engine: this.engine,
                assets: this.assets,
                world: this,
                tile_data: tile,
            }));
        
            await level.get(tile.row,tile.col).render();
        }
     /*   for (const row of leveldata){
            for(const tile of row){

                level.set(tile.row,tile.col,new TileController({
                    engine: this.engine,
                    assets: this.assets,
                    world: this,
                    tile_data: tile,
                }));
            
                await level.get(tile.row,tile.col).render();
            }
        }*/   

        this.level = level;

        return level;
    }
    public async loadWorld(worlddata: WorldJson){

        try {
            const model = this.assets.getVarient("SELECTOR") as VariantGLTF;
            this.selector = new SelectorTile(model);
            this.selector.render(this.engine);
            this.unit_controller = new UnitController(this.engine,this.assets,this);
            await this.unit_controller.init();
        } catch (error) {
            console.error(error);
        }

        const level: NArray<TileController> = new NArray(worlddata.size);

        this.engine.scene.activeLevelReady();

        for(const tile of worlddata.leveldata["overworld"]) {

        }

        for(const unit of worlddata.units) {

        }

        this.level = level;
        return level;
    }
    public async saveWorld(): Promise<WorldJson> {
        let world: TileControllerJson[] = [];
        let units: UnitJson[] = [];

        for(const level of this.level){
            world.push(level.toJSON());
        }

        this.units.forEach((value)=>{
            units.push(value.toJSON());
        });


        return {
            size: this.level.size,
            leveldata: {
                "overworld": world,
            },
            units
        }
    }
        
} 

