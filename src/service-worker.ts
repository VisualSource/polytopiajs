/// <reference lib="webworker" />
import { clientsClaim, setCacheNameDetails } from "workbox-core";
import { registerRoute } from 'workbox-routing';
import { ExpirationPlugin } from "workbox-expiration";
import {
    NetworkFirst,
    StaleWhileRevalidate,
    CacheFirst,
  } from 'workbox-strategies';


declare const self: ServiceWorkerGlobalScope;


self.addEventListener("message",(event)=>{
    if(event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

clientsClaim();

setCacheNameDetails({
    prefix: "polytopia",
    suffix: "v1"
});

registerRoute( 
    ({request})=> request.destination === "image", 
    new CacheFirst({
        cacheName: "images",
        plugins: [
            new ExpirationPlugin({
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
            })
        ]
    }) 
);

registerRoute(
    ({request})=> request.destination === "script" || request.destination === "style",
    new StaleWhileRevalidate({
        cacheName: "static-resources"
    })
);



