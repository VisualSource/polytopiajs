import { EventDispatcher, EventListener, Event } from 'three';

/**
 *
 *
 * @export
 * @interface SystemEvent
 * @template E
 * @template I
 */
export interface SystemEvent<E,I> {
    name: E
    id: I
} 
/**
 *
 *
 * @export
 * @interface SystemEventMessage
 * @template E
 * @template I
 */
export interface SystemEventMessage<E, I>{
    type: E;
    id: I;
    data: {
        [name: string]: any;
    }
    target?: any;
}

/**
 * A interface for implementing on classes the use the system event dispatcher
 *
 * @export
 * @interface SystemEventListener
 */
export interface SystemEventListener {
    events: EventEmitter
}

/**
 * Extended ThreeJs EventDispatcher
 *
 * @export
 * @class EventEmitter
 * @extends {EventDispatcher}
 */
export default class EventEmitter extends EventDispatcher {
    static INSTANCE: EventEmitter | null = null;
    //@ts-ignore
    constructor(){
        if(EventEmitter.INSTANCE) return EventEmitter.INSTANCE;
        super();

        EventEmitter.INSTANCE = this;
    }
    /**
     * Alies of addEventListener
     *
     * @param {string} type
     * @param {EventListener<Event, string, this>} listener
     * @return {*}  {void}
     * @memberof EventEmitter
     */
    public on(type: string, listener: EventListener<Event, string, this>): void { 
        return this.addEventListener(type, listener);
    }
    /**
     * Alies of removeEventListener
     *
     * @param {string} type
     * @param {EventListener<Event, string, this>} listener
     * @return {*}  {void}
     * @memberof EventEmitter
     */
    public off(type: string, listener: EventListener<Event, string, this>): void {
        return this.removeEventListener(type,listener);
    }
    /**
     * Waits for a event with a given name and id is emited
     *
     * @template E
     * @template I
     * @param {SystemEvent<E,I>} event
     * @param {EventListener<Event, E, this>} listener
     * @return {*}  {void}
     * @memberof EventEmitter
     */
    public onId<E, I>(event: SystemEvent<E,I>, listener: EventListener<Event, E, this>): void {
        return this.addEventListener(event.name as any, ev => { if(ev.id === event.id) listener(ev); });
    }
    /**
     * Removes a event
     *
     * @template E
     * @template I
     * @param {SystemEvent<E,I>} event
     * @param {EventListener<Event, E, this>} listener
     * @return {*}  {void}
     * @memberof EventEmitter
     */
    public offId<E, I>(event: SystemEvent<E,I>, listener: EventListener<Event, E, this>): void {
        return this.removeEventListener(event.name as any, ev => { if(ev.id === event.id) listener(ev); });
    }
    /**
     * A more strucured version of the base dispatchEvent method.
     * This emit requires a EventId as well as a EventName
     *
     * @template E
     * @template I
     * @param {SystemEventMessage<E,I>} message
     * @return {*}  {void}
     * @memberof EventEmitter
     */
    public emit<E,I>(message: SystemEventMessage<E,I>): void {
        return this.dispatchEvent(message as any);
    }
}