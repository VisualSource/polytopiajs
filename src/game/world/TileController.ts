import { nanoid } from "nanoid";
import  EventEmitter from "../core/EventEmitter";
import type { SystemEventListener } from "../core/EventEmitter";
import { Tile } from "./Tile";
import { ObjectEvents, SystemEvents } from "../events/systemEvents";

enum Selected {
    BASE,
    BUILDING,
    UNIT
}

export default class TileController implements SystemEventListener {
    private hasBuilding: boolean = false;
    private selected: Selected = Selected.BASE; 
    public uuid: string = nanoid();
    public events: EventEmitter = new EventEmitter();
    constructor(){
        this.events.onId<SystemEvents,ObjectEvents>({name: SystemEvents.INTERACTION, id: ObjectEvents.SELECTION },(event)=>{
            if(event.data.owner === this.uuid){
                console.log(event);
            }
        });
    }
}