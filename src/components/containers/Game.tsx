import React,{Component, createRef, RefObject} from 'react';
import {Switch, Route} from "react-router-dom";
import { WEBGL } from 'three/examples/jsm/WebGL.js';
import {init,destory} from '../../game/main';
import {GameProvider} from '../providor/GameProvidor';
import Files from '../../game/utils/FileLoader';
import WorldGenerationV5, {WorldLoader} from '../../game/world/worldgeneration';
import {route, getQuery} from '../../utils/history';
import LoadingScreen from '../game/LoadingScreen';
import GameState from '../../game/GameStateHandler';
import {world} from '../../assets/lang.json';
import {pick, nativeMath} from 'random-js';
import View from '../game/View';
 const defaultPlayer = (faction: Polytopia.IFaction, id: string, ai: boolean=false): Polytopia.IPlayerObject=>{
            const defaultTech = (): Polytopia.ITech=>{
                switch (faction) {
                    case "Xin-xi":
                        return "climbing";
                    case "Bardur":
                        return "hunting";
                    case "Imperius":
                        return "organization";
                    case "Oumaji":
                        return "riding";
                    default:
                        return "organization";
                }
            }
        return {
            faction,
            id,
            tech: [defaultTech()],
            score: 0,
            stars: 5,
            starsPerTurn: 2,
            citys: 1,
            ai
        }
    }
function createPlayerList(playerList: any[], opp:number): Polytopia.IPlayerObject[]{
    let useable: Polytopia.IFaction[] = ["Bardur","Imperius","Oumaji" ,"Xin-xi"];
    let ai: Polytopia.IPlayerObject[] = [];
    let players = playerList.map((user:string)=>{
        const player = user.split("_");
        useable = useable.filter(tribe => tribe !== player[0]);
        return defaultPlayer(player[0] as Polytopia.IFaction,player[1]);
    });
    for(let i =0; i<opp; i++){
        const ais = pick(nativeMath,useable);
        useable = useable.filter(e=> e !== ais);
        ai.push(defaultPlayer(ais,"ai",true));
    }
    ai.forEach(e=>{
        players.push(e);
    });
    return players;
}

const toBoolean = (value: string): boolean =>{
    if(value === "true") 
        return true;
        else return false;
 
}
export default class Game extends Component{
    gameCanvas: RefObject<HTMLCanvasElement> = createRef();
    worldLoader: WorldLoader = new WorldLoader();
    constructor(props:any){
        super(props);
    }
    componentDidMount(){ 
        const query = getQuery();
        route("/game/loading",{query});
        const mp = toBoolean(query?.mp as any);
        const saved = toBoolean(query?.saved as any);
        if(mp && saved) this.init(()=>this.mutliplayerInit(saved));// load local mp // load online mp 
        if(mp && !saved) this.init(()=>this.mutliplayerInit(saved)); // new local mp  // new online mp 
        if(!mp && saved) this.init(()=>this.singleplayerInit(saved)); // load saved local singleplayer
        if(!mp && !saved) this.init(()=>this.singleplayerInit(saved)); // new local singleplayer
        
        //this.init();
    }
    init(func_init: Function){
        if(Files.filesLoaded){
            func_init();
        }else{
            setTimeout(()=>{
                this.init(func_init);
            },500);
        }
    }
    singleplayerInit(saved: boolean){
        if(this.gameCanvas.current && WEBGL.isWebGL2Available()){
            const context = this.gameCanvas.current.getContext( 'webgl2', { alpha: false } );
            if(saved){
                    init(context as WebGL2RenderingContext,this.gameCanvas.current);
                    this.worldLoader.loadLocal();
            }else{
                const {players,opp} = getQuery();
                const userList = createPlayerList(players as string[],opp as number);
                new GameState().init({ players: userList });
                init(context as WebGL2RenderingContext,this.gameCanvas.current);
                const wg = new WorldGenerationV5({worldSize: 11, players: userList});
                wg.createLocalGame();
                route("/game");
            }
        }else{
            console.error(WEBGL.getWebGL2ErrorMessage());
        }
    }
    mutliplayerInit(saved: boolean){
        const query = getQuery();
        const local = toBoolean(query.local as any);
        if(saved && local){
            this.worldLoader.loadLocal(query.uuid);
        }
        if(saved && !local){
            this.worldLoader.loadOnline(query.uuid as Polytopia.UUID);
        }
        if(!saved && local){
            if(this.gameCanvas.current && WEBGL.isWebGL2Available()){
                const context = this.gameCanvas.current.getContext( 'webgl2', { alpha: false } );
                const userList = createPlayerList(query.players as string[],query.opp as number);
                new GameState().init({ players: userList });
                init(context as WebGL2RenderingContext,this.gameCanvas.current);
                const wg = new WorldGenerationV5({worldSize: 11, players: userList});
                wg.createDefaultWorld();
                route("/game",{replace:true});
            }
        }
        if(!saved && !local){
           //this.worldLoader.newOnline();
        }
    }
    componentWillUnmount(){
        destory();
    }
    render(){
        return (<GameProvider> 
                    <Switch>
                        <Route path="/game/view">
                            <View/>
                        </Route>
                        <Route path="/game/tech"></Route>
                        <Route path="/game/settings"></Route>
                        <Route path="/game/loading">
                            <LoadingScreen text={world.loading}/>
                        </Route>
                    </Switch>
                    <canvas id="game_canvas" ref={this.gameCanvas}></canvas>
                </GameProvider>);
    }
}
/*


  const {players,opp} = getQuery();
            const userList = createPlayerList(players as string[],opp as number);
            const gameState = new GameState();
            gameState.init({
               players: userList
            });
            if(this.gameCanvas.current && WEBGL.isWebGL2Available()){
                const context = this.gameCanvas.current.getContext( 'webgl2', { alpha: false } );
                init(context as WebGL2RenderingContext,this.gameCanvas.current);
                const wg = new WorldGenerationV5({worldSize: 11, players: userList});
                wg.createDefaultWorld();
            }else{
                console.error(WEBGL.getWebGL2ErrorMessage());
            }


*/