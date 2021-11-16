import { Tile } from "./Tile";

enum Selected {
    BASE,
    BUILDING,
    UNIT
}

export default class TileController {
    private hasBuilding: boolean = false;
    private selected: Selected = Selected.BASE; 
    constructor(){}
}