import { nanoid } from "nanoid";
import type { Manifest } from "../loaders/AssetLoader";
import type {Tribe, UUID} from '../core/types';
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
/**
 *
 *
 * @export
 * @class Tile
 * @implements {ITile}
 */
export class Tile implements ITile {
    public readonly id: UUID = nanoid(4);
    constructor(public type: string, public metadata: { [name: string]: any } ){

    }

    public get show(): boolean {
        return true;
    }

    public get terrainBounsMovement(): number {
        return 0
    }
    public get terrainBounsDefence(): number {
        return 0;
    }

    public getType(tribe: Tribe){
        if(this.type === "OCEAN" || this.type === "WATER") {
            return `${this.type}_${(TO_TEXT as any)[this.metadata?.model_id ?? 0]}`;
        } 
        return `${this.type}_${tribe.toUpperCase()}`;
    }
    public manifest(tribe: Tribe): Manifest {
        if(this.type === "OCEAN" || this.type === "WATER") {
            let key = `${this.type}_${(TO_TEXT as any)[this.metadata?.model_id ?? 0]}`;
            return {
                asset: key,
                item: 0,
                type: "obj"
            }
        } 
        let key = `${this.type}_${tribe.toUpperCase()}`;
        return {
            asset: this.type === "CAPITAL" ?  key : this.type,
            item: 0,
            type: "gltf"
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
    public id: UUID = nanoid(4);
    public type: string;
    public metadata: { [name: string]: any } = {
        replaced_with: null
    };
    constructor(types: string[]){
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




