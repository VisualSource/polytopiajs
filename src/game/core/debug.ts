import {GUI} from 'lil-gui';
import { isMobile } from '../../utils/mobile';
import type Game from './Game';
import type { Tribe } from './types';

export function init(game: Game){
    //@ts-ignore
    window.POLYTOPIA_GAME = game;
    const actions = {
        "Reset Units": function() {
            game.world.units.forEach(unit=>{
                unit.reset();
            });
        },
        "Reload Assets": function () {
            game.assets.reinstall().then(()=>{
                window.location.reload();
            });
        },
        "Active Player": "bardur"
    }
    const client_info: { [key: string]: any } = {
        "Game Build": import.meta.env.PACKAGE_VERSION,
        "Lang": navigator.language,
        "Network Status": navigator.onLine ? "Online" : "Offline",
        "Vender": navigator.vendor,
        "Mobile": isMobile() ? "Yes" : "No",
    }

    let i = 0;
    for(const a of navigator.userAgent.split(" ")) {
        client_info[`UserAgent_${i}`] = a.replace("(","").replace(";","").replace(")","");
        i++;
    }
   
    const gui = new GUI({ title: "Controls"  });
    gui.domElement.style.zIndex = "2";
    
    gui.add(actions,"Reset Units");
    gui.add(actions,"Reload Assets");
    gui.add(actions,"Active Player",["imperius","bardur"]).onChange((value: Tribe)=>{
        game.world.players.activePlayer = value;
        game.world.units.forEach(unit=>{
            unit.reset();
        });
    });
    const client = gui.addFolder("Client");
    client.close();
    for(const info in client_info) {
        client.add(client_info,info).disable();
    }  
}