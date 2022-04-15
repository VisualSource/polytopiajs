import { map, Subject, BehaviorSubject } from 'rxjs';
import Player from "./Player";
import type { Tech, Tribe, UUID } from "../core/types";
import EventEmitter from "../core/EventEmitter";
import { GameEvent, SystemEvents } from "../events/systemEvents";
import type Engine from "../core/Engine";
import type World from "../world/World";
import NArray from "../../utils/NArray";

class ActivePlayer {
    public player: Subject<Player> = new Subject();
    private _p: Player;
    constructor(){
        this.player.subscribe(player=>{
            this._p = player;
        });
    }
    public get value(): Player {
        return this._p;
    }
    public inc_star_gain(value: number): void {
        this._p.star_gain += value;
        this.player.next(this._p);
    }
    public inc_stars(value: number): void {
        this._p.stars += value;
        this.player.next(this._p);
    }
    public inc_citys(value: number): void {
        this._p.citys += value;
        this.player.next(this._p);
    }
    public hasTech(tech: Tech): boolean {
        return (this._p.tech as any)[tech] ?? false;
    }
    public setActive(player: Player) {
        this.player.next(player);
    }
}


export default class PlayerController {
    static loadFromJson(engine: Engine): PlayerController {
        return new PlayerController(engine).jsonConstructor();
    }
    static init(engine: Engine): PlayerController {
        return new PlayerController(engine);
    }
    public tribes: Tribe[] = [];
    public players: Map<Tribe,Player> = new Map();
    public turn: BehaviorSubject<number> = new BehaviorSubject(0);
    public active: ActivePlayer = new ActivePlayer();
    private _activeIndex = 0;
    private _events: EventEmitter = new EventEmitter();
    private constructor(private engine: Engine){ }
    public jsonConstructor(): this {
        return this;
    }
    /**
     * does the main setup for players in a world.
     * Sets up: 
     *  Player fog layer
     *  adding the players capitals to the player object
     *  spwnaing the default unit
     *  setting the default camera postion 
     */
    public setupPlayers(data: { tribe: Tribe, uuid: UUID }[], world: World): void {
        for(const { tribe, uuid } of data){
            const team = new Player(tribe,null);
            this.players.set(tribe,team);
            this.tribes.push(tribe);

            console.info("Preparing tribe",tribe);

            const fog = new NArray<number>(world.level.size);
            fog.fill(0);

            const capital = this.engine.scenes.tile.getTile(uuid);
            if(!capital) continue;

            for(let i = -1; i <= 1; i++) {
                for(let j = -1; j <= 1; j++) {
                    let row = capital.row + i;
                    let col = capital.col + j;
                    const data = world.level.isValid(row,col);
    
                    if(!data) continue;
                    fog.set(row,col,1);
                }
            }
        
            if(team){
                team.fog_map = fog;
                team.capital_uuid = uuid;
                world.unit_controller.createUnit(team.tribe,"WARRIOR",capital,uuid);
                team.camera = {
                    target: {
                        x: capital.row * 4,
                        z: capital.col * 4,
                        y: 0
                    },
                    zoom: 0.40
                };
            }
        }

        const tribe = this.tribes[this._activeIndex];
        this.activePlayer = tribe;
    }
    private incTurn(): void {
        this.turn.next(this.turn.getValue() + 1);
    }
    private saveActive(): Tribe {
        const current = this.active.value;
        current.camera = this.engine.getCameraPos;
        this.players.set(current.tribe,current);
        return current.tribe;
    }
    private set activePlayer(value: Tribe){
        const p = this.players.get(value);
        if(!p) throw new Error(`Failed to find tribe ${value}`);
        if(p.camera) this.engine.setCameraPos = p.camera;
        this.active.setActive(p);
    }
    public activePlayerHas(tech: Tech): boolean {
        return this.active.hasTech(tech);
    }
    public playerHasTech(tribe: Tribe, tech: Tech): boolean {
        const player = this.players.get(tribe);
        if(!player) return false;
        return (player.tech as any)[tech] ?? false;
    }
    public changeTurn(){
        const last = this.saveActive();
        this._events.emit<SystemEvents,GameEvent>({ type: SystemEvents.GAME_EVENT, id: GameEvent.TURN_CHANGE, data: { last } });

        this._activeIndex++;
        if(this._activeIndex >= this.players.size) this._activeIndex = 0;
        this.activePlayer = this.tribes[this._activeIndex];

        this._events.emit<SystemEvents,GameEvent>({ type: SystemEvents.GAME_EVENT, id: GameEvent.FOG_CHANGE, data: { now: this.activePlayer, last } });
        this.incTurn();
    }
    public toJson(){
        let players: any[] = [];
        this.players.forEach((value)=>{
            players.push(value.toJSON());
        });
        return {
            players,
            active_player: this._activeIndex
        };
    }

}