import { Mesh } from "three";

export default class CityTile extends Mesh {
    constructor(geometry?: THREE.BufferGeometry | undefined, material?: THREE.Material | THREE.Material[] | undefined){
        super(geometry,material);
    }
} 