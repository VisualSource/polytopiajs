import { SpriteRenderer } from 'three-nebula';
import { BoxGeometry, Mesh, MeshLambertMaterial } from 'three';
import type Game from '../core/Game';

export default class ParticalManager {
    private _instances = [];
    constructor(private game: Game) {

    }
    createInstance(partical: string): void {
        const data = this.game.assets.getPartical(partical);
        if(!data) throw new Error("Invaild partical name");

    
    }
}