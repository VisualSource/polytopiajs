import WorldGenerator from "./generator/WorldGenerator";
import TileController from './TileController';
import UnitController from "./UnitController";
import SelectorTile from "./rendered/SelectorTile";
import { Unit } from "./Unit";
import NArray from "../../utils/NArray";

import type { UnitJson } from "./Unit";
import type { TileControllerJson } from './TileController';
import type { VariantGLTF } from "../loaders/KHR_Variants";
import type { Tribe, UUID } from "../core/types";
import type Engine from "../core/Engine";
import type AssetLoader from "../loaders/AssetLoader";
import type PlayerController from "../managers/PlayerController";


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
    constructor(private engine: Engine, private assets: AssetLoader, public players: PlayerController){

        fetch("/world.json").then(value=>value.json()).then(world=>{
            this.loadWorld(world).then(()=>{
                this.unit_controller.createUnit("bardur","WARRIOR",{row: 5, col: 2});
            });
        });

        // this is here for testing, in production this is not a great place to do this.
       /* this.createWorld(["imperius","bardur"],11).then(a=>{
            this.createUnit("imperius","warrior",{row: 4, col: 2}).then(unit=>{
                this.saveWorld().then(value=>{
                    console.log(JSON.stringify(value));
                });
            });
       });*/
    }
    public async createWorld(tribes: Tribe[], size: number): Promise<NArray<TileController>> {
       
        // Add ui and selector objects
        try {
            const model = this.assets.getVarient("SELECTOR") as VariantGLTF;
            this.selector = new SelectorTile(model);
            this.selector.render(this.engine);
            this.unit_controller = new UnitController(this.engine,this.assets,this,this.players);
            await this.unit_controller.init();
        } catch (error) {
            console.error(error);
        }

        const leveldata = WorldGenerator.gen(tribes,size);
        
        const level: NArray<TileController> = new NArray(size);

        this.engine.scene.activeLevelReady();

        for(const tile of leveldata){
            level.set(tile.row,tile.col,TileController.createNew(this.engine,this.assets,this,tile));
            await level.get(tile.row,tile.col).render();
        }   

        this.level = level;

        return level;
    }
    public async loadWorld(worlddata: WorldJson){

        try {
            const model = this.assets.getVarient("SELECTOR") as VariantGLTF;
            this.selector = new SelectorTile(model);
            this.selector.render(this.engine);
            this.unit_controller = new UnitController(this.engine,this.assets,this,this.players);
            await this.unit_controller.init();
        } catch (error) {
            console.error(error);
        }

        const level: NArray<TileController> = new NArray(worlddata.size);

        this.engine.scene.activeLevelReady();

        for(const tile of worlddata.leveldata["overworld"]) {
            level.set(tile.position.row,tile.position.col,TileController.createFromJson(this.engine,this.assets,this,tile));
            await level.get(tile.position.row,tile.position.col).render();
        }

        for(const unit of worlddata.units) {
            const json_unit = Unit.createFromJson(this.engine,this.assets,this.players,unit);

            this.units.set(json_unit.uuid,json_unit);
            const tile = level.get(unit.position.row,unit.position.col).setUnit(json_unit.uuid);
            await json_unit.render(tile.uuid);
        }

        this.level = level;
        return level;
    }
    public levelToJson(){
        let world: TileControllerJson[] = [];
        for(const level of this.level){
            world.push(level.toJSON());
        }
        return world;
    }
    public unitsToJson(){
        let units: UnitJson[] = [];
        this.units.forEach((value)=>{
            units.push(value.toJSON());
        });
        return units;

    }
    public async saveWorld(): Promise<WorldJson> {
        return {
            size: this.level.size,
            leveldata: {
                "overworld": this.levelToJson(),
            },
            units: this.unitsToJson()
        }
    }
        
} 

