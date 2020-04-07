import { EventDispatcher, Object3D , Event} from 'three';

EventDispatcher.prototype.on = function(type: string, fn: Function): EventDispatcher {
    if(typeof fn !== "function") return this;
    if (this instanceof Object3D) this.interactive = true;
    this.addEventListener(type, fn as (event: Event) => void);
    return this;
  };

EventDispatcher.prototype.off = function(type: string, fn: Function): EventDispatcher {
    this.removeEventListener(type, fn as (event: Event) => void);
    return this;
};

EventDispatcher.prototype.once = function(type: string, fn: Function): EventDispatcher {
    if (typeof fn !== 'function') return this;
    const cb = (ev: any) => {
      fn(ev);
      this.off(type, cb);
    };
    this.on(type, cb);
    return this;
  };

EventDispatcher.prototype.emit = function(type: string, ...argument: any) {
    if (this._listeners === undefined ||  typeof this._listeners[type as any] === 'undefined') return this;
    const cbs = this._listeners[type as any] || [];
    const cache = cbs.slice(0);
  
    for (let i = 0; i < cache.length; i++) {
      cache[i].apply(this, argument);
    }
    return this;
  };