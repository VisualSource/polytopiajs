import type Engine from "../core/Engine";
import type { default as AssetLoader, Manifest }  from "../loaders/AssetLoader";
import WorldGenerator from "./generator/WorldGenerator";
import TileController from './TileController';
import InstancedObject from './rendered/InstancedObject';

interface LevelObjects {
    instances: {
        postion: {
            col: number;
            row: number;
            z: number;
        }
        metadata: {
            [name: string]: any
        }
    }[]
    manifest: Manifest;
}

const TO_TEXT = {
    0: "ZERO",
    1: "ONE",
    2: "TWO",
    3: "THREE",
    4: "FOUR",
    5: "FIVE"
}

export default class World {
    level: TileController[][];
    constructor(private engine: Engine, private assets: AssetLoader){
        this.createWorld(["imperius","bardur"],11).then(a=>{
           this.level = a;
       });
    }
    public async createWorld(tribes: string[], size: number){
        console.log(this.assets);
        const leveldata = WorldGenerator.gen(tribes,size);
        
        const level_objects: Map<string,LevelObjects> = new Map();
        const level: TileController[][] = [];

        const add_object = (key: string, manifest: Manifest,  data: LevelObjects["instances"][0]) => {
            if(!level_objects.has(key)){
                level_objects.set(key,{ manifest, instances: [] });
            }

            level_objects.get(key)?.instances.push(data);
        }
        const add_building = (name: string, tribe: string, owner: String, {col,row}: { col: number, row: number}) => {
            if(name === "GAME" || name === "FRUIT"){
                let key = `${name}_${tribe.toUpperCase()}`;
                add_object(key,{
                    asset: key,
                    item: 0,
                    type: "gltf"
                },{
                    postion: {
                        row,
                        col,
                        z: 1
                    },
                    metadata: {
                        owner
                    }
                });
                return;
            }
            add_object(name,{
                asset: name,
                item: 0,
                type: "gltf"
            },{
                postion: {
                    row,
                    col,
                    z: 1
                },
                metadata: {
                    owner
                }
            });
        }
        for (const row of leveldata){
            level.push([]);
            for(const tile of row){
                
                level[tile.col][tile.row] = new TileController();
                let uuid = level[tile.col][tile.row].uuid;

                // Generate asset bindings
                if(tile.base === "WATER" || tile.base === "OCEAN") {
                    let key = `${tile.base}_${(TO_TEXT as any)[tile.metadata?.model_id ?? 0]}`;
                    add_object(key, {
                        asset: key,
                        item: 0,
                        type: "obj"
                    },{
                        postion: {
                            col: tile.col,
                            row: tile.row,
                            z: 0
                        },
                        metadata: {
                            owner: uuid,
                            ...tile.metadata
                        }
                    });
                } else {
                    let key = `${tile.base}_${tile.tribe.toUpperCase()}`;
                    add_object(key,{
                        asset: tile.base === "CAPITAL" ?  key : tile.base,
                        item: 0,
                        type: "gltf"
                    },{
                        postion: {
                            col: tile.col,
                            row: tile.row,
                            z: 0
                        },
                        metadata: {
                            owner: uuid,
                            ...tile.metadata
                        }
                    });
                }

                for(const building of tile.buldings) add_building(building,tile.tribe,uuid,{col: tile.col, row: tile.row});
            }
        }

        const scene = this.engine.scene.getLevelOrCreate("overworld");

        for(const [name,{instances, manifest}] of level_objects) {

            try {
                const asset = await this.assets.getAsset(manifest.asset,manifest.item,manifest.type);

                const object = new InstancedObject(name, asset.geometry, asset.material, instances.map(object=>{
                    return {
                        x: object.postion.row,
                        y: object.postion.z,
                        z: object.postion.col,
                        index: 0,
                        rotation: (object.metadata?.rotation ?? 0) as number,
                        shown: true,
                        owner: object.metadata.owner
                    }
                }));

                scene.add(object);
            } catch (error: any) {
                console.warn(`${error.message} | Ignoring issuing`);
            }

        }


        return level;


    }
    public loadWorld(){}
    public saveWorld(){}
} 


/*

World ====[
          = <== Generator/ loader
          =
     World Array
        => Engine Scene 


*/