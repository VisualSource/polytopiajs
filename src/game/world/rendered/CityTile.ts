import { Mesh } from "three";
import type { Position, UUID } from "../../core/types";

export default class CityTile extends Mesh {
    public isGameObject: boolean = true;
    constructor(public name: string, public tile_owner: UUID,  position: Position, geometry?: THREE.BufferGeometry | undefined, material?: THREE.Material | THREE.Material[] | undefined){
        super(geometry,material);
        this.position.set(position.row * 4, 0, position.col * 4);
    }
} 