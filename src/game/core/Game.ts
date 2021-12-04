import EventEmitter, { SystemEventListener } from './EventEmitter';
import AssetLoader from '../loaders/AssetLoader';
import Engine from './Engine';
import World from '../world/World';
import PlayerController from '../managers/PlayerController';
import {init} from './debug';
import { SystemEvents } from '../events/systemEvents';
export default class Game implements SystemEventListener {
    static INSTANCE: Game | null = null;
    public events: EventEmitter = new EventEmitter();
    public assets: AssetLoader;
    public engine: Engine;
    public world: World;
    private players: PlayerController;
    
    constructor() {
        if(Game.INSTANCE) return Game.INSTANCE;
        Game.INSTANCE = this;

        init(this);

        //@ts-ignore
        window.POLYTOPIA_GAME = this;
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
    public async initEngine(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas);
        this.engine.init();
        console.info("Init Engine | Starting threejs env",canvas);
        this.players = PlayerController.init(["bardur","imperius"]);
        this.world = new World(this.engine,this.assets,this.players);
    }
    public async destory(){
       console.info("Starting Destory Game");
       this.engine.destory();
    }
}