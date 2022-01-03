import EventEmitter from './EventEmitter';
import AssetLoader from '../loaders/AssetLoader';
import Engine from './Engine';
import World from '../world/World';
import PlayerController from '../managers/PlayerController';
import {init} from './debug';
import { SystemEvents } from '../events/systemEvents';
import ActionsManager from '../managers/ActionsManager';
import UI from './UI';

import type { SystemEventListener } from './EventEmitter';

export default class Game implements SystemEventListener {
    static INSTANCE: Game | null = null;
    public events: EventEmitter = new EventEmitter();
    public assets: AssetLoader;
    public engine: Engine;
    public world: World;
    public ui: UI;
    private players: PlayerController;
    private actions: ActionsManager;
    
    constructor() {
        if(Game.INSTANCE) return Game.INSTANCE;
        Game.INSTANCE = this;

        if(import.meta.env.DEV) init(this);
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
        this.engine = new Engine(canvas);
        this.engine.init();
        console.info("Init Engine | Starting threejs env",canvas);
        this.players = PlayerController.init(["bardur","imperius"]);
        this.world = new World(this.engine,this.assets,this.players);
        this.ui = new UI(this.world);
        this.actions = new ActionsManager(this.world);
        return true;
    }
    public async destory(){
       console.info("Starting Destory Game");
       this.engine.destory();
    }
}