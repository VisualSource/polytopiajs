//import { InstancedUniformsMesh } from 'three-instanced-uniforms-mesh';
import { DynamicDrawUsage, Object3D, InstancedMesh, Matrix4 } from "three";
import EventEmittter from '../../core/EventEmitter';
import type { SystemEventListener } from '../../core/EventEmitter';
import type { UUID } from "../../core/types";
//import { SystemEvents } from '../../events/systemEvents';

interface WorldObjectData {
    x: number;
    y: number; 
    z: number;
    rotation: number;
    shown: boolean;
    owner: string;
    id: UUID;
    type: "unit" | "tile";
}

interface IEditableWorldObjectData {
    x?: number;
    y?: number; 
    z?: number;
    rotation?: number;
    shown?: boolean;
    owner?: UUID;
}
/**
 @see <https://github.com/BF3RM/MapEditor/blob/development/WebUI/src/script/modules/InstanceManager.ts> 
*/
export default class InstancedObject extends InstancedMesh implements SystemEventListener {
    public events: EventEmittter = new EventEmittter();
    private dummy: Object3D = new Object3D();
    constructor(public name: string, geometry: THREE.BufferGeometry | undefined, material: THREE.Material | THREE.Material[] | undefined, public data: WorldObjectData[], private readonly WORLD_TILE_OFFSET: number = 4 ){
        super(geometry,material,15**2);
        this.instanceMatrix.setUsage(DynamicDrawUsage);
        this.update();
    }
    private swapInstance(a: number, b: number): void {
        const cachedMatrix = new Matrix4();
        const cachedData = this.data[a];
        this.getMatrixAt(a,cachedMatrix);

        const matrix = new Matrix4();
        this.getMatrixAt(b,matrix);
        this.setMatrixAt(a,matrix);
        this.data[a] = this.data[b];

        this.setMatrixAt(b,cachedMatrix);
        this.data[b] = cachedData;
    }
    public setRotation(index: number, rotation: number): void {
        this.data[index].rotation = rotation;
        this.dummy.rotation.set(0,rotation,0);
        this.dummy.updateMatrix();
        this.setMatrixAt(index,this.dummy.matrix);
    }
    public setPostion(index: number, x: number, y: number, z: number): void {
        this.data[index].x = x;
        this.data[index].y = y;
        this.data[index].z = z;
        this.dummy.position.set(
            x * this.WORLD_TILE_OFFSET,
            y * this.WORLD_TILE_OFFSET,
            z * this.WORLD_TILE_OFFSET
        );
        this.dummy.updateMatrix();
        this.setMatrixAt(index,this.dummy.matrix);
    }
    public getIndex(index: number): WorldObjectData | undefined {
        if(index < 0 || index > this.data.length) return;
        return this.data[index];
    }
    public getItem(id: UUID): WorldObjectData | undefined {
        return this.data.find(value=>value.id === id);
    }
    public editInstance(id: UUID, data: IEditableWorldObjectData): void {
        const index = this.data.findIndex(value=>value.id===id);
        if(index === -1){
            console.error(`Failed to find id (${id})`);
            return;
        }

        for(const item in data){
            (this.data[index] as any)[item] = (data as any)[item];
        }
        this.update();
    }
    public createInstance(data: WorldObjectData): void { 
        this.data.push(data);
        this.count = this.data.length;
        this.update();
    }
    public removeInstance(id: UUID): void {
        this.data = this.data.filter(item=>item.id !== id);
        this.count = this.data.length;
        this.update();
    }
    public removeAll(): void {
        this.data = [];
        this.count = 0;
        this.update();
    }
    public setVisibility(id: UUID, visible: boolean): boolean {
        const index = this.data.findIndex(value=>value.id===id);
        if(index === -1){
            console.error(`Id (${id}) does not exist`);
            return false;
        }

        if(!visible) {
            
            if(index < this.count) {
                // Swap [n] with [count-1] instances and decrease count by 1, so the new invisible instance is after the
			    // last visible instance
                this.data[index].shown = false;
                this.swapInstance(this.count - 1,index);
                // Decrease count
                this.count--;
                this.instanceMatrix.needsUpdate = true;
            }
            return false;
        }

        if(!(index < this.count)) {
            // Swap [n] with [count-1] instances and decrease count by 1, so the new invisible instance is after the
			// last visible instance
            this.data[index].shown = true;
            this.swapInstance(this.count, index);
            this.count++;
            this.instanceMatrix.needsUpdate = true;
        }

        return true;
    }
    public update(): void {
        for(let i = 0; i < this.data.length; i++){
            this.setPostion(i,this.data[i].x,this.data[i].y,this.data[i].z);
            this.setRotation(i,this.data[i].rotation);
        }
        this.instanceMatrix.needsUpdate = true;
    }
}

/*
 public removeInstance(index: number): WorldObjectData {
        if (index < 0 || index >= this.data.length) throw new Error('Index out of bounds');
        const len = this.data.length - 1;

        let item = this.data[index];

        for(let i = index; i < len; i++){
            this.data[i] = this.data[i + 1];
        }

        this.data.length = len;

        this.update();

        return item;
    }

*/