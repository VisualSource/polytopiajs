import App from './ui/App.svelte';
import Game from './game/core/Game';

import "./ui/index.sass";

const game = new Game();

let app = new App({
  target: document.body,
});

if(import.meta.env.PROD) {
  if("serviceWorker" in navigator) {
    if('Notification' in window) {
      //https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications
        Notification.requestPermission((status)=>{
          console.log("Notification permission status", status);
        });
    }
    window.addEventListener("load",()=>{
      navigator.serviceWorker.register("/service-worker.js");
    });
  }
}
