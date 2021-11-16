import type Engine from "../core/Engine";
import type { default as AssetLoader, Manifest }  from "../loaders/AssetLoader";
import WorldGenerator from "./generator/WorldGenerator";
import TileController from './TileController';
import InstancedObject from './rendered/InstancedObject';

interface LevelObjects {
    postion: {
        col: number;
        row: number;
        z: number;
    }
    asset: Manifest;
    metadata: {
        [name: string]: any
    }
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
    constructor(private engine: Engine, private assets: AssetLoader){
       this.createWorld(["imperius","bardur"],11);
    }
    public async createWorld(tribes: string[], size: number){
        console.log(this.assets);
        const leveldata = WorldGenerator.gen(tribes,size);
        
        const level_objects: Map<string,LevelObjects[]> = new Map();
        const level: TileController[][] = [];

        const add_object = (key: string, data: LevelObjects) => {
            if(!level_objects.has(key)){
                level_objects.set(key,[]);
            }

            level_objects.get(key)?.push(data);
        }
        const add_building = (name: string, tribe: string, {col,row}: { col: number, row: number}) => {
            if(name === "GAME" || name === "FRUIT"){
                let key = `${name}_${tribe.toUpperCase()}`;
                add_object(key,{
                    postion: {
                        row,
                        col,
                        z: 1
                    },
                    asset: {
                        asset: key,
                        item: 0,
                        type: "gltf"
                    },
                    metadata: {}
                });
                return;
            }
            add_object(name,{
                postion: {
                    row,
                    col,
                    z: 1
                },
                asset: {
                    asset: name,
                    item: 0,
                    type: "gltf"
                },
                metadata: {}
            });
        }
        for (const row of leveldata){
            level.push([]);
            for(const tile of row){
                
                level[tile.col][tile.row] = new TileController();


                // Generate asset bindings
                switch(tile.base) {
                    case "LAND":{
                        add_object(`LAND_${tile.tribe.toUpperCase()}`,{
                            postion: {
                                col: tile.col,
                                row: tile.row,
                                z: 0
                            },
                            asset: {
                                asset: "LAND",
                                item: 0,
                                type: "gltf"
                            },
                            metadata: tile.metadata
                        });
                        break;
                    }
                    case "WATER": {
                        let key = `WATER_${(TO_TEXT as any)[tile.metadata?.model_id ?? 0]}`;
                        add_object(key,{
                            postion: {
                                col: tile.col,
                                row: tile.row,
                                z: 0
                            },
                            asset: {
                                asset: key,
                                item: 0,
                                type: "obj"
                            },
                            metadata: tile.metadata
                        });
                        break;
                    }
                    case "OCEAN": {
                        let key = `OCEAN_${(TO_TEXT as any)[tile.metadata?.model_id ?? 0]}`;
                        add_object(key,{
                            postion: {
                                col: tile.col,
                                row: tile.row,
                                z: 0
                            },
                            asset: {
                                asset: key,
                                item: 0,
                                type: "obj"
                            },
                            metadata: tile.metadata
                        });
                        break;
                    }
                    case "FOREST":
                        add_object(`FOREST_${tile.tribe.toUpperCase()}`,{
                            postion: {
                                col: tile.col,
                                row: tile.row,
                                z: 0
                            },
                            asset: {
                                asset: "FOREST",
                                item: 0,
                                type: "gltf"
                            },
                            metadata: tile.metadata
                        });
                        break;
                    case "MOUNTAIN": {
                        add_object(`MOUNTAIN_${tile.tribe.toUpperCase()}`,{
                            postion: {
                                col: tile.col,
                                row: tile.row,
                                z: 0
                            },
                            asset: {
                                asset: "MOUNTAIN",
                                item: 0,
                                type: "gltf"
                            },
                            metadata: tile.metadata
                        });
                        break;
                    }
                    case "CAPITAL": {
                        let key = `CAPITAL_${tile.tribe.toUpperCase()}`;
                        add_object(key ,{
                            postion: {
                                col: tile.col,
                                row: tile.row,
                                z: 0
                            },
                            asset: {
                                asset: key,
                                item: 0,
                                type: "gltf"
                            },
                            metadata: tile.metadata
                        });
                        break;
                    }
                }
                for(const building of tile.buldings){
                    add_building(building,tile.tribe,{col: tile.col, row: tile.row});
                }
            }
        }


        const scene = this.engine.scene.getLevelOrCreate("overworld");

        for(const [name,value] of level_objects) {

            try {
                const data = value[0];

                const asset = await this.assets.getAsset(data.asset.asset,data.asset.item,data.asset.type);

                const object = new InstancedObject(name, asset.geometry, asset.material, value.map(object=>{
                    return {
                        x: object.postion.row,
                        y: object.postion.z,
                        z: object.postion.col,
                        index: 0,
                        rotation: (object.metadata?.rotation ?? 0) as number,
                        shown: true,
                        owner: {
                            group: "tile",
                            index: 0,
                            type: "base"
                        }
                    }
                }));

                scene.getObjectByName("tiles")?.add(object);
            } catch (error: any) {
                console.warn(`${error.message} | Ignoring issuing`);
            }

        }





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