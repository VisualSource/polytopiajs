import {GUI} from 'lil-gui';
import type Game from './Game';
import type { Tribe } from './types';

export function init(game: Game){
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
        "Active Player": "imperius"
    }

    const gui = new GUI({ title: "Controls"  });
    
    gui.add(actions,"Reset Units");
    gui.add(actions,"Reload Assets");
    gui.add(actions,"Active Player",["imperius","bardur"]).onChange((value: Tribe)=>{
        game.world.players.activePlayer = value;
        game.world.units.forEach(unit=>{
            unit.reset();
        });
    });
  
    
}