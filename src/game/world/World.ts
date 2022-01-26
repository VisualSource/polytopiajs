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
import type { City } from "./Tile";
import type Game from "../core/Game";


export interface WorldJson {
    size: number;
    leveldata: {
        [levelname: string]: TileControllerJson[];
    }
    units: UnitJson[];
}

export default class World {
    public lookup: Map<UUID,{ row: number, col: number }> = new Map();
    // this problily will need to be a map for when working with different dimensions and the like.
    public level: NArray<TileController>;
    public units: Map<string,Unit> = new Map();
    public selector: SelectorTile;
    public unit_controller: UnitController;
    constructor(private game: Game){
       /* fetch("/world.json").then(value=>value.json()).then(world=>{
            this.loadWorld(world).then(()=>{
                this.unit_controller.createUnit("bardur","WARRIOR",{row: 5, col: 2});
            });
        });*/

        // this is here for testing, in production this is not a great place to do this.
       /* this.createWorld(["imperius","bardur"],11).then(a=>{
            this.createUnit("imperius","warrior",{row: 4, col: 2}).then(unit=>{
                this.saveWorld().then(value=>{
                    console.log(JSON.stringify(value));
                });
            });
       });*/
    }
    public async createWorld(tribes: Tribe[], size: number): Promise<{ level: NArray<TileController>, capitals: { tribe: Tribe, uuid: UUID }[] }> {
       
        // Add ui and selector objects
        try {
            const model = this.game.assets.getVarient("SELECTOR") as VariantGLTF;
            this.selector = new SelectorTile(model);
            this.selector.render(this.game.engine);
            this.unit_controller = new UnitController(this.game);
            await this.unit_controller.init();
        } catch (error) {
            console.error(error);
        }

        const leveldata = WorldGenerator.gen(tribes,size);
        const capitals: { tribe: Tribe, uuid: UUID }[] = [];
        const level: NArray<TileController> = new NArray(size);

        this.game.engine.scene.activeLevelReady();

        for(const tile of leveldata){
            const controller = TileController.createNew(this.game,tile);

            if(tile.base === "CITY"){
                capitals.push({ tribe: tile.tribe, uuid: controller.uuid });
            }
            level.set(tile.row,tile.col,controller);
            this.lookup.set(controller.uuid,{ row: tile.row, col: tile.col })

            await controller.render();
        }   
        this.level = level;

        for(const city of capitals){
            const pos = this.lookup.get(city.uuid);
            if(!pos) continue;
            const tile = this.level.get(pos.row,pos.col);
            if(!tile) continue;
            (tile.base as City).claimLand(this,city.uuid,city.tribe);
        }


        return {
            level,
            capitals
        };
    }
    public async loadWorld(worlddata: WorldJson){

        try {
            const model = this.game.assets.getVarient("SELECTOR") as VariantGLTF;
            this.selector = new SelectorTile(model);
            this.selector.render(this.game.engine);
            this.unit_controller = new UnitController(this.game);
            await this.unit_controller.init();
        } catch (error) {
            console.error(error);
        }

        const level: NArray<TileController> = new NArray(worlddata.size);

        this.game.engine.scene.activeLevelReady();

        for(const tile of worlddata.leveldata["overworld"]) {
            const controller = TileController.createFromJson(this.game,tile);
            level.set(tile.position.row,tile.position.col,controller);
            this.lookup.set(controller.uuid,tile.position);
            await controller.render();
        }

        for(const unit of worlddata.units) {
            const json_unit = Unit.createFromJson(this.game.engine,this.game.assets,this.game.players,unit);

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

