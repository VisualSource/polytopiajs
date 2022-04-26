import { Mesh } from "three";
import InstancedObject from "./InstancedObject";
import type { Position, UUID } from "../../core/types";


export default class CityTile extends Mesh {
    public isGameObject: boolean = true;
    constructor(public name: string, public tile_owner: UUID, public world_position: Position, geometry?: THREE.BufferGeometry | undefined, material?: THREE.Material | THREE.Material[] | undefined){
        super(geometry,material);
        this.position.set(world_position.row * 4, 0, world_position.col * 4);
    }
    public clean(){
        for(const child of this.children){
            if(!(child as InstancedObject)?.isInstancedMesh) continue;
            
            (child as InstancedObject).removeAll();
        }
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