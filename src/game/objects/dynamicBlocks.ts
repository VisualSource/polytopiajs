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
    constructor({position, variation = 0}:Polytopia.Objects.Blocks.IWaterParams){
        super({
            type: "Water",
            position, 
            material: Files.resources.water.material[variation],
            geometry: Files.resources.water.geometry[variation]
        });
        this.name = `water${variation}`;
    }
}