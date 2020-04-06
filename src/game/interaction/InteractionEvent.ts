import { Object3D } from "three";

/**
 * Event class that mimics native DOM events.
 *
 * @class
 */
class InteractionEvent {
  /**
   * InteractionEvent constructor
   */
  stopped: boolean;
  target: Object3D | null;
  currentTarget: Object3D | null;
  type: string| null;
  constructor() {
    /**
     * Whether this event will continue propagating in the tree
     *
     * @member {boolean}
     */
    this.stopped = false;

    /**
     * The object which caused this event to be dispatched.
     *
     * @member {Object3D}
     */
    this.target = null;

    /**
     * The object whose event listener’s callback is currently being invoked.
     *
     * @member {Object3D}
     */
    this.currentTarget = null;

    /**
     * Type of the event
     *
     * @member {string}
     */
    this.type = null;

    /**
     * InteractionData related to this event
     *
     * @member {InteractionData}
     */
    //@ts-ignore
    this.data = null;

    /**
     * ray caster detial from 3d-mesh
     *
     * @member {Intersects}
     */
    //@ts-ignore
    this.intersects = [];
  }

  /**
   * Prevents event from reaching any objects other than the current object.
   *
   */
  stopPropagation() {
    this.stopped = true;
  }

  /**
   * Resets the event.
   *
   * @private
   */
  _reset() {
    this.stopped = false;
    this.currentTarget = null;
    this.target = null;
    //@ts-ignore
    this.intersects = [];
  }
}

export default InteractionEvent;
