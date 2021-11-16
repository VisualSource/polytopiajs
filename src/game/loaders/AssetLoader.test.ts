import AssetLoader from "./AssetLoader";
import localforage from "localforage";
import { expect } from 'chai';
import { Group } from 'three';

describe("Asset Loader",()=>{
   /* describe("#install",()=>{
        it("should fetch and save data to IndexDB only (gltf/glb)", async ()=>{
            const loader = new AssetLoader();

            localforage.config({
                name: "polytopia",
                version: 1,
                description: "Polytopia file storage",
                storeName: "polytopia"
            });
            localforage.clear();

            await loader.install("test_1.zip");


            const data: Map<string,{ blob: Blob, name: string, date: string, resourceBlob: Blob | null }> | null = await localforage.getItem("pak");

        
            expect(data).to.not.null.key("name").eq("LAND");

        });
        it("should fetch and save data to IndexDB only (obj/mtl)", async ()=>{
            const loader = new AssetLoader();


            localforage.config({
                name: "polytopia",
                version: 1,
                description: "Polytopia file storage",
                storeName: "polytopia"
            });
            localforage.clear();

            await loader.install("test_2.zip");

            const data: Map<string,{ blob: Blob, name: string, date: string, resourceBlob: Blob | null }> | null = await localforage.getItem("pak");
        
            expect(data).to.not.null.key("name").eq("WATER_ZERO");

        });
    });
    describe("#load",()=>{
       it("loads cached asset (GLTF)",async ()=>{
            const loader = new AssetLoader();
            localforage.config({
                name: "polytopia",
                version: 1,
                description: "Polytopia file storage",
                storeName: "polytopia"
            });
            localforage.clear();

            await loader.install("test_1.zip");

            await loader.load();

            expect(loader.assets.get("LAND")).to.not.undefined;

       });
       it("loads cached asset (OBJ)",async ()=>{
            const loader = new AssetLoader();
            localforage.config({
                name: "polytopia",
                version: 1,
                description: "Polytopia file storage",
                storeName: "polytopia"
            });
            localforage.clear();

            await loader.install("test_2.zip");

            await loader.load();

            expect(loader.assets.get("WATER_ZERO")).is.not.undefined;
            expect(loader.assets.get("WATER_ZERO")).is.instanceOf(Group);
        });
    });
    describe("#install/load",()=>{
        it("should cache then load assets",async ()=>{
            const loader = new AssetLoader();
            localforage.config({
                name: "polytopia",
                version: 3,
                description: "Polytopia file storage",
                storeName: "polytopia"
            });
            localforage.clear();

            await loader.install("/test_3.zip");

            await loader.load();

            expect(loader.assets.get("LAND")).is.not.undefined;
            expect(loader.assets.get("LAND")).to.have.haveOwnProperty("scene").is.instanceOf(Group);
            expect(loader.assets.get("WATER_ZERO")).is.not.undefined;
            expect(loader.assets.get("WATER_ZERO")).is.instanceOf(Group);
            expect(loader.assets.get("SELECOR")).is.not.undefined;

            expect(loader.assets.get("SELECOR")).to.have.haveOwnProperty("functions").exist;
        });
    });*/
});