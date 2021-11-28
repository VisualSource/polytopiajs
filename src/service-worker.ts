/// <reference lib="webworker" />
import {clientsClaim} from 'workbox-core';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

