import React,{Component, createRef, RefObject} from 'react';
import {Switch, Route } from "react-router-dom";
import { WEBGL } from 'three/examples/jsm/WebGL.js';
import {init,destory} from '../../game/main';
import {GameProvider} from '../providor/GameProvidor';

export default class Game extends Component{
    gameCavas: RefObject<HTMLCanvasElement> = createRef();
    constructor(props:any){
        super(props);
    }
    componentDidMount(){
        if(this.gameCavas.current && WEBGL.isWebGL2Available()){
                const context = this.gameCavas.current.getContext( 'webgl2', { alpha: false } );
                init(context as WebGL2RenderingContext,this.gameCavas.current);
        }else{
            console.error(WEBGL.getWebGL2ErrorMessage())
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
                    </Switch>
                    <canvas id="game_canvas" ref={this.gameCavas}></canvas>
                </GameProvider>);
    }
}