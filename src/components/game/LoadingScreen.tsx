import React from 'react';
import GameScreen from './GameMenu';
interface LoadingScreenOptions{
    text: string;
}
export default function LoadingScreen({text= ""}:LoadingScreenOptions){
    return <GameScreen id="loading-screen">
                <h1>{text}</h1>
           </GameScreen>
}