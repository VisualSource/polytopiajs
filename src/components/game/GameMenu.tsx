import React from 'react';
interface GameMenuOptions{
    children?: any;
    id: string;
    classes?: string;
}
export default function GameMenu(props:GameMenuOptions){
    return <div id={props.id} className={`game-menu ${props.classes ?? ""}`}>
            {props.children}
          </div>
}