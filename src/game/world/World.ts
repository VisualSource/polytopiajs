import WorldGenerator from "./generator/WorldGenerator";
import TileController from './TileController';
import SelectorTile from "./rendered/SelectorTile";
import { Unit } from "./Unit";
import type { VariantGLTF } from "../loaders/KHR_Variants";
import type { Position, Tribe, UUID } from "../core/types";
import type Engine from "../core/Engine";
import type AssetLoader from "../loaders/AssetLoader";

export default class World {
    // this problily will need to be a map for when working with different dimensions and the like.
    public level: TileController[][];
    public units: Map<string,Unit> = new Map();
    public selector: SelectorTile;
    constructor(private engine: Engine, private assets: AssetLoader){
        // this is here for testing, in production this is not a great place to do this.
        this.createWorld(["imperius","bardur"],11).then(a=>{
           this.level = a;
       });
    }
    public async createUnit(tribe: Tribe, type: string, position: Position, tile_owner: UUID){
        const unit = new Unit(this.engine,this.assets,{
            type,
            tribe,
            position
        });
        this.units.set(unit.uuid,unit);
        await unit.render(tile_owner);
    }
    public async destoryUnit(id: UUID){
        const unit = this.units.get(id);
        if(!unit) return;
        unit.destory();
        this.units.delete(id);
    }
    public async createWorld(tribes: Tribe[], size: number): Promise<TileController[][]> {
       
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
        
        const level: TileController[][] = [];

        this.engine.scene.activeLevelReady();
        for (const row of leveldata){
            level.push([]);
            for(const tile of row){
                
                level[tile.col][tile.row] = new TileController({
                    engine: this.engine,
                    assets: this.assets,
                    world: this,
                    tile_data: tile,
                });
                await level[tile.col][tile.row].render();
            }
        }

        return level;
    }
    public async loadWorld(){}
    public async saveWorld(){}
} 

