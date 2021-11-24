import WorldGenerator from "./generator/WorldGenerator";
import TileController from './TileController';
import SelectorTile from "./rendered/SelectorTile";
import { Unit } from "./Unit";
import NArray from "../../utils/NArray";
import type { VariantGLTF } from "../loaders/KHR_Variants";
import type { Position, Tribe, UUID } from "../core/types";
import type Engine from "../core/Engine";
import type AssetLoader from "../loaders/AssetLoader";

export default class World {
    // this problily will need to be a map for when working with different dimensions and the like.
    public level: NArray<TileController>;
    public units: Map<string,Unit> = new Map();
    public selector: SelectorTile;
    constructor(private engine: Engine, private assets: AssetLoader){
        // this is here for testing, in production this is not a great place to do this.
        this.createWorld(["imperius","bardur"],11).then(a=>{
            this.createUnit("imperius","warrior",{row: 4, col: 2});
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
    }
    public async destoryUnit(id: UUID){
        const unit = this.units.get(id);
        if(!unit) return;
        unit.destory();
        this.units.delete(id);
    }
    public async createWorld(tribes: Tribe[], size: number): Promise<NArray<TileController>> {
       
        // Add selector to scene
        try {
            const model = this.assets.getVarient("SELECTOR") as VariantGLTF;
            this.selector = new SelectorTile(model);
            // Don't add the selector to the level group.
            // this stops the ray from hitting it so,
            // we don't need to worry about having to deal with it.
            this.engine.scene.add(this.selector.mesh);
            
        } catch (error) {
            console.error(error);
        }

        const leveldata = WorldGenerator.gen(tribes,size);
        
        const level: NArray<TileController> = new NArray(size)

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
    public async loadWorld(){}
    public async saveWorld(){}
} 

