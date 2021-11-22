import { nanoid } from 'nanoid';
import { Scene, Group } from 'three';
import InstancedObject from './InstancedObject';
export default class WorldScene extends Scene {
    public levelname: string = "overworld";
    constructor(){
        super();
        this.name = "polytopia";
    }
    public activeLevelReady(){
        if(!this.getObjectByName(this.levelname)){
            this.createLevel(this.levelname);
        }
        return true;
    }
    public getLevel(name: string): Group {
        return this.getObjectByName(name) as Group;
    }
    public getActiveLevel(): Group {
        return this.getObjectByName(this.levelname) as Group;
    }
    public getOrCreateActiveLevel(): Group {
        return this.getLevelOrCreate(this.levelname);
    }
    public getLevelOrCreate(name: string) {
        const level = this.getLevel(name);
        if(level) return level;
        return this.createLevel(name);
    }
    public createLevel(name: string): Group {
        const root = new Group();
        root.name = name;
        
        this.add(root);

        return root;
    }
    public getObjectInstance(key: string): InstancedObject | null {
        const scene = this.getActiveLevel();
        const obj = scene.getObjectByName(key);
        if(obj) return obj as InstancedObject;
        return null;
    }
    public createObjectInstance(key: string, geometry: THREE.BufferGeometry | undefined = undefined, material: THREE.Material | THREE.Material[] | undefined = undefined): InstancedObject {
        
        const obj = new InstancedObject(key,geometry,material,[]);
        this.getActiveLevel().add(obj);
        return obj;
       
    }

}