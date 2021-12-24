import { Mesh } from "three";
import InstancedObject from "./InstancedObject";
import type { Position, UUID } from "../../core/types";
import { RenderOrder } from "../../core/renderOrder";


export default class CityTile extends Mesh {
    public isGameObject: boolean = true;
    constructor(public name: string, public tile_owner: UUID,  position: Position, geometry?: THREE.BufferGeometry | undefined, material?: THREE.Material | THREE.Material[] | undefined){
        super(geometry,material);
        this.position.set(position.row * 4, 0, position.col * 4);
        this.renderOrder = RenderOrder.BASE;
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
        obj.renderOrder = RenderOrder.TOP;
        this.add(obj);
        return obj;
    }
    public removeObjectInstance(key: string){
        const obj = this.getObjectByName(key);
        if(!obj) return;
        this.remove(obj);
    }
} 