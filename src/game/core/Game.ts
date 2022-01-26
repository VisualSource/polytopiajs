import EventEmitter from './EventEmitter';
import AssetLoader from '../loaders/AssetLoader';
import Engine from './Engine';
import World from '../world/World';
import PlayerController from '../managers/PlayerController';
import {init} from './debug';
import { SystemEvents } from '../events/systemEvents';
import ActionsManager from '../managers/ActionsManager';
import UI from './UI';
import Settings from './Settings';
import Fog from '../managers/Fog';
import type { SystemEventListener } from './EventEmitter';
import type { Tribe } from './types';

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
    private fog: Fog;
    
    constructor() {
        if(Game.INSTANCE) return Game.INSTANCE;
        Game.INSTANCE = this;

        this.settings.load();

        if(import.meta.env.DEV) init(this);;
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

        return this;
    }
    public async initEngine(canvas: HTMLCanvasElement): Promise<boolean> {
        const tribes: Tribe[] = ["bardur","imperius"]; // THIS IS A TEMP VALUE.
        this.engine = new Engine(canvas);
        this.engine.init(); // START THREEJS, Controls, load assets, etc
        console.info("Init Engine | Starting threejs BUILD", import.meta.env.PACKAGE_VERSION);

        this.players = PlayerController.init(tribes,this.engine); // Set the current players of the game
        this.world = new World(this.engine,this.assets,this.players); // init world
        const { capitals } = await this.world.createWorld(tribes,11); // generate world
        this.players.setCapitals(capitals,this.world); // set the uuid of capitals to players 
        this.ui = new UI(this.world); // init ui stats funcs
        this.actions = new ActionsManager(this.world,this.players, this.settings,this.assets,this.engine); // init game events handler
        this.fog = new Fog(this.world,this.engine,this.players);
        this.fog.loadFog(undefined,this.players.activePlayer);
        return true;
    }
    public async destory(){
       console.info("Starting Destory Game");
       this.engine.destory();
    }
}