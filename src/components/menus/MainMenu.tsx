import React from 'react';
import {Button} from 'shineout';
import IconButton from '../parts/IconButton';
import {route} from '../../utils/history';
import {startmenu} from '../../assets/lang.json';
function MainMenu(){
    return <div id="main-menu">
               <header>
                    <img src="" alt="polytopia_js_logo"/>
               </header>
               <main>
                    <Button onClick={()=>route("/singleplayer")} type="primary">{startmenu.new_game}</Button>  
                    <Button onClick={()=>route("/game",{ query: {saved: true}})} type="primary">{startmenu.resume_game}</Button> 
                    <Button onClick={()=>route("/game",{ query: {saved: true}})} type="primary">DEV START</Button> 
                    <Button onClick={()=>route("/multiplayer")} type="primary">{startmenu.multiplayer}</Button> 
               </main>
               <footer>
                    <IconButton src="" text={startmenu.settings} onClick={()=>route("/settings")}/>
                    <IconButton src="" text={startmenu.throne_room} onClick={()=>route("/throneroom")}/>
                    <IconButton src="" text={startmenu.high_score} onClick={()=>route("/highscore")}/>
                    <IconButton src="" text={startmenu.about} onClick={()=>route("/about")}/>
               </footer>
           </div>;
}

export default MainMenu;