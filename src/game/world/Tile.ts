import { nanoid } from "nanoid";
import random from "random";
import { capitalize } from "../../utils/strings";

import type { Manifest } from "../loaders/AssetLoader";
import type {TileBase, Tribe, UUID} from '../core/types';
import type AssetLoader from "../loaders/AssetLoader";
import type Engine from "../core/Engine";
import type CityTile from "./rendered/CityTile";
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
    level_data: (number | null)[][][];
    city_name: string;
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

class CityLevelData {
    private _data: (number | null)[][][];
    constructor(private city: City){}
    public init(){
        this._data = [
            Array.from({ length: 2 }, ()=> Array.from({length: 2}, ()=> random.int(1,5))),
            Array.from({ length: 2}, (le,li)=> Array.from({length: 2},(re,ri)=> {
                const modelId = () => random.float(0,1) > 0.5 ? null : random.int(1,5);
                if(li === 1 && ri === 1) return this.city.capital ? 0 : modelId();
                return modelId();
            }) )
        ]
    }
    private getSizeing(){
        switch (this.city.city_level) {
            case 0:
            case 1: // 2x2
                return {
                    OFFSET: 0.35,
                    SPACING: 0.9,
                    SIZE: 2
                };
            case 2:
            case 3:
            case 4: // 3x3
                return {
                    OFFSET: 0.7,
                    SPACING: 0.8,
                    SIZE: 3
                }
            default: //4x4
                return {
                    OFFSET: 1.1,
                    SPACING: 0.7,
                    SIZE: 4
                }
        }
    }
    public set load(city: (number | null)[][][]){
        this._data = city;
    }
    public toJSON(): (number | null)[][][] {
        return this._data;
    }
    /**
     * when city changes for example from 2x2 to 3x3 update past level to reflect the change
     *  
     */
    public refactor(): void {
        const {SIZE} = this.getSizeing();
        if(this._data[0][0].length === SIZE) return; 

        for(let i = 0; i < this._data.length; i++) {

            this._data[i] = Array.from({ length: SIZE }, ()=> Array.from({ length: SIZE }, () => null ) );
           /* 
            This merges the old array into the new array. Moves the old array into the bottom right corner.
            which is the size that is render towards the camera. This is how it apperies to act the game but, 
            can determin if this is the readly method.
           this._data[i] = Array.from({ length: SIZE }, (el,index) => Array.from({ length: SIZE }, (e,id)=>{
                try {
                    return this._data[i][index - 1][id - 1] ?? null;
                } catch (error) {
                    return 1;
                }
            }));*/
        }

    }
    public generateLevel(): void {
        this.refactor();

        const {SIZE} = this.getSizeing();

        this._data.push(Array.from({ length: SIZE }, ()=> Array.from({ length: SIZE}, (a,b)=> null) ));


        for(let level = 0; level < this._data.length; level++) {
            for(let layer = 0; layer < this._data[level].length; layer++){
                for(let col = 0; col < this._data[level][layer].length; col++ ){
                    if((level === this._data.length - 1) && ( col === SIZE - 1 ) && (layer === SIZE - 1) ) {
                         // Captial marking 
                        const get_bottom = (base: number): number => {
                            if(this._data[base - 1] && (this._data[base - 1][layer][col] === null)) {
                                return get_bottom(base - 1);
                            }
                            return base;
                        }

                        this._data[get_bottom(level)][layer][col] = 0;

                        continue;
                    }

                    if(this._data[level - 1] && (this._data[level - 1][layer][col] === null)){
                        this._data[level][layer][col] = null;
                        continue;
                    }
                    
                    this._data[level][layer][col] = random.float(0,1) > 0.1 ? random.int(1,5) : null;
                }
            }
        }

    }
    public *[Symbol.iterator](){
        if(!this._data) throw new Error(`City level data was not init | ${this.city.id}`);
        const { SPACING, OFFSET } = this.getSizeing();
        let level = 0;
        let row = 0;
        let item = 0;
        let x = 0;
        let z = 0;
        let y = 0;
        while(level < this._data.length) {
            while(row < this._data[level].length) {
                while(item < this._data[level][row].length){
                    yield {
                        level: y, // level should be the y of the object
                        x: x + OFFSET,
                        z: z + OFFSET,
                        type: this._data[level][row][item]
                    };
                    item++;
                    x -= SPACING;
                }
                item = 0;
                x = 0;
                row++;
                z -= SPACING;
            }
            row = 0;
            z = 0
            level++;
            y += 0.7;
        }   
    }
}

const CITY_SYLLABLES: {[tribe: string]: string[] } = {
    "bardur": ["ark","bu","fla","gru","gu","lak","lin","ork","rø","tof","ur"]
}

export class City extends Tile {
    static cityJsonConstructor(json: CityJson): City {
        return new City().cityJsonConstructor(json);
    }
    static cityDefaultConstructor(data: { capital: boolean, tribe: Tribe }): City {
        return new City().cityDefaultConstructor(data);
    }
    public readonly isCity: boolean = true;
    public type: TileBase = "CITY";
    public capital: boolean = false;
    public current_units: number = 0;
    public city_wall: boolean = false;
    public city_level: number = 1;
    public level_data: CityLevelData;
    public city_name: string = "";
    constructor(){
        super();
        this.level_data = new CityLevelData(this);
    }
    public get uiName(): string {
        return `The city of ${this.city_name} lvl ${this.city_level}`;
    }
    public get key(): string {
        return `${this.type}_${this.id}`;
    }
    public cityJsonConstructor(json: CityJson): this {
        this.capital = json.capital;
        this.current_units = json.current_units;
        this.city_wall = json.city_wall;
        this.city_level = json.city_level;
        this.metadata = json.metadata;
        this.level_data.load = json.level_data;
        this.city_name = json.city_name;
        return this;
    }
    public cityDefaultConstructor(data: { capital: boolean, tribe: Tribe }): this {
        this.capital = data.capital;
        this.level_data.init();

        const syllable = CITY_SYLLABLES[data.tribe];
        const len = random.int(4,6);
        for(let i = 0; i < len; i++){
            this.city_name += syllable[random.int(0, syllable.length - 1)];
        }
        this.city_name = capitalize(this.city_name);

        return this;
    }
    public toJSON(): CityJson {
        return {
            capital: this.capital,
            city_level: this.city_level,
            city_wall: this.city_wall,
            city_name: this.city_name,
            current_units: this.current_units,
            type: "CITY",
            metadata: this.metadata,
            level_data: this.level_data.toJSON(),
        };
    }
    public async levelUpCity(assets: AssetLoader, engine: Engine, tribe: Tribe, owner: UUID): Promise<void> {
        const tile = engine.scene.getObject<CityTile>(this.key);

        if(!tile) {
            console.warn("Render | Failed to regenerate city | Why: city object does not exist.");
            return;
        }

        tile.clean();

        this.city_level++;

        this.level_data.generateLevel();

        await this.render(assets,engine,tribe,owner);

    }
    
    public async render(assets: AssetLoader, engine: Engine, tribe: Tribe, owner: UUID): Promise<void> {
        try {
            const tile = engine.scene.getObject<CityTile>(this.key);

            if(!tile) {
                console.warn("Render | Failed to render city |", this.id, "| Why: Root object does not exist.");
                return;
            };

            for(const data of this.level_data) {
            
                if(data.type === null) continue;
                let item = tile.getObjectInstance(`CITY_PART_${data.type}`);
                if(!item) {
                    const model = await assets.getAsset(`${tribe.toUpperCase()}_CITY`,data.type,"gltf");
                    item = tile.createObjectInstance(`CITY_PART_${data.type}`,model.geometry,model.material);
                }

                item.createInstance({
                    id: "",
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
        } catch (error: any) {
            console.warn(`%cRender City | ${this.id} | Why: ${error.message}`, [ "color: #eee", "background-color: red" ]  );
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




