import React,{Component, createRef, RefObject} from 'react';
import {Switch, Route} from "react-router-dom";
import { WEBGL } from 'three/examples/jsm/WebGL.js';
import {init,destory} from '../../game/main';
import {GameProvider} from '../providor/GameProvidor';
import Files from '../../game/utils/FileLoader';
import WorldGenerationV5 from '../../game/world/worldgeneration';
import {route, getQuery} from '../../utils/history';
import LoadingScreen from '../game/LoadingScreen';
import {world} from '../../assets/lang.json';
export default class Game extends Component{
    gameCanvas: RefObject<HTMLCanvasElement> = createRef();
    constructor(props:any){
        super(props);
    }
    componentDidMount(){ this.init();}
    init(){
        if(this.checkFiles()){
            if(this.gameCanvas.current && WEBGL.isWebGL2Available()){
                const context = this.gameCanvas.current.getContext( 'webgl2', { alpha: false } );
                init(context as WebGL2RenderingContext,this.gameCanvas.current);
                const wg = new WorldGenerationV5({worldSize: 11, players: [{faction:"Imperius",id:"ai"},{faction:"Xin-xi",id:"ai"}]});
                wg.createDefaultWorld();
            }else{
                console.error(WEBGL.getWebGL2ErrorMessage())
            }
        }
    }
    checkFiles(){
        const query = getQuery();
        if(Files.filesLoaded){
            route("/game",{query});
            return true;
        }else{
            route("/game/loading",{query});
            setTimeout(()=>{
                this.init();
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
                        <Route path="/game/view"></Route>
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