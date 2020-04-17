import {Mesh, BoxGeometry, MeshBasicMaterial} from 'three';
import Files from '../utils/FileLoader';
import globalDispatcher from '../EventDispatcher';
export class StaticBlock extends Mesh implements Polytopia.Objects.Static.IStaticBlock{
    constructor({
        geometry = new BoxGeometry( 1, 1, 1 ),
        material= new MeshBasicMaterial( { color: 0xff0000, wireframe: true }),
        variation = 0,
        type = null
    }:Polytopia.Objects.Static.IStaticBlockParams){
        super(geometry,material);
        this.userData = {
            variation,
            type
        }
        globalDispatcher.addListener("click",(data)=>{
            if(data.object === this.id){
                //@ts-ignore
                this.parent?.onClick(this.parent?.id);
            }
        });
    }
    get variation(){
        return this.userData.variation;
    }
    get getType(){
        return this.userData.type;
    }
}


class Fruit extends StaticBlock{
    constructor({
        variation = 0
    }: Polytopia.Objects.Blocks.IFruitParams){
        super({
            type: "fruit",
            variation,
            material: Files.resources.fruit.material[0],
            geometry: Files.resources.fruit.geometry[0]
        });
        this.name = `fruit${variation}`;
    }
}
class Crop extends StaticBlock{
    constructor(){
        super({
            type: "crop",
            material : Files.resources.crop.material[0],
            geometry: Files.resources.crop.geometry[0]
        });
        this.name = "crop";
    }
}
class Ruin extends StaticBlock{
    constructor(){
        super({
            type:"ruin",
            material: Files.resources.ruin.material[0],
            geometry: Files.resources.ruin.geometry[0]
        });
        this.name = "ruin";
    }
}
class WildAnimal extends StaticBlock{
    constructor({
        variation = 0
    }:Polytopia.Objects.Blocks.IWildAnimalParams){
        super({
            type: "wild_animal",
            variation,
            material: Files.resources.wild_animal.material[variation],
            geometry: Files.resources.wild_animal.geometry[variation]
        });
        this.name = `wild_animal${variation}`;
    }
}
class Metal extends StaticBlock{
    constructor(){
        super({
            type:"metal",
            material: Files.resources.metal.material[0],
            geometry: Files.resources.metal.geometry[0]
        });
        this.name = "metal";
    }
}
class Fish extends StaticBlock{
    constructor(){
        super({
            type: "fish",
            material: Files.resources.fish.material[0],
            geometry: Files.resources.fish.geometry[0]
        });
        this.name = "fish";
    }
}
class Whale extends StaticBlock{
    constructor(){
        super({
            type: "whale",
            material: Files.resources.whale.material[0],
            geometry: Files.resources.whale.geometry[0]
        });
        this.name = "whale";
    }
}

export function addResouce(
    resource: Polytopia.Objects.Resource,
    add: Function,
    ruin: boolean = false,
    variation: number = 0): void{
        const setResouce = (visible: boolean = true)=>{
            switch (resource) {
                case "crop":{
                    const crop = new Crop();
                    crop.visible = visible;
                    add(crop);
                    break;
                }
                case "fish":{
                    const fish = new Fish();
                    fish.visible = visible;
                    add(fish);
                    break;
                }
                case "fruit":{
                    const fruit = new Fruit({variation});
                    fruit.visible = visible;
                    add(fruit);
                    break;
                }
                case "metal":{
                    const metal = new Metal();
                    metal.visible = visible;
                    add(metal);
                    break;
                }
                case "whale":{
                    const whale = new Whale();
                    whale.visible = visible;
                    add(whale);
                    break;
                }
                case "wild_animal":{
                    const wild_animal = new WildAnimal({variation});
                    wild_animal.visible = visible;
                    add(wild_animal);
                    break;
                }
                default:
                    break;
            }
        }
    if(ruin){
        add(new Ruin());
        setResouce(false);
    }else{
        setResouce();
    }
    }