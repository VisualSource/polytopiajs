
/*
EventDispatcher.prototype.once = function(type: string, fn: Function): EventDispatcher {
    if (typeof fn !== 'function') return this;
    const cb = (ev: any) => {
      fn(ev);
      this.off(type, cb);
    };
    this.on(type, cb);
    return this;
  };
  */

/**
 * @description JavaScript events for custom objects
 * @see https://github.com/mrdoob/eventdispatcher.js/
 * @export
 * @class EventDispatcher
 */
class GlobalEventDispatcher{
   private _listeners: any;
   /**
    * Adds a listener to an event type.
    *
    * @param {string} type
    * @param {( event: GameEvent ) => void} listener
    * @memberof GlobalEventDispatcher
    */
   addListener(type: string, listener: ( event: any ) => void): void{
        if(this._listeners === undefined) this._listeners = {};
        let listeners = this._listeners;
        if(listeners[type]=== undefined) listeners[type] = [];
        if(listeners[type].indexOf(listener) === -1) listeners[type].push(listener);
   }
   /**
    * Checks if listener is added to an event type.
    * @deprecated
    * @param {string} type
    * @param {( event: GameEvent ) => void} listener
    * @returns {boolean}
    * @memberof GlobalEventDispatcher
    */
   hasListener(type: string, listener: ( event: any) => void): boolean{
       if(this._listeners === undefined) return false;
       const listeners = this._listeners;
       return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;   
    }
    /**
     * Removes a listener from an event type.
     * @deprecated
     * @param {string} type
     * @param {( event: GameEvent ) => void} listener
     * @returns {void}
     * @memberof GlobalEventDispatcherr
     */
    removeListener(type: string, listener: ( event: any ) => void): void{
        if ( this._listeners === undefined ) return;
		const listeners = this._listeners;
		const listenerArray = listeners[ type ];
		if ( listenerArray !== undefined ) {
			const index = listenerArray.indexOf( listener );
			if ( index !== - 1 ) listenerArray.splice( index, 1 );
		}
    }
    /**
     *  
     * @description removes all listeners
     * @memberof GlobalEventDispatcher
     */
    removeAllListeners(){
        this._listeners = {};
    }
    /**
     * Fire an event type.
     *
     * @param {{ type: string; [attachment: string]: any }} event
     * @returns {void}
     * @memberof GlobalEventDispatcher
     */
    dispatch(event: { type: string; [attachment: string]: any } ): void{
        if ( this._listeners === undefined ) return;
		const listeners = this._listeners;
		const listenerArray = listeners[ event.type ];
		if ( listenerArray !== undefined ) {
			//event.target = this;
			const array = listenerArray.slice( 0 );
			for ( var i = 0, l = array.length; i < l; i ++ ) {
				array[ i ].call( this, event );
			}
		}
    }
}
const globalDispatcher = new GlobalEventDispatcher();
export default globalDispatcher;


