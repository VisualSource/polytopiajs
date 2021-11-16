import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise';
import { terrain_props, biome, BORDER_EXPANSION } from './GenerationProps';
import random from 'random';

interface WorldTile {
    col: number;
    row: number;
    base: string;
    buldings: string[],
    tribe: string;
    metadata: {
        [name: string]: any
    }
}

export default class WorldGenerator {
    static gen(tribes: string[], worldsize: number = 11){
        //random.patch();
        //
        //
        // INIT START
        //
        //
        let map: WorldTile[][] = [];
        const sn = new SimplexNoise();

        const noise = (nx: number, ny: number) => {
            return sn.noise(nx,ny) / 2 + 0.5;
        }

        for(let col = 0 ; col < worldsize; col++){
            map.push([]);
            for(let row = 0; row < worldsize; row++){
                map[col][row] = {
                    col,
                    row,
                    base: biome(noise(
                        col / worldsize - 0.5, 
                        row / worldsize - 0.5
                    )),
                    metadata: {},
                    buldings: [],
                    tribe: "xin-xi"
                };
            }
        }

        //
        //
        // INIT END
        //
        //


        //
        //
        // Capital Generation setup START
        //
        //
        
        let capital_cells: any[] = [];
        let capital_map: { [cell: number]: number } = {};

        for (let _ of tribes){
            for(let row = 2; row < worldsize - 2; row++){
                for(let column = 2; column < worldsize - 2; column++) {
                    if(map[row][column]["base"] === "LAND") { 
                        capital_map[row * worldsize + column] = 0;
                    }
                }
            }
        }

        for(let _ of tribes) {
            let max = 0;
            for(let cell in capital_map) {
                capital_map[cell] = worldsize;
                for(let capital_cell of capital_cells) {
                    capital_map[cell] = Math.min(capital_map[cell],distance(cell as any,capital_cell,worldsize));
                }
                max = Math.max(max,capital_map[cell]);
            }
            let len = 0;
            for(let cell in capital_map){
                if(capital_map[cell] === max) {
                    len++;
                }
            }

            let rand_cell = random.int(0, len - 1);
            for(let cell of Object.entries(capital_map)){
                if(cell[1] === max) {
                    if(rand_cell === 0) {
                        capital_cells.push(parseInt(cell[0]));
                    }
                    rand_cell--;
                }
            }
        }
        for(let i = 0; i < capital_cells.length; i++) { 
            const row = (capital_cells[i] / worldsize | 0);
            const col = (capital_cells[i] % worldsize);
            map[row][col].base = "CAPITAL";
            map[row][col].tribe = tribes[i];
        }
        
        //
        //
        // Capital Generation setup END
        //
        //
        let done_tiles: any[] = [];
        let active_tiles: any[] = [];  // done tiles that generate terrain around them

        for(let i = 0; i < capital_cells.length; i++) {
            done_tiles[i] = capital_cells[i];
            active_tiles[i] = [capital_cells[i]];
        }
        
        // we'll start from capital tiles and evenly expand until the whole map is covered
        while(done_tiles.length !== worldsize**2) {
            for(let i = 0; i < tribes.length; i++) {
                if(active_tiles[i]?.length) {
                    let rand_number = random.int(0, active_tiles[i].length - 1);
                    let rand_cell = active_tiles[i][rand_number];
                    let neighbours = circle(rand_cell,1,worldsize);
                    let valid_neighbours = neighbours.filter(value => done_tiles.indexOf(value) === -1 && map[value / worldsize | 0][value % worldsize].base !== "WATER");
                    if(!valid_neighbours.length) {
                        valid_neighbours = neighbours.filter(value => done_tiles.indexOf(value) === -1);
                    } // if there are no land tiles around, accept water tiles
                    if(valid_neighbours.length) {
                        let new_rand_number = random.int(0,valid_neighbours.length - 1);
                        let new_rand_cell = valid_neighbours[new_rand_number];
                        map[(new_rand_cell / worldsize | 0)][(new_rand_cell % worldsize)].tribe = tribes[i];
                        active_tiles[i].push(new_rand_cell);
                        done_tiles.push(new_rand_cell);
                    } else {
                        active_tiles[i].splice(rand_number, 1); // deactivate tiles surrounded with done tiles
                    }
                }
            }       
        }

    
           // generate forest, mountains, and extra water according to terrain underneath
        for(let cell = 0; cell < worldsize**2; cell++) {
            if(map[(cell / worldsize | 0)][cell % worldsize]) {
                let rand = random.float(0,1);
                if(rand < (terrain_props.forest.default * (terrain_props.forest as any)[map[(cell / worldsize | 0)][cell % worldsize].tribe])){
                    map[(cell / worldsize | 0)][cell % worldsize].base = "FOREST";
                } else if (rand > (1 - terrain_props.mountain.default *  (terrain_props.mountain as any)[map[(cell / worldsize | 0)][cell % worldsize].tribe])) {
                    map[(cell / worldsize | 0)][cell % worldsize].base = "MOUNTAIN";
                }
                rand = random.float(0,1);
                if(rand < (terrain_props.water as any)[map[(cell / worldsize | 0)][cell % worldsize].tribe]){
                    map[(cell / worldsize | 0)][cell % worldsize].base = "OCEAN";
                }
            }
        }

        // -1 - water far away
        // 0 - far away
        // 1 - border expansion
        // 2 - initial territory
        // 3 - village
        let village_map: any[] = [];

        for(let cell = 0; cell < worldsize**2; cell++) {
            let row = cell / worldsize | 0;
            let column = cell % worldsize;
            if(map[row][column].base === "OCEAN" || map[row][column].base === "MOUNTAIN") {
                village_map[cell] = -1;
            } else if(row === 0 || row === (worldsize - 1) || column === 0 || column === (worldsize - 1) ) {
                village_map[cell] = -1;
            } else {
                village_map[cell] = 0;
            }
        }

        //skip 300-311

        let village_count = 0;
        for(let capital of capital_cells) {
            village_map[capital] = 3;
            for(let cell of circle(capital,1,worldsize)){
                village_map[cell] = Math.max(village_map[cell],2);
            }
            for(let cell of circle(capital,2,worldsize)) {
                village_map[cell] = Math.max(village_map[cell],1);
            }
        }

        while(village_map.indexOf(0) !== -1) {
            let new_village = random_element(village_map.map((cell,i)=> cell === 0 ? i : null).filter(cell=>cell !== null));
            village_map[new_village] = 3;

            for(let cell of circle(new_village,1,worldsize)){
                village_map[cell] = Math.max(village_map[cell],2);
            }
            for(let cell of circle(new_village,1,worldsize)){
                village_map[cell] = Math.max(village_map[cell],1);
            }
            village_count++;

        }

        const proc = (cell: number, probability: number) => {
            return (village_map[cell] === 2 && random.float() < probability) || (village_map[cell] === 1 && random.float() < probability * BORDER_EXPANSION);
        }

        for(let cell = 0; cell < worldsize**2; cell++){
            let row = cell / worldsize | 0;
            let column = cell % worldsize;
            switch(map[row][column].base){
                case "LAND":{
                    let fruit = terrain_props.fruit.default * (terrain_props.fruit as any)[map[row][column].tribe];
                    let crop = terrain_props.crop.default * (terrain_props.crop as any)[map[row][column].tribe];
                    if(village_map[cell] === 3){
                        map[row][column].buldings.push("VILLAGE");
                        map[row][column].base = "LAND";
                    } else if(proc(cell,fruit * (1 - crop / 2))) {
                        map[row][column].buldings.push("FRUIT");
                    } else if(proc(cell, crop * (1 - fruit / 2))) {
                        map[row][column].buldings.push("CROP");
                    }
                    break;
                }
                case "FOREST": {
                    if(village_map[cell] === 3) {
                        map[row][column].buldings.push("VILLAGE");
                        map[row][column].base = "LAND";
                    } else if(proc(cell,terrain_props.game.default * (terrain_props.game as any)[map[row][column].tribe])) {
                        map[row][column].buldings.push("GAME");
                    }
                    break;
                }
                case "WATER":{
                    if(proc(cell,terrain_props.fish.default * (terrain_props.fish as any)[map[row][column].tribe] )) {
                        map[row][column].buldings.push("FISH");
                    }
                    break;
                }
                case "OCEAN":{
                    if(proc(cell,terrain_props.whale.default * (terrain_props.whale as any)[map[row][column].tribe] )){
                        map[row][column].buldings.push("WHALE");
                    }
                    break;
                }
                case "MOUNTAIN":{
                    if(proc(cell,terrain_props.metal.default * (terrain_props.metal as any)[map[row][column].tribe] )) {
                        map[row][column].buldings.push("METAL");
                    } 
                    break;
                }
            }
        }

        let ruins_number = Math.round(worldsize**2/40);
        let water_ruins_number = Math.round(ruins_number/3);
        let ruins_count = 0;
        let water_ruins_count = 0;
        while(ruins_count < ruins_number) {
            let ruin = random_element(village_map.map((cell,i)=>cell === 0 || cell === 1 || cell === -1 ? i : null).filter(cell => cell !== null));

            let terrain = map[ruin / worldsize | 0][ruin % worldsize].base;
            if(terrain !== "WATER" && (water_ruins_count < water_ruins_number || terrain !== "OCEAN")) {
                map[ruin / worldsize | 0][ruin % worldsize].buldings.push("RUIN");
                if(terrain === "OCEAN") {
                    water_ruins_count ++;
                }
                for(let cell of circle(ruin, 1, worldsize)) {
                    village_map[cell] = Math.max(village_map[cell],2);
                }
                ruins_count++;
            }
        }


        const check_resources = (resource: string, capital: number) => {
            let resources = 0;
            for(let neighbour of circle(capital,1,worldsize)) {
                if(map[neighbour / worldsize | 0][neighbour % worldsize].buldings.includes(resource)) {
                    resources++;
                }
            }
            return resources;
        }

        const post_generate = (resource: string, base: string, quantity: number, capital: number) => {
            let resources = check_resources(resource,capital);
            while(resources < quantity) {
                let pos = random.int(0,8);
                let territory = circle(capital,1,worldsize);
                let row = territory[pos] / worldsize | 0;
                let column = territory[pos] % worldsize;
                map[row][column].base = base;
                map[row][column].buldings = [resource];
                for(let neighbour of plus_sign(territory[pos],worldsize)) {
                    if(map[neighbour / worldsize | 0][neighbour % worldsize].base === "OCEAN") {
                        map[neighbour / worldsize | 0][neighbour % worldsize].base = "WATER";
                    }
                }
                resources = check_resources(resource,capital);
            }
        }

        for(let capital of capital_cells){
            switch(map[capital / worldsize | 0][capital % worldsize].tribe){
                case "imperius": {
                    post_generate("FRUIT","LAND",2,capital);
                    break;
                }
                case "bardur": {
                    post_generate("GAME","FOREST",2,capital);
                    break;
                }
                case "kickoo": {
                    break;
                }
                case "zebasi": {
                    break;
                }

            }
        }


        const RIGHT = 0;
        const UP = Math.PI / 2; //1.57...
        const LEFT = Math.PI; 
        const DOWN = (3 * Math.PI) / 2; // 4.71...n
        for (let cell = 0; cell < worldsize**2; cell++) {
            let row = cell /worldsize | 0;
            let column = cell % worldsize;
            const tileId = map[row][column].base;
            if(tileId === "WATER" || tileId === "OCEAN"){
                let sides = 4;
                let dir = RIGHT;
                const up = map[row - 1] && map[row - 1][column]?.base === tileId;
                const down = map[row + 1] && map[row + 1][column]?.base === tileId;
                const left = map[row][column - 1]?.base === tileId;
                const right = map[row][column + 1]?.base === tileId;

                if(up) sides--;
                if(down) sides--;
                if(left) sides--;
                if(right) sides--;
            
                if(sides === 1){
                    if(up && down && right){
                        dir = DOWN;
                    }else if(up && right && left){
                        dir = RIGHT;
                    }else if(down && right && left){
                        dir = LEFT;
                    }else if(up&& down && left){
                        dir = UP;
                    }
                }else if(sides === 2){
                    if(left && right){
                        sides = 5;
                        dir = LEFT; // GOOD
                    }else if(up && down){
                        sides = 5;
                        dir = UP; // GOODnn
                    }else if(left && up){
                        dir = UP;
                    }else if(left && down){
                        dir = LEFT;
                    } else if(down && right){
                        dir = DOWN;
                    }
                }else if(sides === 3){
                    if(down){
                        dir = LEFT;
                    }else if(up){
                        dir = RIGHT;
                    }else if(left){
                        dir = UP;
                    }else if(right){
                        dir = DOWN;
                    }
                }
                
                map[row][column].metadata = {
                    model_id: sides,
                    rotation: dir
                };
            }
        }


        return map;
    }
}

function random_element(array: Array<any>): any {
    let int = random.int(0, array.length - 1);
    return array[int];
}

function distance(a: number, b: number, size: number) {
    let ax = a % size;
    let ay = a / size | 0;
    let bx = b % size;
    let by = b / size | 0;
    return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}

function circle(center: number, radius: number, map_size: number) {
    let circle = [];
    let row = center / map_size | 0;
    let column = center % map_size;
    let i = row - radius;
    if (i >= 0 && i < map_size) {
        for (let j = column - radius; j < column + radius; j++) {
            if (j >= 0 && j < map_size) {
                circle.push(i * map_size + j)
            }
        }
    }
    i = row + radius;
    if (i >= 0 && i < map_size) {
        for (let j = column + radius; j > column - radius; j--) {
            if (j >= 0 && j < map_size) {
                circle.push(i * map_size + j)
            }
        }
    }
    let j = column - radius;
    if (j >= 0 && j < map_size) {
        for (let i = row + radius; i > row - radius; i--) {
            if (i >= 0 && i < map_size) {
                circle.push(i * map_size + j)
            }
        }
    }
    j = column + radius;
    if (j >= 0 && j < map_size) {
        for (let i = row - radius; i < row + radius; i++) {
            if (i >= 0 && i < map_size) {
                circle.push(i * map_size + j)
            }
        }
    }
    return circle;
}

function plus_sign(center: number, map_size: number) {
    let plus_sign = [];
    let row = center / map_size | 0;
    let column = center % map_size;
    if(column > 0) {
        plus_sign.push(center - 1);
    }
    if(column < map_size - 1) {
        plus_sign.push(center + 1);
    }
    if(row > 0) {
        plus_sign.push(center - map_size);
    }
    if(row < map_size - 1) {
        plus_sign.push(center + map_size);
    }
    return plus_sign;
}