import type { Position, UUID } from '../../core/types';
import CityTile from '../rendered/CityTile';
import BaseScene from './BaseScene';

export default class TileScene extends BaseScene {
    public name: string = "TileScene"; 
    private tiles: Map<UUID,Position> = new Map();
    public createCityInstance(
        key: string, 
        position: Position, 
        tile_owner: UUID, 
        geometry: THREE.BufferGeometry | undefined = undefined, 
        material: THREE.Material | THREE.Material[] | undefined = undefined): CityTile {
        const city = new CityTile(key,tile_owner,position,geometry,material);
        this.getLevel().add(city);
        return city;
    }
    public insertTile(uuid: UUID, pos: Position): void {
        if(this.tiles.has(uuid)) throw new Error(`Tile with uuid (${uuid}) already exists`);
        this.tiles.set(uuid,pos);
    }
    public deleteTile(uuid: UUID){
        this.tiles.delete(uuid);
    }
    public getTile(uuid: UUID): Position | null {
        if(!this.tiles.has(uuid)) return null;
        return this.tiles.get(uuid) as Position;
    }
}