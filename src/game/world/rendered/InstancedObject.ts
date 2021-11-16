import { InstancedUniformsMesh } from 'three-instanced-uniforms-mesh';
import { DynamicDrawUsage, Object3D, InstancedMesh } from "three";
import EventEmittter, { SystemEventListener } from '../../core/EventEmitter';
import { SystemEvents } from '../../events/systemEvents';

export enum ObjectEvents {
    OBJECT_INDEX_CHANGE
}

interface WorldObjectData {
    x: number;
    y: number; 
    z: number;
    rotation: number;
    index: number;
    shown: boolean,
    owner: {
        group: string;
        index: number;
        type: "base" | "building" | "unit";
    }
}
/*
 Should make a version to use the 'InstancedUniformsMesh'
 but it does not support mutliple material which is needed for the water tiles 
 but maybe i can add switch between the default InstanceMesh and Unifrom one.
*/
export default class InstancedObject extends InstancedMesh implements SystemEventListener{
    static readonly WORLD_TILE_OFFSET: number = 4;
    public events: EventEmittter = new EventEmittter();
    private dummy: Object3D = new Object3D();
    constructor(public name: string, geometry: THREE.BufferGeometry | undefined, material: THREE.Material | THREE.Material[] | undefined, public data: WorldObjectData[] ){
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
            x * InstancedObject.WORLD_TILE_OFFSET,
            y * InstancedObject.WORLD_TILE_OFFSET,
            z * InstancedObject.WORLD_TILE_OFFSET
        );
        this.dummy.updateMatrix();
        this.setMatrixAt(index,this.dummy.matrix);
    }
    public getItem(index: number): WorldObjectData {
        if(index > this.count || index < this.count) throw new Error("Index out of bounds");
        return this.data[index];
    }
   /**
    * Returns the index of the first element in the array where predicate is true, and -1 otherwise.
    *
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @return {*}  {number}
    * @memberof InstancedObject
    */
   public getIndexFromPos(x: number, y: number, z: number): number {
        return this.data.findIndex((value)=>{
            return value.x === x && value.y === y && value.z === z;
        });
    }
    public createInstance(data: WorldObjectData){ 
        this.data.push(data);
        this.update();
    }
    public removeInstance(index: number){
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
    public removeAll() {
        this.data = [];
        this.update();
    }
    public update(){
        this.count = this.data.length;
        for(let i = 0; i < this.data.length; i++){
            this.data[i].index = i;
            this.events.emit<SystemEvents,ObjectEvents>({type: SystemEvents.OBJECT, id: ObjectEvents.OBJECT_INDEX_CHANGE, data: { owner: this.data[i].owner, index: i }});
            this.setPostion(i,this.data[i].x,this.data[i].y,this.data[i].z);
            this.setRotation(i,this.data[i].rotation);
        }
        this.instanceMatrix.needsUpdate = true;
    }
}