import SimplexNoise from 'simplex-noise';
import {MersenneTwister19937, pick, bool} from 'random-js';
import {Group} from 'three';
import {scene} from '../main';
import {Water, Ocean, Field, Village, Mountain, City, Forest} from '../objects/dynamicBlocks';
import {probs} from '../../assets/config.json';
import {LocalStorageLoader} from '../../utils/Loaders';
//import {route} from '../../utils/history';
interface WorldGenerationOptions{
    worldSize: number
    players: Polytopia.IPlayerObject[]
}
interface Map{
    type: "WATER" | "FIELD" | "OCEAN" | "CITY" | "FOREST" | "MOUNTAIN" | 'VILLAGE';
    variation: number;
    rotation: number;
    position: Polytopia.Objects.ICord;
    faction: Polytopia.IFaction;
    metal?: boolean;
    fruit?: boolean;
    crop?: boolean;
    wild_animal?: boolean;
    fish?: boolean;
    whale?: boolean;
    ruin?: boolean;
}
export default class WorldGenerationV5{
    private noise: SimplexNoise = new SimplexNoise();
    private mt: MersenneTwister19937 = MersenneTwister19937.autoSeed();
    protected settings: WorldGenerationOptions;
    private deg: {90: number,180: number,270: number} = {90: (Math.PI/2),180: (Math.PI),270: ((3*Math.PI)/2)}
    constructor(settings: WorldGenerationOptions){
        this.settings = settings;
    }

    public createDevWorld(name: string = "overworld", visible: boolean = true): void{
        const {worldSize} = this.settings; 
        const world = new Group();
        world.name = name;
        world.visible = visible;
        let row = 0, colum = 0;
        for(let i = 0; i < worldSize; i++){
            for(let b = 0; b < worldSize; b++){
                world.add(new Water({position:{x: row, z: colum, y: 0}})); // x = row, z = colum
                row += 2;
            }
            if(row > worldSize){
                colum +=2;
                row = 0;
            }
        }
        scene.add(world);
    }
    public createDefaultWorld(){
        let row = 0, 
            colum = 0, 
            map: Map[] = [], 
            capital_cells: any[] = [], 
            capital_map: {[name: number]: number} = {}, 
            done_tiles: any[] = [], 
            active_tiles = [];
        const {worldSize, players} = this.settings, 
              world = new Group(), 
              waterCheck: any[] = [];
        world.name = "overworld";
        const baseMap = this.createBaseMap(worldSize, this.blockPlacement);
        const BORDER_EXPANSION = 1/3;
       
        for(let a = 0; a <= baseMap.length-1; a++){
            waterCheck.push([]);
            for(let b = 0; b <= baseMap[a].length-1; b++){
                switch (baseMap[a][b]) {
                    case "WATER": {
                        let sides = 0, other = [] , rotation = 0;
                        baseMap[a][b+1] === "WATER" ? sides++ : sides+=0;
                        baseMap[a][b-1] === "WATER" ? sides++ : sides+=0;
                        baseMap[a+1] === undefined ? sides+=0 :  baseMap[a+1][b] === "WATER" ? sides++ : sides+=0;
                        baseMap[a-1] === undefined ? sides+=0 :  baseMap[a-1][b] === "WATER" ? sides++ : sides+=0;
                        if(sides === 2){
                            baseMap[a][b+1] === "WATER" &&  baseMap[a][b-1] === "WATER" ? sides = 5: sides+=0;
                          if(  baseMap[a+1] !== undefined &&  baseMap[a-1] !== undefined){
                            baseMap[a+1][b] === "WATER" &&  baseMap[a-1][b] === "WATER" ? sides = 5: sides+=0;
                          } 
                          
                        }
                            //front
                            baseMap[a][b+1] === "WATER" ? other.push(true) : other.push(false);
                            //back
                            baseMap[a][b-1] === "WATER" ? other.push(true) : other.push(false);
                            //right
                            baseMap[a+1] === undefined ? other.push(false) : baseMap[a+1][b] === "WATER" ? other.push(true) : other.push(false);
                            //left
                            baseMap[a-1] === undefined ? other.push(false) : baseMap[a-1][b] === "WATER" ? other.push(true) : other.push(false);
                            if(sides===1){
                                if(other[0]===true && other[1]===false && other[2]===false && other[3]===false){
                                    rotation = this.deg[90]; // 90 deg = PI/2
                                }else if(other[0]===false && other[1]===false && other[2]===true && other[3]===false){
                                    rotation = 0; // 0 deg = 0;
                                }else if(other[0]===false && other[1]===true && other[2]===false && other[3]===false){
                                    rotation = this.deg[270]; // 270 deg = (3PI/2)
                                }else{
                                    rotation = this.deg[180];// 180 deg = PI
                                }
                            }
                            if(sides===2){
                                if(other[0]===false && other[1]===true && other[2]===false && other[3]===true){
                                    rotation = 0;
                                }else if(other[0]===true && other[1]===false && other[2]===false && other[3]===true){
                                    rotation = this.deg[270];
                                }else if(other[0]===true && other[1]===false && other[2]===true && other[3]===false){
                                    rotation = this.deg[180];
                                }else{
                                    rotation = this.deg[90];
                                }
                            }
                            if(sides===3){
                                if(other[0]===true && other[1]===false && other[2]===true && other[3]===true){
                                    rotation = this.deg[90];
                                }else if(other[0]===true && other[1]===true && other[2]===true && other[3]===false){
                                    rotation = 0;
                                }else if(other[0]===false && other[1]===true && other[2]===true && other[3]===true){
                                    rotation = this.deg[270];
                                }else{
                                    rotation = this.deg[180];
                                }
                            }
                            if(sides===5){
                                if(other[0]===true && other[1]===true && other[2]===false && other[3]===false){
                                    rotation = 0;
                                }else{
                                    rotation = this.deg[90];
                                }
                            }

                            waterCheck[a].push({type: baseMap[a][b], variation: sides, rotation, position:{x:row,z:colum,y:0}, faction: null});
                        break;
                    }
                    case "OCEAN":{
                            let sides = 0, other = [], rotation = 0;
                            baseMap[a][b+1] === "OCEAN" ? sides++ : sides+=0;
                            baseMap[a][b-1] === "OCEAN" ? sides++ : sides+=0;
                            baseMap[a+1] === undefined ? sides+=0 : baseMap[a+1][b] === "OCEAN" ? sides++ : sides+=0;
                            baseMap[a-1] === undefined ? sides+=0 : baseMap[a-1][b] === "OCEAN" ? sides++ : sides+=0;
                            if(sides === 2){
                                baseMap[a][b+1] === "OCEAN" && baseMap[a][b-1] === "OCEAN" ? sides = 5: sides+=0;
                              if( baseMap[a+1] !== undefined && baseMap[a-1] !== undefined){
                                baseMap[a+1][b] === "OCEAN" && baseMap[a-1][b] === "OCEAN" ? sides = 5: sides+=0;
                              } 
                              
                            }
                            if((sides > 0 && sides < 4) || sides === 5 ){
                                //front
                                baseMap[a][b+1] === "OCEAN" ? other.push(true) : other.push(false);
                                //back
                                baseMap[a][b-1] === "OCEAN" ? other.push(true) : other.push(false);
                                //right
                                baseMap[a+1] === undefined ? other.push(false) : baseMap[a+1][b] === "OCEAN" ? other.push(true) : other.push(false);
                                //left
                                baseMap[a-1] === undefined ? other.push(false) : baseMap[a-1][b] === "OCEAN" ? other.push(true) : other.push(false);
    
                                if(sides===1){
                                    if(other[0]===true && other[1]===false && other[2]===false && other[3]===false){
                                        rotation = this.deg[270];
                                    }else if(other[0]===false && other[1]===false && other[2]===true && other[3]===false){
                                        rotation = this.deg[180];
                                    }else if(other[0]===false && other[1]===true && other[2]===false && other[3]===false){
                                        rotation = this.deg[90];
                                    }else{
                                        rotation = 0;
                                    }
                                }
                                if(sides===2){
                                    if(other[0]===false && other[1]===true && other[2]===false && other[3]===true){
                                        rotation = 0;
                                    }else if(other[0]===true && other[1]===false && other[2]===false && other[3]===true){
                                        rotation = this.deg[270];
                                    }else if(other[0]===true && other[1]===false && other[2]===true && other[3]===false){
                                        rotation = this.deg[180];
                                    }else{
                                        rotation = this.deg[90];
                                    }
                                }
                                if(sides===3){
                                    if(other[0]===true && other[1]===false && other[2]===true && other[3]===true){
                                        rotation = this.deg[90];
                                    }else if(other[0]===true && other[1]===true && other[2]===true && other[3]===false){
                                        rotation = 0;
                                    }else if(other[0]===false && other[1]===true && other[2]===true && other[3]===true){
                                        rotation = this.deg[270];
                                    }else{
                                        rotation = this.deg[180];
                                    }
                                }
                                if(sides===5){
                                    if(other[0]===true && other[1]===true && other[2]===false && other[3]===false){
                                        rotation = this.deg[90];
                                    }else{
                                        rotation = 0;
                                    }
                                }
                            }
                            waterCheck[a].push({type: baseMap[a][b], variation: sides, rotation, position:{x:row,z:colum,y:0}, faction: null});
                        break;
                    }
                    default:
                        waterCheck[a].push({type: baseMap[a][b], variation: 0, rotation: 0, position:{x:row,z:colum,y:0}, faction: null});
                        break;
                }
                row +=2;
            }
            if(row > worldSize){
                colum +=2;
                row = 0;
            }
        }
        waterCheck.forEach(value=>{
            value.forEach((type: any)=>{
                map.push(type);
            });
        });
        
        console.time('Capital distribution');
        // make a map of potential (ground) tiles associated with numbers (0 by default)
        for (let _ of players) {
            for (let row = 2; row < worldSize - 2; row++) {
                for (let column = 2; column < worldSize - 2; column++) {
                    if (map[row * worldSize + column]['type'] === 'FIELD') {
                        capital_map[row * worldSize + column] = 0;
                    }
                }
            }
        }
        for (let _ of players) {
            let max = 0;
            // this number is a sum of distances between the tile and all capitals
            for (let cell in capital_map) {
                capital_map[cell] = worldSize;
                for (let capital_cell of capital_cells) {
                    capital_map[cell] = Math.min(capital_map[cell], this.distance(cell, capital_cell, worldSize));
                }
                max = Math.max(max, capital_map[cell]);
            }
            let len = 0;
            for (let cell in capital_map) { if (capital_map[cell] === max)len++; }
            // we want to find a tile with a maximum sum
            let rand_cell = this.random_int(0, len);
            for (let cell of Object.entries(capital_map)) {
                if (cell[1] === max) {
                    if (rand_cell === 0) capital_cells.push(parseInt(cell[0]));
                    rand_cell--;
                }
            }
        }
        for (let i = 0; i < capital_cells.length; i++) {
            map[(capital_cells[i] / worldSize | 0) * worldSize + (capital_cells[i] % worldSize)]['type'] = 'CITY';
            map[(capital_cells[i] / worldSize | 0) * worldSize + (capital_cells[i] % worldSize)]['faction'] = players[i].faction;
        }
        console.timeEnd('Capital distribution');
        
        console.time('Terrain distribution');
        // done tiles that generate terrain around them
        for (let i = 0; i < capital_cells.length; i++) {
            done_tiles[i] = capital_cells[i];
            active_tiles[i] = [capital_cells[i]];
        }
         // we'll start from capital tiles and evenly expand until the whole map is covered
        while (done_tiles.length !== worldSize**2) {
            for (let i = 0; i < players.length; i++) {
                if (active_tiles[i].length && players[i].faction !== 'Polaris') {
                    let rand_number = this.random_int(0, active_tiles[i].length);
                    let rand_cell = active_tiles[i][rand_number];
                    let neighbours = this.circle(rand_cell, 1);
                    let valid_neighbours = neighbours.filter(value => done_tiles.indexOf(value) === -1 && map[value]['type'] !== 'WATER' && map[value]['type'] !== 'OCEAN');
                    if (!valid_neighbours.length) {
                        valid_neighbours = neighbours.filter(value => done_tiles.indexOf(value) === -1);
                    } // if there are no land tiles around, accept water tiles
                    if (valid_neighbours.length) {
                        let new_rand_number = this.random_int(0, valid_neighbours.length);
                        let new_rand_cell = valid_neighbours[new_rand_number];
                        map[new_rand_cell]['faction'] = players[i].faction;
                        active_tiles[i].push(new_rand_cell);
                        done_tiles.push(new_rand_cell);
                    } else {
                        active_tiles[i].splice(rand_number, 1); // deactivate tiles surrounded with done tiles
                    }
                }
            }
        }
        console.timeEnd('Terrain distribution');
        
        console.time('Resource generation');
        map.forEach((value,i)=>{
            if(!["WATER","CITY","OCEAN"].includes(value.type)){
                const forest = bool(probs.general.forest * probs.faction.forest[value.faction === null ? "Imperius" : value.faction])(this.mt);
                const mountain = bool(probs.general.mountain * probs.faction.mountain[value.faction === null ? "Imperius" : value.faction])(this.mt);
                if(forest)map[i].type = "FOREST";
                if(!forest && mountain) map[i].type = "MOUNTAIN";
            }
        });
        console.timeEnd('Resource generation');
        console.time('Initial village map');
        let village_map: any[] = [];
        for (let cell = 0; cell < worldSize**2; cell++) {
            let row = cell / worldSize | 0;
            let column = cell % worldSize;
            if (["OCEAN", "WATER"].includes(map[cell]['type'])) { // MOUNTAIN 
                village_map[cell] = -1;
            } else if (row === 0 || row === worldSize - 1 || column === 0 || column === worldSize - 1) {
                village_map[cell] = -1; // villages don't spawn next to the map border
            } else {
                village_map[cell] = 0;
            }
        }
        console.timeEnd('Initial village map');
        console.time('Village map generation');
        let village_count = 0;
        for (let capital of capital_cells) {
            village_map[capital] = 3;
            for (let cell of this.circle(capital, 1)) {
                village_map[cell] = Math.max(village_map[cell], 2);
            }
            for (let cell of this.circle(capital, 2)) {
                village_map[cell] = Math.max(village_map[cell], 1);
            }
        }

        // generate villages & mark tiles next to them
        while (village_map.indexOf(0) !== -1) {
            let new_village: any = pick(this.mt,village_map.map((cell, index) => cell === 0 ? index : null).filter(cell => cell !== null));
            village_map[new_village] = 3;
            for (let cell of this.circle(new_village, 1)) {
                village_map[cell] = Math.max(village_map[cell], 2);
            }
            for (let cell of this.circle(new_village, 2)) {
                village_map[cell] = Math.max(village_map[cell], 1);
            }
            village_count++;
        }
        console.timeEnd('Village map generation');
        const proc = (cell:number, probability: number): boolean=> {
            return (village_map[cell] === 2 && Math.random() < probability) || (village_map[cell] === 1 && Math.random() < probability * BORDER_EXPANSION)
        }
        console.time('Resource generation');
        for (let cell = 0; cell < worldSize**2; cell++) {
            switch (map[cell]['type']) {
                case 'FIELD':
                    //@ts-ignore
                    let fruit = probs.general['fruit'] * probs.faction.fruit[map[cell].faction === null ? "Imperius" : map[cell].faction];
                    //@ts-ignore
                    let crop = probs.general['crop'] * probs.faction.crop[map[cell].faction === null ? "Imperius" : map[cell].faction];
                    if (map[cell].type !== 'CITY') {
                        if (village_map[cell] === 3) {
                            map[cell].type = 'VILLAGE';
                        } else if (proc(cell, fruit * (1 - crop / 2))) {
                            map[cell].fruit = true;
                        } else if (proc(cell, crop * (1 - fruit / 2))) {
                            map[cell].crop = true;
                        }
                    }
                    break;
                case "FOREST":
                    if (map[cell].type !== 'CITY') {
                        if (village_map[cell] === 3) {
                            map[cell].type = "VILLAGE";
                        //@ts-ignore
                        } else if (proc(cell, probs.general['game'] * probs.faction.game[map[cell].faction === null ? "Imperius" : map[cell].faction])) {
                            map[cell].wild_animal = true;
                        }
                    }
                    break;
                case "WATER":
                    //@ts-ignore
                    if (proc(cell, probs.general['fish'] * probs.faction.fish[map[cell].faction === null ? "Imperius" : map[cell].faction])) {
                        map[cell].fish = true;
                    }
                    break;
                case "OCEAN":
                    //@ts-ignore
                    if (proc(cell, probs.general['whale'] * probs.faction.whale[map[cell].faction === null ? "Imperius" : map[cell].faction])) {
                        map[cell].whale = true;
                    }
                    break;
                case "MOUNTAIN":
                    //@ts-ignore
                    if (proc(cell, probs.general['metal'] * probs.faction.metal[map[cell].faction === null ? "Imperius" : map[cell].faction])) {
                        map[cell].metal = true;
                    }
                    break;
            }
        }
        console.timeEnd('Resource generation');
        console.time('Ruin generation');
        let ruins_number;
        ruins_number = Math.round(worldSize**2/40);
        let water_ruins_number = Math.round(ruins_number/3);
        let ruins_count = 0;
        let water_ruins_count = 0;
        while (ruins_count < ruins_number) {
            let ruin = pick(this.mt,village_map.map((cell, index) => cell === 0 || cell === 1 || cell === -1 ? index : null).filter(cell => cell !== null));
            let terrain = map[ruin as number].type;
            if (terrain !== 'WATER' && (water_ruins_count < water_ruins_number || terrain !== 'OCEAN')) {
                map[ruin as number].ruin = true; // actually there can be both ruin and resource on a single tile but only ruin is displayed; as it is just a map generator it doesn't matter
                if (terrain === "OCEAN") {
                    water_ruins_count++;
                }
                for (let cell of this.circle(ruin, 1)) {
                    village_map[cell] = Math.max(village_map[cell], 2); // we won't use this array anymore anyway
                }
                ruins_count++;
            }
        }
        console.timeEnd('Ruin generation');
        const check_resources = (resource: string, capital: number): number => {
            let resources = 0;
            for (let neighbour of this.circle(capital, 1)) {
                //@ts-ignore
                if (map[neighbour][resource]) {
                    resources++;
                }
            }
            return resources;
        }
        const post_generate = (resource: string, quantity: number, capital: number) => {
            let resources = check_resources(resource, capital);
            while (resources < quantity) {
                let pos = this.random_int(0, 8);
                let territory = this.circle(capital, 1);
               // map[territory[pos]]['type'] = underneath;
                //@ts-ignore
                map[territory[pos]][resource] = true;
                resources = check_resources(resource, capital);
            }
        }
        console.time('Tribe specific');
        for (let capital of capital_cells) {
            switch (map[capital]['faction']) {
                case 'Imperius':
                    post_generate('fruit', 2, capital);
                    break;
                case 'Bardur':
                    post_generate('wild_animal', 2, capital);
                    break;
            }
        }
        console.timeEnd('Tribe specific');
        map.forEach((object: Map)=>{
            switch(object.type){
                case "WATER":
                        world.add(new Water({
                            position: object.position,
                            faction: object.faction,
                            rotation: object.rotation,
                            variation: object.variation,
                            fish: object.fish,
                            ruin: object.ruin
                        }));
                    break;
                case "OCEAN":
                        world.add(new Ocean({
                            position: object.position,
                            rotation: object.rotation,
                            variation: object.variation,
                            faction: object.faction,
                            whale: object.whale,
                            ruin: object.ruin
                        }));
                    break;
                case "FIELD":
                        world.add(new Field({
                            position: object.position,
                            faction: object.faction,
                            ruin: object.ruin,
                            crop: object.crop,
                            fruit: object.fruit
                        }));   
                    break;
                case "CITY":
                        world.add(new City({
                            position: object.position,
                            faction: object.faction,
                            capital: true
                        }));
                    break;
                case "FOREST":
                        world.add(new Forest({
                            position: object.position,
                            faction: object.faction,
                            wild_animal: object.wild_animal,
                            ruin: object.ruin
                        }));
                    break;
                case "MOUNTAIN":
                    world.add(new Mountain({
                        position: object.position,
                        faction: object.faction,
                        ruin: object.ruin,
                        metal: object.metal
                    }));
                    break;
                case "VILLAGE":
                    world.add(new Village({
                        position: object.position,
                        faction: object.faction
                    }));
                    break;
                default:
                    throw Error("Unknown block type"); 
            }
    });
    scene.add(world);
    
    }


    protected createBaseMap(size: number, type:Function): string[][]{
        const placement: string[][] = [];
        let value = [];
        // create map noise
        for (let y = 0; y < size; y++) {
            value[y] = [];
            for (let x = 0; x < size; x++) {
              let nx = x/size - 0.5, 
                  ny = y/size - 0.5;
               (value[y] as any)[x] = this.noise.noise2D(nx, ny)/ 2 + 0.5;
            }
        }
        //change noise into a type array
        for(let y = 0; y <= value.length-1; y++){
               placement.push([]);
               for(let x = 0; x <= value[y].length-1; x++){
                placement[y].push(type(value[y][x]));      
               }   
        }
        return placement;
    }
    protected blockPlacement(int: number): "OCEAN" | "WATER"| "FIELD"{
        if(int <= 0.25){
            return "OCEAN";
        }else if(int < 0.45 && int > 0.25){
            return "WATER";
        }else{
            return "FIELD";
        }
    }
    protected circle(center: any, radius: number){
            const {worldSize} = this.settings;
            let circle = [], 
                row = center / worldSize | 0,
                column = center % worldSize, 
                i = row - radius;
            if (i >= 0 && i < worldSize) {
                for (let j = column - radius; j < column + radius; j++) {
                    if (j >= 0 && j < worldSize) {
                        circle.push(i * worldSize + j)
                    }
                }
            }
            i = row + radius;
            if (i >= 0 && i < worldSize) {
                for (let j = column + radius; j > column - radius; j--) {
                    if (j >= 0 && j < worldSize) {
                        circle.push(i * worldSize + j)
                    }
                }
            }
            let j = column - radius;
            if (j >= 0 && j < worldSize) {
                for (let i = row + radius; i > row - radius; i--) {
                    if (i >= 0 && i < worldSize) {
                        circle.push(i * worldSize + j)
                    }
                }
            }
            j = column + radius;
            if (j >= 0 && j < worldSize) {
                for (let i = row - radius; i < row + radius; i++) {
                    if (i >= 0 && i < worldSize) {
                        circle.push(i * worldSize + j)
                    }
                }
            }
        return circle;
    }
    protected distance(a: any, b: number, size: number): number{
        let ax = a % size;
        let ay = a / size | 0;
        let bx = b % size;
        let by = b / size | 0;
        return Math.max(Math.abs(ax - bx),Math.abs(ay - by));
    }
    protected random_int(min: number, max: number): number{
        // integer(1,5)(nativeMath)
        let rand = min + Math.random() * (max - min);
        return Math.floor(rand);
    }
}



export class WorldLoader extends LocalStorageLoader{
    parse(map: any){

    }
    saveLocal(id: string = "sp"){
        const map = {};
        this.write(id, map);
    }
    async saveOnline(host: boolean, id: string){
        if(host){
            try {
                fetch(`${window.location.origin}/map/${id}`,{
                    method: "POST",
                    headers:{},
                    body: ""
                });
            } catch (error) {console.error(error);}
        }
    }
    loadLocal(id: string = "sp"): void{
        const map = this.read(id);
        this.parse(map);
    }
    async loadOnline(id: Polytopia.UUID){
        const mapjson = await fetch(`${window.location.origin}/map/${id}`,{
            method: "GET",
            headers: {}
        }).then(e=>e.json());
        await this.parse(mapjson);
        //route("/game");
    }
    async newOnline(){}
}

// new local singleplayer  <=
// load local singleplayer <=
// new local mp 
// load local mp 
// new online mp 
// load online mp 