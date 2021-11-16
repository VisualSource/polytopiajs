export const BORDER_EXPANSION = 1 / 3; 

const terrainProp = (d: number, x: number, i: number, b: number, o: number) => {
    return {
        default: d,
        "xin-xi": x,
        imperius: i,
        bardur: b,
        oumaji: o
    }
}
export const terrain_props = {
    "ocean": terrainProp(0.7,0,0,0,0),
    "water": terrainProp(0.45,0,0,0,0),
    "forest": terrainProp(0.4,1,1,1,0.1),
    "mountain": terrainProp(0.15,2,1,1,1),
    "metal": terrainProp(0.5,1,1,1,1),
    "fruit": terrainProp(0.5,1,1,1.5,1),
    "crop": terrainProp(0.5,1,1,0.1,1),
    "game": terrainProp(0.5,1,1,2,1),
    "fish": terrainProp(0.5,1,1,1,1),
    "whale": terrainProp(0.4,1,1,1,1),
}

export const biome = (prop: number) => {
    if(prop <= terrain_props.water.default) return "WATER";
    if(prop < terrain_props.ocean.default) return "OCEAN";
    return "LAND";

}
