import {Mesh, BoxGeometry, MeshBasicMaterial} from 'three';
import globalDispatcher from '../EventDispatcher';
import Files from '../utils/FileLoader';
import {addResouce} from './staticBlocks';
import {route} from '../../utils/history';
       
export class DynamicBlock extends Mesh implements Polytopia.Objects.Dynamic.IDynamicBlock{
    cursor: Polytopia.Objects.Dynamic.IDynamicBlock["cursor"];
    constructor({
        position = {x:0,y:0,z:0},
        geometry = new BoxGeometry( 1, 1, 1 ), 
        material = new MeshBasicMaterial({ color: 0xff0000, wireframe: true }), 
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
        this.rotateY(rotation);
        globalDispatcher.addListener("click",(data: Polytopia.IClickEvent)=>this.onClick(data));
    }
    onClick(data: Polytopia.IClickEvent){
        if(data.object === this.id){
           route("/game/view",{query: {id: this.id}, replace: true});
        }
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
    get resource(): Polytopia.Objects.Resource{
        return this.userData.resource;
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
            resource: (fish ? "fish" : null),
            material: Files.resources.water.material[variation],
            geometry: Files.resources.water.geometry[variation]
        });
        this.userData.ruin = ruin;
        this.name = `water${variation}`;
        addResouce(this.resource,(object: any)=>this.add(object), ruin);
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
            resource: (whale ? "whale" : null),
            material: Files.resources.ocean.material[variation],
            geometry: Files.resources.ocean.geometry[variation]
        });
        this.userData.ruin = ruin;
        this.name = `ocean${variation}`;
        addResouce(this.resource,(object:any)=>this.add(object),ruin);
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
            resource: (crop ? "crop" : (fruit ? "fruit" : null)),
            material: Files.resources.field.material[faction === "Imperius" ? 0 : 1],
            geometry: Files.resources.field.geometry[0],
            faction
        });
        this.userData.ruin = ruin;
        this.name = `field${this.variation}`;
        addResouce(this.resource,(object:any)=>this.add(object),ruin, this.variation);
    }
}
export class Mountain extends DynamicBlock{
    constructor({
        position,
        faction=null,
        metal=false,
        ruin=false
    }: Polytopia.Objects.Blocks.IMountainParams){
        super({
            position,
            faction,
            variation: 0,
            type: "Mountain",
            resource: (metal ? "metal" : null),
            material: Files.resources.mountain.material[0],
            geometry: Files.resources.mountain.geometry[0]
        });
        this.userData.ruin = ruin;
        this.name = `mountain${this.variation}`;
        addResouce(this.resource,(object:any)=>this.add(object),ruin);
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
            variation: 0,
            type: "Forest",
            resource: (wild_animal ? "wild_animal" :null),
            material: Files.resources.forest.material[0],
            geometry: Files.resources.forest.geometry[0]
        });
        this.userData.ruin = ruin;
        this.name = `forest${this.variation}`;
        addResouce(this.resource,(object:any)=>this.add(object),ruin,this.variation);
    }
}
export class Village extends DynamicBlock{
    constructor({
        position,
        faction = null
    }: Polytopia.Objects.Blocks.IVillageParams){
        super({
            position,
            type: "Village",
            faction,
            variation:0,
            material: Files.resources.village.material[0],
            geometry: Files.resources.village.geometry[0]
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
            type: "City",
            position,
            faction,
            material: Files.resources.city.material[0],
            geometry: Files.resources.city.geometry[0]
        });
    }
}
