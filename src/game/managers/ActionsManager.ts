import { replace } from 'svelte-spa-router';
import { timer } from '../../utils/time';
import EventEmitter, { type SystemEventListener } from "../core/EventEmitter"; 
import { ActionEvent, GameEvent, SystemEvents } from "../events/systemEvents";
import type { Tribe } from "../core/types";
import type { City } from "../world/Tile";
import type World from "../world/World";
import type PlayerController from "./PlayerController";
import type Settings from '../core/Settings';
import type AssetLoader from '../loaders/AssetLoader';
import type Engine from '../core/Engine';

export default class ActionsManager implements SystemEventListener {
    public events: EventEmitter = new EventEmitter();
    constructor(private world: World, private players: PlayerController, private settings: Settings, private assets: AssetLoader, private engine: Engine){
        this.events.on(SystemEvents.GAME_EVENT,(event)=>{
            if((event.id === GameEvent.TURN_CHANGE)){
                replace("/playing/loading");
                this.engine.scenes.unit.forUnit(unit=>{
                    if(unit.tribe === event.data.last) unit.reset();
                });

                timer(500).then(()=>{
                    replace(this.settings.confirm_turn ? "/playing/change": "/playing");
                });
            }
        })
        this.events.on(SystemEvents.ACTION,(event)=>{
            const pos = this.engine.scenes.tile.getTile(event.data.tile);
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
                case ActionEvent.DISBAND: {
                    if(!tile.unit) break;
                    this.world.unit_controller.destoryUnit(tile.uuid);
                    break;
                }
                case ActionEvent.GATHER:{
                    if(!tile.top) break;
                    // will need to get the closest city to add pop to
                    const uuid = this.players.active.value.capital_uuid;
                    const pos = this.engine.scenes.tile.getTile(uuid);
                    if(!pos) break;

                    const city = this.world.level.get(pos.row,pos.col);

                    (city.base as City).add_population(1,{ engine: this.engine, assets: this.assets, tribe: city.owning_tribe as Tribe, owner: city.uuid });

                    tile.removeBuilding();
                    break;
                }
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