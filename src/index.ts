import App from './ui/App.svelte';
import Game from './game/core/Game';

import "./ui/index.sass";

const game = new Game();

let app = new App({
  target: document.body,
});
