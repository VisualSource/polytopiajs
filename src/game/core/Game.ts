import EventEmitter, { SystemEventListener } from './EventEmitter';
import AssetLoader from '../loaders/AssetLoader';
import Engine from './Engine';
import World from '../world/World';
import PlayerController from '../managers/PlayerController';
export default class Game implements SystemEventListener {
    static INSTANCE: Game | null = null;
    public events: EventEmitter = new EventEmitter();
    public assets: AssetLoader;
    public engine: Engine;
    private world: World;
    private players: PlayerController;
    
    constructor() {
        if(Game.INSTANCE) return Game.INSTANCE;
        Game.INSTANCE = this;

        //@ts-ignore
        window.POLYTOPIA_GAME = this;
    }

    public async init(){
        console.info("Init | Starting loading of Assets");
        this.assets = new AssetLoader();
        await this.assets.init();
        return this;
    }
    public async initEngine(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas);
        this.engine.init();
        console.info("Init Engine | Starting threejs env",canvas);
        this.players = new PlayerController();
        this.world = new World(this.engine,this.assets,this.players);
    }
    public async destory(){
       console.info("Starting Destory Game");
       this.engine.destory();
    }
}