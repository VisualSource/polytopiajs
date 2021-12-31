import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { spawn } from 'child_process';
// 1. resize images
// 2. combine and json create
// 3. compress to webp

const __dirname = dirname(fileURLToPath(import.meta.url));

const width = 214;
const height = 250;

const tempPath = join(__dirname,"../assets/images/temp");
const rawPath = join(__dirname,"../assets/images/raw");
const complied = join(__dirname,"../assets/images/compiled");
const outputPath = join(__dirname,"../src/ui/data");
//https://github.com/mohasarc/spritesheet-factory/blob/main/package.json
//https://www.npmjs.com/package/imgsharp
//https://nodejs.org/api/child_process.html
const resize_imgs = async () => {
    const imgsharp = spawn("npx",["imgsharp","-o",complied,"-i",rawPath,"-w",width,"-hi",height,"-r","true","-ra","true","-p","true"]);

    return new Promise((ok,err)=>{
        imgsharp.stdout.on("data",(data)=>{
            console.log("Resize |",data.toString());
        });
        imgsharp.stderr.on("data",(data)=>{
            console.error("Resize |", data.toString());
        });
        imgsharp.on("exit",(code)=>{
            if(code !== 0) {
                err(code);
                return;
            }
            ok(code);
        });
    });

}

