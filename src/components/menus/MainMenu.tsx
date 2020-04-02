import React from 'react';
import {Button} from 'shineout'
import {route} from '../../utils/history';


function MainMenu(){
    return <div id="main-menu">
              <Button onClick={()=>route("/singleplayer")} type="primary">Singleplayer</Button>  
           </div>;
}

export default MainMenu;