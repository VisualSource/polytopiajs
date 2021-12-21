import { Mesh } from "three";
import InstancedObject from "./InstancedObject";
import random from "random";
import type { Position, UUID } from "../../core/types";


export default class CityTile extends Mesh {
    public isGameObject: boolean = true;
    constructor(public name: string, public tile_owner: UUID,  position: Position, geometry?: THREE.BufferGeometry | undefined, material?: THREE.Material | THREE.Material[] | undefined){
        super(geometry,material);
        this.position.set(position.row * 4, 0, position.col * 4);
    }
    public getObjectInstance(key: string): InstancedObject | undefined {
        const obj = this.getObjectByName(key);
        if(!obj) return;
        return obj as InstancedObject;
    }
    public createObjectInstance(key: string, geometry: THREE.BufferGeometry | undefined, material: THREE.Material | THREE.Material[] | undefined){
        const obj = new InstancedObject(key,geometry,material,[],1);
        this.add(obj);
        return obj;
    }
    public removeObjectInstance(key: string){
        const obj = this.getObjectByName(key);
        if(!obj) return;
        this.remove(obj);
    }
} 