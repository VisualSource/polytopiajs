//import { InstancedUniformsMesh } from 'three-instanced-uniforms-mesh';
import { DynamicDrawUsage, Object3D, InstancedMesh } from "three";
import EventEmittter from '../../core/EventEmitter';
import type { SystemEventListener } from '../../core/EventEmitter';
import type { UUID } from "../../core/types";
//import { SystemEvents } from '../../events/systemEvents';

interface WorldObjectData {
    x: number;
    y: number; 
    z: number;
    rotation: number;
    index: number;
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
/*
 Should make a version to use the 'InstancedUniformsMesh'
 but it does not support mutliple materials which is needed for the water tiles 
 but maybe i can add switch between the default InstanceMesh and Unifrom one.
*/
export default class InstancedObject extends InstancedMesh implements SystemEventListener {
    public events: EventEmittter = new EventEmittter();
    private dummy: Object3D = new Object3D();
    constructor(public name: string, geometry: THREE.BufferGeometry | undefined, material: THREE.Material | THREE.Material[] | undefined, public data: WorldObjectData[], private readonly WORLD_TILE_OFFSET: number = 4 ){
        super(geometry,material,15**2);
        this.instanceMatrix.setUsage(DynamicDrawUsage);
        this.update();
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
    public getItem(index: number): WorldObjectData {
        if(index > this.count || index < 0) throw new Error("Index out of bounds");
        return this.data[index];
    }
    public getItemById(id: UUID): WorldObjectData | undefined {
        return this.data.find(value=>value.id === id);
    }
    public editInstance(id: UUID, data: IEditableWorldObjectData): void {
        const inst = this.getItemById(id);
        if(!inst) return;

        for(const item in data){
            (inst as any)[item] = (data as any)[item];
        }

        this.update();

    }
    public createInstance(data: WorldObjectData): void { 
        this.data.push(data);
        this.update();
    }
    public removeInstanceById(id: UUID): void {
        this.removeInstance(this.data.findIndex(data=>data.id === id));
    }
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
    public setAllShow(show = false): void {
        this.data.forEach(value=>{ value.shown = show });
        this.update();
    }
    public removeAll(): void {
        this.data = [];
        this.count = 0;
        this.update();
    }
    public update(): void {
        this.count = this.data.length;
        for(let i = 0; i < this.data.length; i++){
            this.data[i].index = i;
            if(this.data[i].shown) {
                this.setPostion(i,this.data[i].x,this.data[i].y,this.data[i].z);
                this.setRotation(i,this.data[i].rotation);
            } else {
                this.count--;
            }
        }
        this.instanceMatrix.needsUpdate = true;
    }
}