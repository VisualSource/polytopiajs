import { nanoid } from "nanoid";
import type { Manifest } from "../loaders/AssetLoader";
import type {TileBase, Tribe, UUID} from '../core/types';
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
                    asset: this.type === "CITY" ?  key : this.type,
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




