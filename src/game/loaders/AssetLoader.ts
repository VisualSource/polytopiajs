import localforage from 'localforage';
import JsZip from 'jszip';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { GLTFLoader, GLTF, GLTFLoaderPlugin } from 'three/examples/jsm/loaders/GLTFLoader';
import { LoadingManager } from 'three';
//import { TextureLoader } from 'three';

//import EventEmitter, { SystemEventListener } from '../core/EventEmitter';
//import {SystemEvents, AssetLoaderEvents} from '../events/systemEvents';
import KHR_Variants, { VariantGLTF } from './KHR_Variants';

type CachedAsset = { blob: Blob, name: string, date: string, resourceItem: string | null };
type VarientComponent = { child: number, name: string };

export type Variant = VarientComponent | number;
export type ModelType = "obj" | "gltf";


export interface AssetLoaderListener {
    loader: AssetLoader;
}

export interface Manifest {
    asset: string;
    item: Variant;
    type: ModelType;
}

interface ManifestItem { 
    name: string;
    file: string;
    resource?: string;
}

/**
 *  @type {*} 
 *  @see https://www.iana.org/assignments/media-types/media-types.xhtml#model
*/
const mimeTypes = {
    "glb": "model/gltf-binary",
    "gltf": "model/gltf+json",
    "obj": "model/obj",
    "mtl": "model/mtl",
    "json": "application/json"
}


export default class AssetLoader  {
    static INSTANCE: AssetLoader | null = null;
    public assets: Map<string, GLTF | THREE.Group> = new Map();
    constructor(init: boolean = false){
        if(AssetLoader.INSTANCE) return AssetLoader.INSTANCE;
        AssetLoader.INSTANCE = this;
        if(init) this.init();

        //@ts-ignore
        if(import.meta.env.MODE === "development") window.assetLoader = AssetLoader.INSTANCE;
    }

    public async getAsset(asset: string, item: Variant = 0, type: ModelType = "gltf"){
        const content = this.assets.get(asset);
        if(!content) throw new Error(`Failed to get asset "${asset}"`);
        
        if(type === "obj") {
            return (content as THREE.Group).children[item as number] as THREE.Mesh;
        } else if(type === "gltf" && ((item as VarientComponent)?.child != undefined)){
            const mesh = (content as VariantGLTF).scene.children[(item as VarientComponent).child].clone(true) as THREE.Mesh;
            await (content as VariantGLTF).functions.selectVariant(mesh,(item as VarientComponent).name);
            return mesh;
        }

        return (content as GLTF).scene.children[item as number] as THREE.Mesh;
    }

    public getVarient(asset: string): GLTF | THREE.Group {
        const content = this.assets.get(asset);
        if(!content) throw new Error(`Unkown asset "${asset}".`);
        return content;
    }
  
    public async init(){
        try {
        
            localforage.config({
                name: "polytopia",
                version: 1,
                description: "Polytopia file storage",
                storeName: "polytopia"
            });

            if(localStorage.getItem("pak_installed") === null){
                await this.install();
            } else {
               // await this.checkForUpdate();
            }
                
            await this.load();
            
        } catch (error) {
            console.error(error);
        }
    }
    public async install(src: string = "/raw.zip", version: number | undefined = undefined): Promise<void> {
        try {
            const zip = new JsZip();

            const request = await fetch(src);
            const blob = await request.blob();

            const file = await zip.loadAsync(blob);

            const manifest: ManifestItem[] = JSON.parse(await file.file("manifest.json")?.async("string") as string);

            // make sure the storage is clear.
            await localforage.removeItem("pak");

            const assetMap = new Map<string, CachedAsset>();

            for await (const asset of this.cache(manifest,file)){
                assetMap.set(asset.name,asset);
            }

            await localforage.setItem("pak", assetMap);

            if(version){
                localStorage.setItem("pak_installed",version.toString());
            } else {
              //  const pak = await (await fetch(import.meta.env.SNOWPACK_PUBLIC_PAK_VERSION)).json();
                localStorage.setItem("pak_installed","1"/*pak.version.toString()*/);
            }

        } catch (error) {
            console.error(error);
        }
    }
    private async *cache(assets: ManifestItem[], file: JsZip): AsyncGenerator<CachedAsset, null, any>{
        let i = 0;
        while (i < assets.length) {
            const fileName = assets[i].file;
            const ext = fileName.split(".").pop();
           
            if(!ext) throw new Error(`File: ${fileName} is missing a file extention`);

            const asset_blob = new Blob(
                [
                    await file.files[fileName].async("uint8array")
                ],
                {
                    type: (mimeTypes as any)[ext]
                }
            );

            yield {
                blob: asset_blob, // file data
                date: new Date().toISOString(), // date cached
                name: assets[i].name, // Interial name used to access resource
                resourceItem: assets[i]?.resource ?? null,
            };
            i++;
        }
        return null;
    }
    private async *loadAsset(cachedAssets: Map<string, CachedAsset>): AsyncGenerator<{ name: string, asset: GLTF | THREE.Group }, null, any> {
        const loaderManager = new LoadingManager(
            undefined, undefined,(url: string)=> {console.error("Loader Error |", url);});
        const gltfLoader = new GLTFLoader(loaderManager);
        //const texLoader = new TextureLoader();

        gltfLoader.register(parser => new KHR_Variants(parser));

        for (const [name,data] of cachedAssets) {
            switch (data.blob.type) {
                case "model/gltf-binary":
                case "model/gltf+json":{
                    /** 
                     * @todo Change to parseAsync
                     * @body After updating to threeJS change `.parse` to `.parseAsync` due to r135 of threeJS having this method now. Currntly waiting for types to update
                    */
                    yield await new Promise( async (ok,err)=>{
                        gltfLoader.parse(await data.blob.arrayBuffer(),"", async (gltfAsset) => {
                            /* 
                                If the gltf file has variants we need to load them, here so 
                                they can be accessed easier when we do need the asset.

                                Using the `in` key word, should be better then checking if the value is truty.
                            */
                            if("functions" in gltfAsset){
                                await (gltfAsset as VariantGLTF).functions.ensureLoadVariants(gltfAsset.scene.children[0] as THREE.Mesh);
                            }

                            ok({
                                name,
                                asset: gltfAsset
                            });

                        },(err)=>{
                            throw err;
                        });
                    });
                    break;
                }
                case "model/obj": {
                    yield await new Promise(async(ok,err)=>{
                        try {
                            if(!data.resourceItem) throw new Error(`Failed to load ${data.resourceItem} for ${data.name}`);
                            
                            const rs = cachedAssets.get(data.resourceItem);

                            if(!rs) throw new Error(`Loader (MTL) | Failed to load ${name} resource`);

                            const mtl = await rs.blob.text();

                            if(!mtl) throw new Error(`Loader (MTL) | Failed to load asset ${data.resourceItem}`);
    
                            const objLoader = new OBJLoader(loaderManager);
                            const materials = new MTLLoader(loaderManager).parse(mtl,"");
                            objLoader.setMaterials(materials);
                            const model = objLoader.parse(await data.blob.text());

                            ok({
                                name,
                                asset: model
                            });

                        } catch (error: any) {
                            err(error);
                        }
                    });
                    break;
                }
                case "application/json": {
                    break;
                }
                default:
                    break;
            }
        }

        return null;
    }
    public async load(): Promise<void> {
        const pak: Map<string, CachedAsset> | null = await localforage.getItem("pak");

        if(!pak) throw new Error("Failed to load asset.");
        
        for await (const asset of this.loadAsset(pak)) {
            this.assets.set(asset.name,asset.asset);
        }

    }
    public async checkForUpdate() : Promise<void> {
        const version = localStorage.getItem("pak_installed");

        const pak = await (await fetch(import.meta.env.SNOWPACK_PUBLIC_PAK_VERSION)).json();
        
        if(version !== pak.version) {
            localforage.removeItem("pak");
            await this.install("/raw.zip",pak.version);
        }
    }
} 