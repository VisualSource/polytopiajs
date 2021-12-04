import {GUI} from 'dat.gui';
import type Game from './Game';

export function init(game: Game){
    const actions = {
        ResetUnits: false,
        activeplayer: "imperius"
    }

    const gui = new GUI({name:"DEBUG"});
    
    gui.add(actions,"ResetUnits").onChange(value=>{
        actions.ResetUnits = false;
        game.world.units.forEach(unit=>{
            unit.reset();
        });
    });
    
}