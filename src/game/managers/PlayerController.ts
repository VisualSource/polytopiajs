import Player from "./Player";
import type { Tech, Tribe, UUID } from "../core/types";
import EventEmitter from "../core/EventEmitter";
import { GameEvent, SystemEvents, UIEvent } from "../events/systemEvents";
import type Engine from "../core/Engine";
import type World from "../world/World";
import NArray from "../../utils/NArray";

export default class PlayerController {
    static loadFromJson(engine: Engine): PlayerController {
        return new PlayerController(engine).jsonConstructor();
    }
    static init(tribes: Tribe[], engine: Engine): PlayerController {
        return new PlayerController(engine).defaultConstructor(tribes);
    }
    public tribes: Tribe[] = [];
    public players: Map<Tribe,Player> = new Map();
    private _active_player: Tribe = "imperius";
    private _turn: number = 0;
    private activeIndex = 0;
    private events: EventEmitter = new EventEmitter();
    constructor(private engine: Engine){}
    /**
     * does the main set for players in a world.
     * Sets up: 
     *  Player fog layer
     *  adding the players capitals to the player object
     *  spwnaing the default unit
     *  setting the default camera postion 
     */
    public setupPlayers(data: { tribe: Tribe, uuid: UUID }[], world: World): void {
        for(const { tribe, uuid } of data){
            const team = this.players.get(tribe);

            const fog = new NArray<number>(world.level.size);
            fog.fill(0);

            const capital = world.lookup.get(uuid);
            if(!capital) return;

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
    }
    public getActivePlayer(): Player {
        const p = this.players.get(this.activePlayer);
        if(!p) throw new Error("Failed to get active player data");
        return p;
    }
    get activePlayerStarGain(): number {
        return this.getActivePlayer().star_gain;
    }
    set activePlayerStarGain(value: number) {
        const p = this.getActivePlayer();
        p.star_gain = value;
        this.events.emit<SystemEvents,UIEvent>({ type: SystemEvents.UI, id: UIEvent.STAR_GAIN_CHANGE, data: { star_gain: p.star_gain } });
    }
    get activePlayerStars(): number {
        return this.getActivePlayer().stars
    }
    set activePlayerStars(value: number) {
        const p = this.getActivePlayer();
        p.stars += value;
        this.events.emit<SystemEvents,UIEvent>({type: SystemEvents.UI, id: UIEvent.STARS_CHANGE, data: { stars: p.stars }});
    }
    get activePlayerScore(): number {
        return this.getActivePlayer().score;
    }
    set activePlayerScore(value: number){
        const p = this.getActivePlayer();
        p.score += value;
        this.events.emit<SystemEvents, UIEvent>({ type: SystemEvents.UI, id: UIEvent.SCORE_CHANGE, data: { score: p.score } });
    }
    set activePlayerCitys(value: number){
        const p = this.getActivePlayer();
        p.citys = value;
    }
    public updateTurn(): void {
        this._turn++;
        this.events.emit<SystemEvents,UIEvent>({ type: SystemEvents.UI, id: UIEvent.TURN_CHANGE, data: { turn: this._turn } });
    }
    set activePlayer(value: Tribe){
        this._active_player = value;
        const p = this.getActivePlayer();
        if(p.camera) this.engine.setCameraPos = p.camera;
        this.events.emit<SystemEvents,UIEvent>({ type: SystemEvents.UI, id: UIEvent.ALL, data: {
            score: p.score,
            stars: p.stars,
            turn: this._turn,
            star_gain: p.star_gain
        } });
    }
    get activePlayer(): Tribe {
        return this._active_player;
    }
    public jsonConstructor(): this {
        return this;
    }
    public defaultConstructor(tribes: Tribe[]): this {
        this.tribes = tribes;
        for(const tribe of tribes){
            this.players.set(tribe,new Player(tribe,null));
        }
        this.activePlayer = tribes[0];
        return this;
    }
    public activePlayerHas(tech: Tech): boolean {
        return this.playerHasTech(this.activePlayer,tech);
    }
    public playerHasTech(tribe: Tribe, tech: Tech): boolean {
        const player = this.players.get(tribe);
        if(!player) return false;
        return (player.tech as any)[tech] ?? false;
    }
    public changeTurn(){
        const current = this.players.get(this.activePlayer);
        if(current) { current.camera = this.engine.getCameraPos; }
        this.events.emit<SystemEvents,GameEvent>({ type: SystemEvents.GAME_EVENT, id: GameEvent.TURN_CHANGE, data: { last: this.activePlayer } });
        this.activeIndex++;
        if(this.activeIndex >= this.players.size) this.activeIndex = 0;
        this.activePlayer = this.tribes[this.activeIndex];
        this.events.emit<SystemEvents,GameEvent>({ type: SystemEvents.GAME_EVENT, id: GameEvent.FOG_CHANGE, data: { now: this.activePlayer, last: current?.tribe } });
        this.updateTurn();
        
    }
    public toJson(){
        let players: any[] = [];
        this.players.forEach((value)=>{
            players.push(value.toJSON());
        });
        return {
            players,
            active_player: this._active_player
        };
    }

}