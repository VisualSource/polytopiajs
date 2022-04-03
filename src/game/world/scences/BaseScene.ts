import type { BehaviorSubject } from "rxjs";
import { Group, Scene } from "three";
import InstancedObject from "../rendered/InstancedObject";

export default class BaseScene extends Scene {
    constructor(private level: BehaviorSubject<string>) {
        super();
        level.subscribe(value=>{
            const object = this.getObjectByName(value);
            if(!object) {
                const group = new Group();
                group.name = value;
                this.add(group);
            }
        });
    }
    public get levelname(): string {
        return this.level.getValue();
    }
    public getLevel(): Group {
        return this.getObjectByName(this.levelname) as Group;
    }
    public getObject<T = InstancedObject>(key: string): T | null {
        const scene = this.getLevel();
        const obj = scene.getObjectByName(key);
        if(obj) return obj as any as T;
        return null;
    }
    public createObjectInstance(
        key: string, 
        geometry: THREE.BufferGeometry | undefined = undefined, 
        material: THREE.Material | THREE.Material[] | undefined = undefined): InstancedObject {
        const obj = new InstancedObject(key,geometry,material,[]);
        this.getLevel().add(obj);
        return obj;
    }
}