import { nanoid } from "nanoid";
import type { Manifest } from "../loaders/AssetLoader";
import type {TileBase, Tribe, UUID} from '../core/types';
import type AssetLoader from "../loaders/AssetLoader";
import type Engine from "../core/Engine";
import type CityTile from "./rendered/CityTile";
import random from "random";
interface ITile {
    getType: (tribe: Tribe) => string;
    manifest: (tribe: Tribe) => Manifest;
}

const TO_TEXT = {
    0: "ZERO",
    1: "ONE",
    2: "TWO",
    3: "THREE",
    4: "FOUR",
    5: "FIVE"
}
export interface TileJson {
    type: string;
    metadata: {
        [key: string]: any;
    }
}
export interface CityJson {
    type: "CITY";
    capital: boolean;
    current_units: number;
    city_wall: boolean;
    city_level: number;
    metadata: {
        [key: string]: any;
    };
}

/**
 *
 *
 * @export
 * @class Tile
 * @implements {ITile}
 */
export class Tile implements ITile {
    static jsonConstructor(json: TileJson): Tile {
        return new Tile().jsonConstructor(json);
    }
    static defaultConstructor(type: TileBase, metadata: { [name: string]: any }): Tile {
        return new Tile().defaultConstructor(type,metadata);
    }
    public readonly id: UUID = nanoid(4);
    public type: TileBase;
    public metadata: { [name: string]: any } = {}
    public defaultConstructor(type: TileBase, metadata: { [name: string]: any }): this {
        this.type = type;
        this.metadata = metadata;
        return this;
    }
    public jsonConstructor(json: TileJson): this {
        this.type = json.type as TileBase;
        this.metadata = json.metadata;
        return this;
    }
    public get show(): boolean {
        return true;
    }
    public getType(tribe: Tribe){
        if(this.type === "OCEAN" || this.type === "WATER") {
            return `${this.type}_${(TO_TEXT as any)[this.metadata?.model_id ?? 0]}`;
        } 
        return `${this.type}_${tribe.toUpperCase()}`;
    }
    public manifest(tribe: Tribe): Manifest {
        let key = `${this.type}_${tribe.toUpperCase()}`;
        switch (this.type) {
            case "WATER":
            case "OCEAN":{
                let key = `${this.type}_${(TO_TEXT as any)[this.metadata?.model_id ?? 0]}`;
                return {
                    asset: key,
                    item: 0,
                    type: "obj"
                }
            }
            case "LAND": {
                return {
                    asset: this.type,
                    type: "gltf",
                    item: {
                        child: 0,
                        name: tribe === "xin-xi" ? "LAND_IMPERIUS" : key
                    }
                }

            }
            case "MOUNTAIN": {
                if(tribe === "bardur") return {
                    asset: key,
                    item: 0,
                    type: "gltf"
                }
                return {
                    asset: this.type,
                    item: 0,
                    type: "gltf"
                }
            }
            case "FOREST": {
                if(tribe === "bardur")  return {
                    asset: key,
                    item: 0,
                    type: "gltf"
                }
                return {
                    asset: this.type,
                    item: 0,
                    type: "gltf"
                }
            }
        
            default:{
                return {
                    asset: this.type,
                    item: 0,
                    type: "gltf"
                }
            }
        }
    }
    public toJSON(): TileJson {
        return {
            type: this.type,
            metadata: this.metadata
        }
    }
    
}

/*
 * The level of a city could be build using groups with min of 2 and max of 3 on the sides and 1 center (capital icon on this piller)
   the data reperention the level is a array with a number between 0 and 7 and when generated using a random number generator.
   null in this array will repersent a non rendered place
   Array Example SINGLE BLOCK LEVEL

   City size 3x3
   [
    [ null, null, 1 ], <-- two of the inside block are not rendered with only the out side being render
    [ null, null, 3 ], <-- Same as above
    [ 4   ,   4 , 8 ]  <-- This is the front side of the city, so all 3 are rendered
   ]

   City size 4x4
  THREE JS GROUP -> [
                        [ null, null, null, 4  <- id/index of the model to be rendered here ],
                        [ null, null, null, 4],
                        [ null, null, null, 6],
                        [   6 ,   5 ,   6 , 2]
                    ]

   FULL CTIY 
   STARTING CITY DATA
   [
       [                           <-- THREE JS GROUP, LEVEL 0 GENERANTED FRIST
           [ null, null, 1  ],
           [ null, null, 7  ],
           [   4 ,   5,   8 ]
       ],
       [
           [null,null,null],
           [null,null,null],
           [null,null,  9 ]
       ]
   ]

 */


class CityLevelData {
    private _data: ({ type: number | null, id: UUID })[][][] = [
        [
            [ {type: null, id: nanoid(8) }, { type: null, id: nanoid(8) }, { type: 1, id: nanoid(8) } ],
            [ {type: null, id: nanoid(8) }, { type: null, id: nanoid(8) }, { type: 1, id: nanoid(8) } ],
            [ {type: 1,    id: nanoid(8) }, { type: 1,    id:nanoid(8) }, { type: 1, id: nanoid(8) } ],
        ],
        [
            [ {type: 1, id: nanoid(8) }, { type: 1, id: nanoid(8) }, { type: 1, id: nanoid(8) } ],
            [ {type: 1, id: nanoid(8) }, { type: 1, id: nanoid(8) }, { type: 1, id: nanoid(8) } ],
            [ {type: 1,    id: nanoid(8) }, { type: 1,    id:nanoid(8) }, { type: 0, id: nanoid(8) } ],
        ]
    ];

    public generateLevel(): void {

    }
    public toJSON() {

    }

    public *[Symbol.iterator](){
        let level = 0;
        let row = 0;
        let item = 0;
        while(level < this._data.length) {
            while(row < this._data[level].length) {
                while(item < this._data[level][row].length){
                    yield {
                        level, // level should be the y of the object
                        x: -row,
                        z: -item,
                        type: this._data[level][row][item].type,
                        id: this._data[level][row][item].id
                    };
                    item++;
                }
                item = 0;
                row++;
            }
            item = 0;
            row = 0;
            level++;
        }   
    }
}

export class City extends Tile {
    static cityJsonConstructor(json: CityJson): City {
        return new City().cityJsonConstructor(json);
    }
    static cityDefaultConstructor(data: { capital: boolean }): City {
        return new City().cityDefaultConstructor(data);
    }
    public readonly isCity: boolean = true;
    public type: TileBase = "CITY";
    public capital: boolean = false;
    public current_units: number = 0;
    public city_wall: boolean = false;
    public city_level: number = 1;
    public level_data: CityLevelData = new CityLevelData();
    public get key(): string {
        return `${this.type}_${this.id}`;
    }
    public cityJsonConstructor(json: CityJson): this {
        this.capital = json.capital;
        this.current_units = json.current_units;
        this.city_wall = json.city_wall;
        this.city_level = json.city_level;
        this.metadata = json.metadata;
        return this;
    }
    public cityDefaultConstructor(data: { capital: boolean }): this {
        this.capital = data.capital;
        return this;
    }
    public toJSON(): CityJson {
        return {
            capital: this.capital,
            city_level: this.city_level,
            city_wall: this.city_wall,
            current_units: this.current_units,
            type: "CITY",
            metadata: this.metadata
        };
    }
    public addCityWall(){}
    public addUnit(){}
    public removeUnit(){}
    public levelCity(){}
    public async render(assets: AssetLoader, engine: Engine, tribe: Tribe, owner: UUID): Promise<void> {
        const tile = engine.scene.getObject<CityTile>(this.key);

        if(!tile) {
            console.warn("Render | Failed to render city |", this.id, "| Why: Root object does not exist.");
            return;
        };

       // debugger;

        for(const data of this.level_data) {
         
            if(data.type === null) continue;
            let item = tile.getObjectInstance(`CITY_PART_${data.type}`);
            if(!item) {
                const model = await assets.getAsset("CITY",data.type,"gltf");
                item = tile.createObjectInstance(`CITY_PART_${data.type}`,model.geometry,model.material);
            }

            console.log(data);

            item.createInstance({
                id: data.id,
                index: 0,
                owner: owner,
                rotation: 0,
                shown: true,
                type: "tile",
                x: data.x,
                y: data.level,
                z: data.z
            });
        }

    }
}
/**
 *
 *
 * @export
 * @class BuildTile
 * @implements {ITile}
 */
export class BuildTile implements ITile {
    static createFromJson(json: TileJson | null): BuildTile | null {
        if(!json) return null;
        return new BuildTile().initFromJson(json);
    }
    static createNew(types: string[]): BuildTile {
        return new BuildTile().init(types);
    }
    public id: UUID = nanoid(4);
    public type: string;
    public metadata: { [name: string]: any } = {
        replaced_with: null
    };
    /**
     * @constructor
     *
     * @param {string[]} types
     * @return {*}  {this}
     * @memberof BuildTile
     */
    public init(types: string[]): this {
        // Ruins cover furit and game so we need to set the RUIN as the type to render,
        // and save the other object to be render later
        if(types.includes("RUIN")) {
            this.type = types[types.findIndex((value=>value==="RUIN"))];
            if(types.length > 1){
              this.metadata.replaced_with = types[types.findIndex((value=>value!=="RUIN"))];
            } 
        }else {
            this.type = types[0];
        }
        return this;
    }
    /**
     * @constructor
     *
     * @param {TileJson} json
     * @return {*}  {this}
     * @memberof BuildTile
     */
    public initFromJson(json: TileJson): this {
        this.type = json.type;
        this.metadata = json.metadata;
        return this;
    }
    public toJSON(): TileJson {
        return {
            type: this.type,
            metadata: this.metadata
        }
    }
    public getType(tribe: Tribe): string {
        if(this.type === "GAME" || this.type === "FRUIT"){
            return `${this.type}_${tribe.toUpperCase()}`;
        }
        return this.type;
    }
    public manifest(tribe: Tribe): Manifest {
        if(this.type === "GAME" || this.type === "FRUIT"){
            let key = `${this.type}_${tribe.toUpperCase()}`;
            return {
                asset: key,
                item: 0,
                type: "gltf"
            };
        }
        return {
            asset: this.type,
            item: 0,
            type: "gltf"
        };
    }
}




