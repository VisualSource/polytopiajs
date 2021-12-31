import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { readdir, writeFile, unlink } from 'fs/promises';
import { spawn } from 'child_process';
import resizer from 'node-image-resizer';
import sizeOf from 'image-size';
import canvas from "canvas";
import mergeImages from 'merge-images';
// 1. resize images
// 2. combine and json create
// 3. compress to webp
const { Canvas, Image } = canvas;
const __dirname = dirname(fileURLToPath(import.meta.url));

const width = 214;
const height = 250;

const tempPath = join(__dirname,"../assets/images/temp");
const rawPath = join(__dirname,"../assets/images/raw");
const complied = join(__dirname,"../assets/images/compiled/");
const outputPath = join(__dirname,"../src/ui/data");
const timer = ms => new Promise( res => setTimeout(res, ms));

const resize_imgs = async () => {
    try {
        console.log("Resize | Staring resize");

        const files = await readdir(rawPath);

        for(let i = 0; i < files.length; i++){
            await resizer(join(rawPath,files[i]),{ 
                all: { 
                    path: complied, 
                    quality: 75
                },
                versions: [{
                    width,
                    height
                }] 
            });
            console.log("Resize |", `Name: ${files[i]}, File: ${i+1}/${files.length}`);
        }

        console.log("Resize | Finished");
    } catch (error) {
        console.error("Resize |", error.message);
    }
}

const package_to_json = async () => {
    try{
        console.log("Generation | Start");

        const images_raw = await readdir(complied, {withFileTypes: true, encoding: "utf-8" });
        let images_json = {};
        let src_images = [];
        for(const img of images_raw){
            if(!img.isFile() || !img.name.endsWith(".png")) continue;

            src_images.push({ src: join(complied,img.name), x: 0, y: 0  });
            let dim = sizeOf(join(complied,img.name));
            let name = img.name.replace(".png","");
            images_json[name] = {
                frame: {
                    x: 0,
                    y: 0,
                    w: dim.width,
                    h: dim.height
                }
            };
        }


        let curlX = 0;
        let curlY = 0;
        let heightHeight = 0;
        let i = 0;
        for(const key of Object.keys(images_json)) {
            if(curlX + images_json[key].frame.w > 1926 /* 9 images pre row */) {
                curlX = 0;
                curlY += heightHeight;
                heightHeight = images_json[key].frame.h;
            }

            images_json[key].frame.x = curlX;
            images_json[key].frame.y = curlY;
            src_images[i].x = curlX;
            src_images[i].y = curlY;

            curlX += images_json[key].frame.w;

            i++;
        }

        const spritesheet_uri = await mergeImages(src_images,{
            Canvas,
            Image,
            format: "image/png",
            height: curlY,
            width: curlX
        });

        const img_raw = spritesheet_uri.split(";base64,").pop();
        console.log("Generation | Writen Spritesheet.png");
        await writeFile(join(tempPath,"spritesheet.png"),img_raw,{encoding: "base64" });
        console.log("Generation | Write tiles.json");
        await writeFile(join(outputPath,"tiles.json"), JSON.stringify({ frames: images_json }));
        console.log("Generation | Finished");
    }catch(error) {
        console.error("Generation |",error.message);
    }
}

const compress = async () => {

    try {
        const cwebp = spawn("cwebp", [join(tempPath,"spritesheet.png"), "-o", join(outputPath,"tiles.webp")] );

        await new Promise((ok,err)=>{
            cwebp.stdout.on("data",(data)=>{
                console.log("Compress |",data.toString());
            });
            cwebp.stderr.on("data",(data)=>{
                console.error("Compress |", data.toString());
            });
            cwebp.on("exit",(code)=>{
                if(code !== 0){
                    err(code);
                    return;
                }
                console.log("Compress | Finished");
                ok(code);
            });
        });
    } catch (error) {
        console.error("Compress |", error.message);
    }
    
}

const clean_up = async () => {
    console.log("Clean up | Starting");
    try {
        const files = await readdir(complied);
        for(const file of files){
            try {
                await unlink(join(complied,file));
            } catch (error) {
                console.error("Clean up |",error.message);
            }
        }
        const tempFiles = await readdir(tempPath);

        for(const temp of tempFiles) {
            try {
                await unlink(join(tempPath,temp));
            } catch (error) {
                console.error("Clean up |",error.message);
            }
        }
    } catch (error) {
        console.error("Clean up", error.message);
    }

    console.log("Clean up | Done");
}

async function main(){
    await resize_imgs();
    await timer(500);
    await package_to_json();
    await timer(500);
    await compress(); 
    await timer(500);
    await clean_up();
}
main();

