import React,{Component, createRef, RefObject} from 'react';
import {Switch, Route} from "react-router-dom";
import { WEBGL } from 'three/examples/jsm/WebGL.js';
import {init,destory} from '../../game/main';
import {GameProvider} from '../providor/GameProvidor';
import Files from '../../game/utils/FileLoader';
import WorldGenerationV5 from '../../game/world/worldgeneration';
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

export default class Game extends Component{
    gameCanvas: RefObject<HTMLCanvasElement> = createRef();
    constructor(props:any){
        super(props);
    }
    componentDidMount(){ 
        const query = getQuery();
        route("/game/loading",{query});
        if(Boolean(query.mp) && Boolean(query.saved)){
            console.log("Multiplayer savedgame");
            
        } // multiplayer savedgame 
        if(Boolean(query.mp) && Boolean(query.saved) === false){
            console.log("new Multiplayer game");
            
        } // new multiplayer game
        if(!Boolean(query.mp) && Boolean(query.saved)){
            console.log("singleplayer savedgame");
            
        } // singleplayer saved game 
        if(!Boolean(query.mp) && !Boolean(query.saved)){
            console.log("new singleplayer game");
            
        } //default singleplayer new game 
        //this.init();
    }
    init(func_init: Function){
        if(this.checkFiles(func_init)){
            func_init();
        }
    }
    checkFiles(func_init:Function){
        const query = getQuery();
        if(Files.filesLoaded){
            route("/game",{query});
            return true;
        }else{
            route("/game/loading",{query});
            setTimeout(()=>{
                this.init(func_init);
            },500);
            return false;
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