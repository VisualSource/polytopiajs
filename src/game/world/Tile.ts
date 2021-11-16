import { nanoid } from 'nanoid';
import EventEmitter, { SystemEventListener } from '../core/EventEmitter';

import type { Unit } from './Unit';

type WorldReference = { id: string, index: number };

enum SelectedID {
    ROOT,
    ABOVE,
    UNIT,
    SELECTOR
}

export class Tile {
    constructor(public type: string, public worldRef: WorldReference){}

    get show(): boolean {
        return true;
    }

    get terrainBounsMovement(): number {
        return 0
    }
    get terrainBounsDefence(): number {
        return 0;
    }
    
}

export class TileGroup implements SystemEventListener {
    public events: EventEmitter = new EventEmitter();
    public readonly id: string = nanoid();
    // should be Field, Forest, Mountain, Shallow Water, Ocean or Ice everything else should be a building.
    private base: Tile;
    // Field => Farm, Windmill, Forge, Sawmill, Sanctuary, Customs House, Ice Bank, Temple, Monuments, Roads, Ruins, Fruit, Crop
    // Forest => Lumber Hut, Sanctuary, Forest Temple, Roads, Runis, Wild animal
    // Mountain => Mine, Sanctuary, Mountain Temple, Ruins, Metal
    // Shallow Water => Fish, Port, Water temple, Monuments, Ruins
    // Ocean => Water Temple, Whale, Runins
    // Ice => Outpost, ice temple, Mounuments 
    private building: Tile[] = [];
    private unit: Unit | null = null;
    private selected: SelectedID = SelectedID.ROOT;

    constructor() {

    }

    public set setUnit(unit: Unit | null) {}

    public addbuilding(tile: Tile){}
    public removeBuilding(index: number) {}
    
}


