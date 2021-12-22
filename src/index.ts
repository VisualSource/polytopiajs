import App from './ui/App.svelte';
import Game from './game/core/Game';

import "./ui/index.sass";

const game = new Game();

let app = new App({
  target: document.body,
});

if('Notification' in window) {
  Notification.requestPermission().then((value)=>{
    console.log(value);
  },(resason)=>{
    console.log(resason);
  });
}

if(import.meta.env.PROD) {
  if("serviceWorker" in navigator) {
      //https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications
    window.addEventListener("load",()=>{
      navigator.serviceWorker.register("/service-worker.js");
    });
  }
}
