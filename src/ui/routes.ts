import GameView from './components/GameView.svelte';

const routes = new Map<string | RegExp,any>();

routes.set(/^\/(\/(.*))?/, GameView);

export default routes;