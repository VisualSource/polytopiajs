/**
 * DisplayObjects with the `trackedPointers` property use this class to track interactions
 *
 * @class
 * @private
 */
export default class InteractionTrackingData {
  _pointerId: number;
  _flags: number;
  static FLAGS: {
    NONE: number;
    OVER: number;
    LEFT_DOWN: number;
    RIGHT_DOWN: number;
  }
  /**
   * @param {number} pointerId - Unique pointer id of the event
   */
  constructor(pointerId: number) {
    this._pointerId = pointerId;
    this._flags = InteractionTrackingData.FLAGS.NONE;
  }

  /**
   *
   * @private
   * @param {number} flag - The interaction flag to set
   * @param {boolean} yn - Should the flag be set or unset
   */
  _doSet(flag: number, yn: boolean) {
    if (yn) {
      this._flags = this._flags | flag;
    } else {
      this._flags = this._flags & (~flag);
    }
  }

  /**
   * Unique pointer id of the event
   *
   * @readonly
   * @member {number}
   */
  get pointerId() {
    return this._pointerId;
  }

  /**
   * State of the tracking data, expressed as bit flags
   *
   * @member {number}
   */
  get flags() {
    return this._flags;
  }

  /**
   * Set the flags for the tracking data
   *
   * @param {number} flags - Flags to set
   */
  set flags(flags) {
    this._flags = flags;
  }

  /**
   * Is the tracked event inactive (not over or down)?
   *
   * @member {number}
   */
  get none() {
    //@ts-ignore
    return this._flags === this.constructor.FLAGS.NONE;
  }

  /**
   * Is the tracked event over the DisplayObject?
   *
   * @member {boolean}
   */
  get over() {
     //@ts-ignore
    return (this._flags & this.constructor.FLAGS.OVER) !== 0;
  }

  /**
   * Set the over flag
   *
   * @param {boolean} yn - Is the event over?
   */
  set over(yn) {
     //@ts-ignore
    this._doSet(this.constructor.FLAGS.OVER, yn);
  }

  /**
   * Did the right mouse button come down in the DisplayObject?
   *
   * @member {boolean}
   */
  get rightDown() {
     //@ts-ignore
    return (this._flags & this.constructor.FLAGS.RIGHT_DOWN) !== 0;
  }

  /**
   * Set the right down flag
   *
   * @param {boolean} yn - Is the right mouse button down?
   */
  set rightDown(yn) {
     //@ts-ignore
    this._doSet(this.constructor.FLAGS.RIGHT_DOWN, yn);
  }

  /**
   * Did the left mouse button come down in the DisplayObject?
   *
   * @member {boolean}
   */
  get leftDown() {
     //@ts-ignore
    return (this._flags & this.constructor.FLAGS.LEFT_DOWN) !== 0;
  }

  /**
   * Set the left down flag
   *
   * @param {boolean} yn - Is the left mouse button down?
   */
  set leftDown(yn) {
     //@ts-ignore
    this._doSet(this.constructor.FLAGS.LEFT_DOWN, yn);
  }
}

InteractionTrackingData.FLAGS = Object.freeze({
  NONE: 0,
  OVER: 1 << 0,
  LEFT_DOWN: 1 << 1,
  RIGHT_DOWN: 1 << 2,
});
