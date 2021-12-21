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


//https://github.com/NazimHAli/svelte-template
//https://stackoverflow.com/questions/68654761/how-to-add-a-public-directory-in-vitejs-configuration-file