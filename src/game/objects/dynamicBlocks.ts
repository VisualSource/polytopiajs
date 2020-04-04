import {Mesh, BoxGeometry, MeshBasicMaterial} from 'three';

       
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
        this.cursor = "crosshair";
        this.userData = {
            type,
            variation,
            rotation,
            faction,
            resource
        };
        this.position.set(position.x,position.y,position.z);
        this.on("click",()=>{});
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