import { DynamicDrawUsage, Object3D, InstancedMesh, Matrix4 } from "three";
import { remove } from 'lodash-es';
import EventEmittter from '../../core/EventEmitter';
import type { SystemEventListener } from '../../core/EventEmitter';
import type { UUID } from "../../core/types";

export interface WorldObjectData {
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
 * A Dynamic version of the threejs InstancedMesh, this allows for adding, editing and removing instances.
 * The default max amount of instances is 15**2, but this can be changed when needed.
 @see <https://github.com/BF3RM/MapEditor/blob/development/WebUI/src/script/modules/InstanceManager.ts> 
*/
export default class InstancedObject extends InstancedMesh implements SystemEventListener {
    public events: EventEmittter = new EventEmittter();
    private dummy: Object3D = new Object3D();
    constructor(public name: string, geometry: THREE.BufferGeometry | undefined, material: THREE.Material | THREE.Material[] | undefined, public data: WorldObjectData[], private readonly WORLD_TILE_OFFSET: number = 4, max: number = 15**2 ){
        super(geometry,material,max);
        this.instanceMatrix.setUsage(DynamicDrawUsage);
        this.update();
    }
    /**
     * swap two instance in the matrix and data array.
     * This is mostly used for visablity, moving hidden instances to the end.
     */
    private swapInstance(index1: number, index2: number): void {
        const cachedMatrix = new Matrix4();
        this.getMatrixAt(index1,cachedMatrix);
        const cachedData = this.data[index1];
       

        const matrix = new Matrix4();
        this.getMatrixAt(index2,matrix);
        this.setMatrixAt(index1,matrix);
        this.data[index1] = this.data[index2];

        this.setMatrixAt(index2,cachedMatrix);
        this.data[index2] = cachedData;
    }
    // visible instances should be at the fount of the array.
    private sortVisablity(){
        this.data.sort((a,b)=>{
            if(!a.shown && b.shown) return -1;
            if(a.shown === b.shown) return 0;
            return 1;
        });
    }
     /**
     * Sets that rotation of a instance
     */
    public setRotation(index: number, rotation: number): void {
        this.data[index].rotation = rotation;
        this.dummy.rotation.set(0,rotation,0);
        this.dummy.updateMatrix();
        this.setMatrixAt(index,this.dummy.matrix);
    }
    /**
     * Sets that postion of a instance
     */
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
    /**
     * Returns that data of a instance by the index,
     * this func is mostly used by raycasting
     */
    public getIndex(index: number): WorldObjectData | undefined {
        if(index < 0 || index > this.data.length) return;
        return this.data[index];
    }
    /**
     * Returns the data of a instances based on the id
     */
    public getItem(id: UUID): WorldObjectData | undefined {
        return this.data.find(value=>value.id === id);
    }
    /**
     * Edit the properity of a instance's data.
     * Note: setting the shown property may not change the visablity of the object in the world, but will stop it from having its postion or rotation updated,
     * so its better to just use the 'setVisibility' to set visiblity.
     */
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
    /**
     * Create a new instance to the world
     */
    public createInstance(data: WorldObjectData): void { 
        this.data.push(data);
        
        this.sortVisablity();

        this.count = this.data.length;
    
        this.update();
    }
    /**
     * Removes a single instance form the scene 
     */
    public removeInstance(id: UUID): void {

        remove(this.data,item=>item.id===id);

        if(this.count !== 0) this.count--;
        this.instanceMatrix.needsUpdate = true;

        this.update();

     
       // const index = this.data.findIndex(el=>el.id === id);


      //  if(index === -1) {
       //     console.error("Failed to remove a instance that does not exist");
      //      return;
     //   }

       // this.swapInstance(this.data.length - 1, index);
       // this.data.pop();

      //  if(index < this.count) {
      //      this.count--;
      //  }

        

      //  this.count = this.data.length;
       // this.instanceMatrix.needsUpdate = true;
    }
    /**
     * Removes all instances.
     */
    public removeAll(): void {
        this.data = [];
        this.count = 0;
        this.instanceMatrix.needsUpdate = true;
    }
    /**
     * Update a single instances visiblity.
     * setting a instance to false does not remove its instance from the data pool,
     * but it is not rendered in the world.
     */
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
    /**
     * Updates the positions and rotation of all instances.
     */
    public update(): void {
        for(let i = 0; i < this.data.length; i++){
            if(!this.data[i].shown) continue;
            this.setPostion(i,this.data[i].x,this.data[i].y,this.data[i].z);
            this.setRotation(i,this.data[i].rotation);
        }
        this.instanceMatrix.needsUpdate = true;
    }
}