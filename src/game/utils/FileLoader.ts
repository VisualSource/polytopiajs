import {LoadingManager, TextureLoader, Mesh} from 'three';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader';
import {Message} from 'shineout';

interface IModel{
    name: string;
    url: string;
    requireUrl: string;
    index: number;
}
interface ITexture{
    url: string;
    name: string;
    index: null | number;
}
interface IMaterial{
    url: string;
    name: string;
    index: number;
}
interface ILoad{
    type: "material" | "model" | "texture";
    name: string;
    url: string;
    requireUrl?: string
    index: number | null;
}
export default class Files{
    static resources: {[name: string]: any} = {
        water: {
            geometry: {},
            material: {}
        },
        fish:{
            geometry: {},
            material: {}
        },
        ocean: {
            geometry: {},
            material: {}
        },
        whale:{
            geometry: {},
            material: {}
        },
        field:{
            geometry: {},
            material: {}
        },
        crop:{
            geometry: {},
            material: {}
        },
        fruit:{
            geometry: {},
            material: {}
        },
        mountain:{
            geometry: {},
            material: {}
        },
        metal:{
            geometry: {},
            material: {}
        },
        forest:{
            geometry: {},
            material: {}
        },
        wild_animal:{
            geometry: {},
            material: {}
        },
        ruin:{
            geometry: {},
            material: {}
        },
        city:{
            geometry: {},
            material: {}
        },
        village:{
            geometry: {},
            material: {}
        },
        background: {}
    };
    static filesLoaded: boolean = false;
    private loadingManager = new LoadingManager();
    private mtlLoader = new MTLLoader(this.loadingManager);
    constructor(){
        this.mtlLoader.setResourcePath(`${window.location.origin}/assets/textures/`);
        this.loadingManager.onError = (error: any)=>{console.error(error);}
        this.loadingManager.onLoad = () =>{ 
            Files.filesLoaded = true;
            //@ts-ignore
            Message.info("All Files Loaded", 3, {
                position: "bottom-right"
            });
        }
    }
    public load(load: ILoad): void{
        switch (load.type) {
            case "material":
                this.loadMaterial(load as IMaterial);
                break;
            case "model":
                this.loadModel(load as IModel);
                break;
            case "texture":
                this.loadTexture(load as ITexture);
                break;
            default:
                break;
        }
    }
    public loadMaterial(params: IMaterial){
        this.mtlLoader.load(params.url,material=>{
            material.preload();
            const materials = Object.keys(material.materials).map(e=>{
                return material.materials[e];
            });
            if(materials.length === 1){
                Files.resources[params.name].material[params.index] = materials[0];
            }else{
                Files.resources[params.name].material[params.index] = materials;
            }
        });
    }
    public loadTexture(params: ITexture): void{
        const textureLoader = new TextureLoader(this.loadingManager);
        textureLoader.load(params.url, texture=>{
            if(!params.index){
                Files.resources[params.name] = texture;
            }else{
                Files.resources[params.name][params.index] = texture;
            }
        });
    }
    public loadModel(data: IModel): void{
                /*
                Ocean and Water Load order
                
                water         0
                water_three   1
                water_two     2
                water_one     3
                water_none    4
                water_two_b   5
            */
            this.mtlLoader.load(`${window.location.origin}${data.requireUrl}`,mat=>{
                mat.preload();
                const objLoader = new OBJLoader(this.loadingManager).setMaterials(mat);
                objLoader.load(`${window.location.origin}${data.url}`,obj=>{
                    if(obj.children[0]){
                        Files.resources[data.name].geometry[data.index] = (obj.children[0] as Mesh).geometry;
                        Files.resources[data.name].material[data.index] = (obj.children[0] as Mesh).material;
                    }
                });
            });
    }
}