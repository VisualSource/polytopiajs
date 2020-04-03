import React from 'react';
import {Button} from 'shineout'
import {route} from '../../utils/history';

function MainMenu(){
    return <div id="main-menu">
                <Button onClick={()=>route("/game")} type="primary">Singleplayer</Button>  
                 <Button onClick={()=>route("/game",{ search: {mp: true}})} type="primary">Multiplayer</Button> 
                <Button onClick={()=>route("/game")} type="primary">Multiplayer</Button> 
           </div>;
}

export default MainMenu;