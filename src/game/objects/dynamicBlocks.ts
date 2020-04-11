import {Mesh, BoxGeometry, MeshBasicMaterial} from 'three';
import globalDispatcher from '../EventDispatcher';
import Files from '../utils/FileLoader';
       
export class DynamicBlock extends Mesh implements Polytopia.Objects.Dynamic.IDynamicBlock{
    cursor: Polytopia.Objects.Dynamic.IDynamicBlock["cursor"];
    constructor({
        position = {x:0,y:0,z:0},
        geometry = new BoxGeometry( 1, 1, 1 ), 
        material = new MeshBasicMaterial( { color: 0xff0000, wireframe: true }), 
        variation = 0, 
        rotation = 0, 
        faction = null, 
        resource = null,
        type
    }: Polytopia.Objects.Dynamic.IDynamicBlockParams){  
        super(geometry,material);
        this.cursor = "pointer";
        this.userData = {
            type,
            variation,
            rotation,
            faction,
            resource
        };
        this.receiveShadow = true;
        this.position.set(position.x,position.y,position.z);
        globalDispatcher.addListener("click",(data: Polytopia.IClickEvent)=>this.onClick);
    }
    onClick(data: Polytopia.IClickEvent){

    }
    get blockType(): Polytopia.Objects.Block{
        return this.userData.type;
    }
    get variation(): number{
        return this.userData.variation;
    }
    get faction(): Polytopia.IFaction{
        return this.userData.faction;
    }
} 


export class Water extends DynamicBlock{
    constructor({
        position, 
        faction,
        variation=0,
        rotation=0,
        fish=false, 
        ruin=false
    }:Polytopia.Objects.Blocks.IWaterParams){
        super({
            type: "Water",
            position, 
            rotation,
            faction,
            material: Files.resources.water.material[variation],
            geometry: Files.resources.water.geometry[variation]
        });
        this.name = `water${variation}`;
    }
}

export class Ocean extends DynamicBlock{
    constructor({
        position, 
        faction,
        variation=0, 
        rotation=0,
        whale=false, 
        ruin=false, 
    }:Polytopia.Objects.Blocks.IOceanParams){
        super({
            type: "Ocean",
            position,
            rotation,
            faction,
            material: Files.resources.ocean.material[variation],
            geometry: Files.resources.ocean.geometry[variation]
        });
        this.name = `ocean${variation}`;
    }
}

export class Field extends DynamicBlock{
    constructor({
        position, 
        faction,
        ruin=false,
        crop=false,
        fruit=false
    }:Polytopia.Objects.Blocks.IFieldParams){
        super({
            type:"Field",
            position,
            rotation: 0,
            variation: 0,
            material: undefined,
            geometry: undefined,
            faction
        });
        this.name = `field${this.variation}`;
    }
}
export class Mountain extends DynamicBlock{
    constructor({
        position,
        faction=null,
        ruin=false,
    }: Polytopia.Objects.Blocks.IMountainParams){
        super({
            position,
            faction,
            variation: 0,
        });
    }
}
export class Forest extends DynamicBlock{
    constructor({
        position,
        faction,
        wild_animal=false,
        ruin=false
    }:Polytopia.Objects.Blocks.IForestParams){
        super({
            position,
            faction,
            variation: 0
        });
    }
}
export class Village extends DynamicBlock{
    constructor({
        position,
        faction = null
    }: Polytopia.Objects.Blocks.IVillageParams){
        super({
            position,
            faction,
            variation:0
        });
    }
}
export class City extends DynamicBlock{
    constructor({
        position,
        faction=null,
        capital=false
    }:Polytopia.Objects.Blocks.ICityParams){
        super({
            position,
            faction
        });
    }
}
