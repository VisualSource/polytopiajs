import {Mesh, BoxGeometry, MeshBasicMaterial} from 'three';

export class StaticBlock extends Mesh implements Polytopia.Objects.Static.IStaticBlock{
    constructor({
        geometry = new BoxGeometry( 1, 1, 1 ),
        material= new MeshBasicMaterial( { color: 0xff0000, wireframe: true })
    }:Polytopia.Objects.Static.IStaticBlockParams){
        super(geometry,material);
    }
}