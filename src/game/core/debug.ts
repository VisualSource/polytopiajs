import * as dat from 'dat.gui';
import type Game from './Game';

export function init(game: Game){
    const actions = {
        ResetUnits: false,
    }

    const gui = new dat.GUI({name:"DEBUG"});
    gui.add(actions,"ResetUnits").onChange(value=>{
        actions.ResetUnits = false;
        game.world.units.forEach(unit=>{
            unit.reset();
        });
    });
    
}