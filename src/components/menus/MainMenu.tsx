import React from 'react';
import {Button} from 'shineout'
import {route} from '../../utils/history';
import BackButton from '../parts/BackButton';
import { Link } from "react-router-dom";

function MainMenu(){
    return <div id="main-menu">
                <BackButton/>
              <Button onClick={()=>route("/game")} type="primary">Singleplayer</Button>  
           </div>;
}

export default MainMenu;