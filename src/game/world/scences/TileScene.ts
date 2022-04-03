import type { Position, UUID } from '../../core/types';
import CityTile from '../rendered/CityTile';
import BaseScene from './BaseScene';

export default class TileScene extends BaseScene {
    public name: string = "TileScene"; 
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
}