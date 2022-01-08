import { replace } from 'svelte-spa-router';
import { timer } from '../../utils/time';
import EventEmitter, { type SystemEventListener } from "../core/EventEmitter"; 
import { ActionEvent, GameEvent, SystemEvents } from "../events/systemEvents";
import type { Tribe } from "../core/types";
import type { City } from "../world/Tile";
import type World from "../world/World";
import type PlayerController from "./PlayerController";
import type Settings from '../core/Settings';

export default class ActionsManager implements SystemEventListener {
    public events: EventEmitter = new EventEmitter();
    constructor(private world: World, private players: PlayerController, private settings: Settings){
        this.events.on(SystemEvents.GAME_EVENT,(event)=>{
            if((event.id === GameEvent.TURN_CHANGE)){
                replace("/loading");
                this.world.units.forEach(unit=>{
                    if(unit.tribe === event.data.last) unit.reset();
                });

                timer(500).then(()=>{
                    if(this.settings.confirm_turn) replace("/change"); else replace("/");
                });
            }
        })
        this.events.on(SystemEvents.ACTION,(event)=>{
            const pos = this.world.lookup.get(event.data.tile);
            if(!pos) return;
            const tile = this.world.level.get(pos.row,pos.col);
            if(!tile) return;
            switch (event.id) {
                case ActionEvent.SPAWN:
                    if(!(tile.base as City)?.isCity || tile.unit) return; 

                    if((tile.base as City).canSpawnUnit()) {
                        this.world.unit_controller.createUnit(tile.owning_tribe as Tribe, event.data.type, pos, tile.uuid);
                    }
                    break;
                case ActionEvent.CREATE: 
                    break;
                case ActionEvent.DESTORY:
                    tile.removeBuilding();
                    break;
                case ActionEvent.DISBAND: 
                    
                    break;
                case ActionEvent.GATHER:
                    // will need to get the closest city to add pop to
                    tile.removeBuilding();
                    break;
                case ActionEvent.HEAL: 
                    break;
                case ActionEvent.RECOVER:
                    break;
                default:
                    break;
            }
        });
    }
}