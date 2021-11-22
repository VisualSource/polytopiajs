import type Engine from "../core/Engine";
import type AssetLoader from "../loaders/AssetLoader";
import WorldGenerator from "./generator/WorldGenerator";
import TileController from './TileController';
import SelectorTile from "./rendered/SelectorTile";
import type { VariantGLTF } from "../loaders/KHR_Variants";
export default class World {
    level: TileController[][];
    selector: SelectorTile;
    constructor(private engine: Engine, private assets: AssetLoader){
        this.createWorld(["imperius","bardur"],11).then(a=>{
           this.level = a;
       });
    }
    public async createWorld(tribes: string[], size: number): Promise<TileController[][]> {
       

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
                    tile_data: tile
                });
                await level[tile.col][tile.row].render();
            }
        }

        return level;
    }
    public loadWorld(){}
    public saveWorld(){}
} 

