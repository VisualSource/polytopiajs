import GameView from './components/GameView.svelte';
import Home from './components/Home.svelte';
import MutliplayerSvelte from './components/mp/Mutliplayer.svelte';
import Singleplayer from './components/sp/Singleplayer.svelte';

import Settings from './components/game/Settings.svelte';
import TechTree from './components/game/techtree/TechTree.svelte';
import GlobalStats from './components/game/GlobalStats.svelte';
import Portals from './components/game/Portals.svelte';
import TurnChange from './components/game/TurnChange.svelte';
import GameLoading from './components/game/GameLoading.svelte';

const routes = new Map<string | RegExp,any>();

routes.set(/^\/playing(\/(.*))?/, GameView);
routes.set("/",Home);
routes.set(/^\/singleplayer(\/(.*))?/,Singleplayer);
routes.set(/^\/mutliplayer(\/(.*))?/,MutliplayerSvelte);



const game_routes = { 
    "/settings": Settings,
    "/tech-tree": TechTree,
    "/stats": GlobalStats,
    "/portals": Portals,
    "/change": TurnChange,
    "/loading": GameLoading 
};


export {routes, game_routes};



