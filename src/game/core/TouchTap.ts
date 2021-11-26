/**
 * @name touchtap-event
 * @description A lightweight JavaScript library that adds a touchtap custom event to the document which can be listened to on any element. This will only emit an event on touch enabled devices or those emulating touch devices. It works by listening to various touch events to dispatch the event if the touchstart and touchend events were in approximately the same position and took <= 200ms.
 * @version V2.0.1
 * @event touchtap 
 * @author Daniel Imms
 * @see http://github.com/Tyriar/touchtap-event
 * @copyright Copyright 2014 Daniel Imms
 * @license MIT license <http://github.com/Tyriar/touchtap-event/blob/master/LICENSE>
 * @modifed VisualSource
 */
 export default class TouchTap {
    private touchTapEvent: any;
    private isTapLength: boolean;
    private tapLengthTimeout: any;
    private startPosition = { x: -1, y: -1 };
    private currentPosition = { x: -1, y: -1 };
    constructor(target: any = document){
        try {
            this.touchstart = this.touchstart.bind(this);
            this.touchend = this.touchend.bind(this);
            this.touchmove = this.touchmove.bind(this);
            // The basic events module is supported by most browsers, including IE9 and newer.
            // https://developer.mozilla.org/en-US/docs/Web/API/Document/createEvent#Example
            this.touchTapEvent = document.createEvent('Event');
            this.touchTapEvent.initEvent('touchtap', true, true);
      
            // EventTarget.addEventListener() is supported by most browsers, including IE9 and newer.
            // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Browser_compatibility
            target.addEventListener('touchstart', this.touchstart, false);
            target.addEventListener('touchend', this.touchend, false);
            target.addEventListener('touchcancel', this.touchend, false);
            target.addEventListener('touchmove', this.touchmove, false);
          }
          catch (err) {
            // Ignore "Object doesn't support this property or method" in IE8 and earlier.
          }
    }
    public dispose(target: any = document){
        target.removeEventListener('touchstart', this.touchstart, false);
        target.removeEventListener('touchend', this.touchend, false);
        target.removeEventListener('touchcancel', this.touchend, false);
        target.removeEventListener('touchmove', this.touchmove, false);
    }
    /**
   * Gets the touch object from a touch* event.
   * @param {Event} e The event.
   * @returns {Touch} The (first) touch object from the event.
   */
    private getTouchObject(e: any): Touch {
        if (e.originalEvent && e.originalEvent.targetTouches) {
        return e.originalEvent.targetTouches[0];
        }
        if (e.targetTouches) {
        return e.targetTouches[0];
        }
        return e;
    }
   /**
   * Gets whether two numbers are approximately equal to each other.
   * @param {number} a The first number.
   * @param {number} b The second number.
   * @returns {Boolean}
   */
    private approximatelyEqual(a: number, b: number): boolean {
        return Math.abs(a - b) < 2;
    }
     /**
   * Handler for the touchstart event.
   * @param {Event} e The touchstart event.
   */
   private touchstart(e: any) {
    const touchObject = this.getTouchObject(e);
    this.startPosition.x = touchObject.pageX;
    this.startPosition.y = touchObject.pageY;
    this.currentPosition.x = touchObject.pageX;
    this.currentPosition.y = touchObject.pageY;
    this.isTapLength = true;
    if (this.tapLengthTimeout) {
      clearTimeout(this.tapLengthTimeout);
    }
    this.tapLengthTimeout = setTimeout(()=> {
        this.isTapLength = false;
    }, 200);
  }

   /**
   * Handler for the touchend event.
   * @param {Event} e The touchend event.
   */
    private touchend(e: any) {
        if (this.isTapLength &&
            this.approximatelyEqual(this.startPosition.x, this.currentPosition.x) &&
            this.approximatelyEqual(this.startPosition.y, this.currentPosition.y)) {
          this.touchTapEvent.customData = {
            touchX: this.currentPosition.x,
            touchY: this.currentPosition.y
          };
          e.target.dispatchEvent(this.touchTapEvent);
        }
      }

      /**
   * Handler for the touchmove event.
   * @param {Event} e The touchmove event.
   */
    private touchmove(e: any) {
        const touchObject = this.getTouchObject(e);
        this.currentPosition.x = touchObject.pageX;
        this.currentPosition.y = touchObject.pageY;
    }
}