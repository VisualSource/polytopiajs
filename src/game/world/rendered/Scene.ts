import { nanoid } from 'nanoid';
import { Scene, Group } from 'three';

export default class WorldScene extends Scene {
    constructor(){
        super();
        this.name = "polytopia";
    }
    public getLevel(name: string): Group {
        return this.getObjectByName(name) as Group;
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

}