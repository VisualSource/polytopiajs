import {LoadingManager, TextureLoader, Mesh} from 'three';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader';

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
        ocean: {
            geometry: {},
            material: {}
        },
        field:{
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
        this.loadingManager.onLoad = () =>{ Files.filesLoaded = true;}
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
        console.log("IMPLMENT");
        
       // this.mtlLoader.load(params.url, material=>{
        //    material.preload();
        //})
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