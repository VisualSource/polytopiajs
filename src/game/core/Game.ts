import { BehaviorSubject } from 'rxjs';
import EventEmitter from './EventEmitter';
import AssetLoader from '../loaders/AssetLoader';
import Engine from './Engine';
import World from '../world/World';
import PlayerController from '../managers/PlayerController';
import { init } from './debug';
import { SystemEvents } from '../events/systemEvents';
import ActionsManager from '../managers/ActionsManager';
import UI from './UI';
import Settings from './Settings';
import Fog from '../managers/Fog';
import type { SystemEventListener } from './EventEmitter';
import type { Tribe } from './types';
import { replace } from 'svelte-spa-router';

interface GameParams {
    init: string; // bool
    size?: string; // int
    tribes?: Tribe[];
    mode?: string;
    online: string; // bool
    type: "sp" | "mp";
    load?: string;
    token?: string;
    with?: string[];

}

export default class Game implements SystemEventListener {
    static INSTANCE: Game | null = null;
    public events: EventEmitter = new EventEmitter();
    public settings: Settings = new Settings();
    public assets: AssetLoader;
    public engine: Engine;
    public world: World;
    public ui: UI;
    public players: PlayerController;
    private actions: ActionsManager;
    public fog: Fog;
    public ready: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    static Get(): Game {
        if(Game.INSTANCE) return Game.INSTANCE;
        return new Game();
    }
    constructor() {
        if(Game.INSTANCE) return Game.INSTANCE;
        Game.INSTANCE = this;

        this.settings.load();

        if(import.meta.env.DEV) init(this);

        this.init();
    }

    public async init(){
        console.info("Init | Starting loading of Assets");
        this.assets = new AssetLoader();
        await this.assets.init();

        this.events.on(SystemEvents.SOUND,(event)=>{
            try {
                this.assets.playSound(event.data.sound);
            } catch (error) {
                console.error(error);
            }
        });

        this.ready.next(true);

        return this;
    }
    public async launchGame(settings: GameParams,canvas: HTMLCanvasElement){
        if( !("online" in settings && "init" in settings) ) {
            replace("/?error=launch-error");
            return false;
        }
        let init = settings.init === "true";
        let online = settings.online === "true";
        let size = parseInt(settings?.size ?? "0");

        // fetch map if needed

        console.log(settings);


        return this.initEngine(canvas);
    }


    public async initEngine(canvas: HTMLCanvasElement): Promise<boolean> {
        const tribes: Tribe[] = ["bardur","imperius"]; // THIS IS A TEMP VALUE.
        this.engine = new Engine(canvas);
        this.engine.init(); // START THREEJS, Controls, load assets, etc
        console.info("Init Engine | Starting threejs BUILD", import.meta.env.PACKAGE_VERSION);
        this.players = PlayerController.init(this.engine);
        this.world = new World(this); // init world
        const { capitals } = await this.world.createWorld(tribes,11); // generate world
        this.players.setupPlayers(capitals,this.world); // set the uuid of capitals to players 
        this.ui = new UI(this); // init ui stats funcs
        this.actions = new ActionsManager(this.world,this.players, this.settings,this.assets,this.engine); // init game events handler
        this.fog = await new Fog(this).init(this.world.level.size);
        this.fog.loadFog(undefined,this.players.active.value.tribe);

        return true;
    }
    public async destory(){
       console.info("Starting Destory Game");
       this.engine.destory();
    }
}