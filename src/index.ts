import App from './ui/App.svelte';
import Game from './game/core/Game';

import "./ui/index.sass";

const game = new Game();

let app = new App({
  target: document.body,
});


if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    app.$destroy();
  });
}