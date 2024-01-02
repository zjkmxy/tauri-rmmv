//-----------------------------------------------------------------------------
/**
 * The static class that handles input data from the mouse and touchscreen.
 *
 * @class TouchInput
 */

import * as PIXI from 'pixi.js';
import * as Graphics from './Graphics';

export class TouchInput {
  protected static _mousePressed = false;
  protected static _screenPressed = false;
  protected static _pressedTime = 0;
  protected static _events = {
    triggered: false,
    cancelled: false,
    moved: false,
    released: false,
    wheelX: 0,
    wheelY: 0
  };
  protected static _triggered = false;
  protected static _cancelled = false;
  protected static _moved = false;
  protected static _released = false;
  protected static _wheelX = 0;
  protected static _wheelY = 0;
  protected static _x = 0;
  protected static _y = 0;
  protected static _date = 0;

  private constructor() {}

  /**
   * Initializes the touch system.
   *
   * @static
   * @method initialize
   */
  public static initialize() {
    TouchInput.clear();
    TouchInput._setupEventHandlers();
  }

  /**
   * The wait time of the pseudo key repeat in frames.
   *
   * @static
   * @property keyRepeatWait
   * @type Number
   */
  public static keyRepeatWait = 24;

  /**
   * The interval of the pseudo key repeat in frames.
   *
   * @static
   * @property keyRepeatInterval
   * @type Number
   */
  public static keyRepeatInterval = 6;

  /**
   * Clears all the touch data.
   *
   * @static
   * @method clear
   */
  public static clear() {
    TouchInput._mousePressed = false;
    TouchInput._screenPressed = false;
    TouchInput._pressedTime = 0;
    TouchInput._events = {
      triggered: false,
      cancelled: false,
      moved: false,
      released: false,
      wheelX: 0,
      wheelY: 0
    };
    TouchInput._triggered = false;
    TouchInput._cancelled = false;
    TouchInput._moved = false;
    TouchInput._released = false;
    TouchInput._wheelX = 0;
    TouchInput._wheelY = 0;
    TouchInput._x = 0;
    TouchInput._y = 0;
    TouchInput._date = 0;
  }

  /**
   * Updates the touch data.
   *
   * @static
   * @method update
   */
  public static update() {
    TouchInput._triggered = TouchInput._events.triggered;
    TouchInput._cancelled = TouchInput._events.cancelled;
    TouchInput._moved = TouchInput._events.moved;
    TouchInput._released = TouchInput._events.released;
    TouchInput._wheelX = TouchInput._events.wheelX;
    TouchInput._wheelY = TouchInput._events.wheelY;
    TouchInput._events.triggered = false;
    TouchInput._events.cancelled = false;
    TouchInput._events.moved = false;
    TouchInput._events.released = false;
    TouchInput._events.wheelX = 0;
    TouchInput._events.wheelY = 0;
    if (TouchInput.isPressed()) {
      TouchInput._pressedTime++;
    }
  }

  /**
   * Checks whether the mouse button or touchscreen is currently pressed down.
   *
   * @static
   * @method isPressed
   * @return {Boolean} True if the mouse button or touchscreen is pressed
   */
  public static isPressed() {
    return TouchInput._mousePressed || TouchInput._screenPressed;
  }

  /**
   * Checks whether the left mouse button or touchscreen is just pressed.
   *
   * @static
   * @method isTriggered
   * @return {Boolean} True if the mouse button or touchscreen is triggered
   */
  public static isTriggered() {
    return TouchInput._triggered;
  }

  /**
   * Checks whether the left mouse button or touchscreen is just pressed
   * or a pseudo key repeat occurred.
   *
   * @static
   * @method isRepeated
   * @return {Boolean} True if the mouse button or touchscreen is repeated
   */
  public static isRepeated() {
    return (
      TouchInput.isPressed() &&
      (TouchInput._triggered ||
        (TouchInput._pressedTime >= TouchInput.keyRepeatWait &&
          TouchInput._pressedTime % TouchInput.keyRepeatInterval === 0))
    );
  }

  /**
   * Checks whether the left mouse button or touchscreen is kept depressed.
   *
   * @static
   * @method isLongPressed
   * @return {Boolean} True if the left mouse button or touchscreen is long-pressed
   */
  public static isLongPressed() {
    return TouchInput.isPressed() && TouchInput._pressedTime >= TouchInput.keyRepeatWait;
  }

  /**
   * Checks whether the right mouse button is just pressed.
   *
   * @static
   * @method isCancelled
   * @return {Boolean} True if the right mouse button is just pressed
   */
  public static isCancelled() {
    return TouchInput._cancelled;
  }

  /**
   * Checks whether the mouse or a finger on the touchscreen is moved.
   *
   * @static
   * @method isMoved
   * @return {Boolean} True if the mouse or a finger on the touchscreen is moved
   */
  public static isMoved() {
    return TouchInput._moved;
  }

  /**
   * Checks whether the left mouse button or touchscreen is released.
   *
   * @static
   * @method isReleased
   * @return {Boolean} True if the mouse button or touchscreen is released
   */
  public static isReleased() {
    return TouchInput._released;
  }

  /**
   * [read-only] The horizontal scroll amount.
   *
   * @static
   * @property wheelX
   * @type Number
   */
  static get wheelX() {
    return TouchInput._wheelX;
  }

  /**
   * [read-only] The vertical scroll amount.
   *
   * @static
   * @property wheelY
   * @type Number
   */
  static get wheelY() {
    return TouchInput._wheelY;
  }

  /**
   * [read-only] The x coordinate on the canvas area of the latest touch event.
   *
   * @static
   * @property x
   * @type Number
   */
  static get x() {
    return TouchInput._x;
  }

  /**
   * [read-only] The y coordinate on the canvas area of the latest touch event.
   *
   * @static
   * @property y
   * @type Number
   */
  static get y() {
    return TouchInput._y;
  }

  static get pos() {
    return new PIXI.Point(TouchInput.x, TouchInput.y);
  }

  /**
   * [read-only] The time of the last input in milliseconds.
   *
   * @static
   * @property date
   * @type Number
   */
  static get date() {
    return TouchInput._date;
  }

  /**
   * @static
   * @method _setupEventHandlers
   * @private
   */
  protected static _setupEventHandlers() {
    // const isSupportPassive = Utils.isSupportPassiveEvent();
    document.addEventListener('mousedown', TouchInput._onMouseDown);
    document.addEventListener('mousemove', TouchInput._onMouseMove);
    document.addEventListener('mouseup', TouchInput._onMouseUp);
    document.addEventListener('wheel', TouchInput._onWheel, { passive: false });
    document.addEventListener('touchstart', TouchInput._onTouchStart, { passive: false });
    document.addEventListener('touchmove', TouchInput._onTouchMove, { passive: false });
    document.addEventListener('touchend', TouchInput._onTouchEnd);
    document.addEventListener('touchcancel', TouchInput._onTouchCancel);
    document.addEventListener('pointerdown', TouchInput._onPointerDown, { passive: false });
    window.addEventListener('blur', TouchInput._onLostFocus);
  }

  /**
   * @static
   * @method _onMouseDown
   * @param {MouseEvent} event
   * @private
   */
  protected static _onMouseDown(event: MouseEvent) {
    if (event.button === 0) {
      TouchInput._onLeftButtonDown(event);
    } else if (event.button === 1) {
      TouchInput._onMiddleButtonDown(event);
    } else if (event.button === 2) {
      TouchInput._onRightButtonDown(event);
    }
  }

  /**
   * @static
   * @method _onLeftButtonDown
   * @param {MouseEvent} event
   * @private
   */
  protected static _onLeftButtonDown(event: MouseEvent) {
    const x = Graphics.pageToCanvasX(event.pageX);
    const y = Graphics.pageToCanvasY(event.pageY);
    if (Graphics.isInsideCanvas(x, y)) {
      TouchInput._mousePressed = true;
      TouchInput._pressedTime = 0;
      TouchInput._onTrigger(x, y);
    }
  }

  /**
   * @static
   * @method _onMiddleButtonDown
   * @param {MouseEvent} event
   * @private
   */
  protected static _onMiddleButtonDown(event: MouseEvent) {
    event;
  }

  /**
   * @static
   * @method _onRightButtonDown
   * @param {MouseEvent} event
   * @private
   */
  protected static _onRightButtonDown(event: MouseEvent) {
    const x = Graphics.pageToCanvasX(event.pageX);
    const y = Graphics.pageToCanvasY(event.pageY);
    if (Graphics.isInsideCanvas(x, y)) {
      TouchInput._onCancel(x, y);
    }
  }

  /**
   * @static
   * @method _onMouseMove
   * @param {MouseEvent} event
   * @private
   */
  protected static _onMouseMove(event: MouseEvent) {
    if (TouchInput._mousePressed) {
      const x = Graphics.pageToCanvasX(event.pageX);
      const y = Graphics.pageToCanvasY(event.pageY);
      TouchInput._onMove(x, y);
    }
  }

  /**
   * @static
   * @method _onMouseUp
   * @param {MouseEvent} event
   * @private
   */
  protected static _onMouseUp(event: MouseEvent) {
    if (event.button === 0) {
      const x = Graphics.pageToCanvasX(event.pageX);
      const y = Graphics.pageToCanvasY(event.pageY);
      TouchInput._mousePressed = false;
      TouchInput._onRelease(x, y);
    }
  }

  /**
   * @static
   * @method _onWheel
   * @param {WheelEvent} event
   * @private
   */
  protected static _onWheel(event: WheelEvent) {
    TouchInput._events.wheelX += event.deltaX;
    TouchInput._events.wheelY += event.deltaY;
    event.preventDefault();
  }

  /**
   * @static
   * @method _onTouchStart
   * @param {TouchEvent} event
   * @private
   */
  protected static _onTouchStart(event: TouchEvent) {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const x = Graphics.pageToCanvasX(touch.pageX);
      const y = Graphics.pageToCanvasY(touch.pageY);
      if (Graphics.isInsideCanvas(x, y)) {
        TouchInput._screenPressed = true;
        TouchInput._pressedTime = 0;
        if (event.touches.length >= 2) {
          TouchInput._onCancel(x, y);
        } else {
          TouchInput._onTrigger(x, y);
        }
        event.preventDefault();
      }
    }
    // if (window.cordova || window.navigator.standalone) {
    //   event.preventDefault();
    // }
  }

  /**
   * @static
   * @method _onTouchMove
   * @param {TouchEvent} event
   * @private
   */
  protected static _onTouchMove(event: TouchEvent) {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const x = Graphics.pageToCanvasX(touch.pageX);
      const y = Graphics.pageToCanvasY(touch.pageY);
      TouchInput._onMove(x, y);
    }
  }

  /**
   * @static
   * @method _onTouchEnd
   * @param {TouchEvent} event
   * @private
   */
  protected static _onTouchEnd(event: TouchEvent) {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const x = Graphics.pageToCanvasX(touch.pageX);
      const y = Graphics.pageToCanvasY(touch.pageY);
      TouchInput._screenPressed = false;
      TouchInput._onRelease(x, y);
    }
  }

  /**
   * @static
   * @method _onTouchCancel
   * @param {TouchEvent} event
   * @private
   */
  protected static _onTouchCancel(/*event: TouchEvent*/) {
    TouchInput._screenPressed = false;
  }

  /**
   * @static
   * @method _onPointerDown
   * @param {PointerEvent} event
   * @private
   */
  protected static _onPointerDown(event: PointerEvent) {
    if (event.pointerType === 'touch' && !event.isPrimary) {
      const x = Graphics.pageToCanvasX(event.pageX);
      const y = Graphics.pageToCanvasY(event.pageY);
      if (Graphics.isInsideCanvas(x, y)) {
        // For Microsoft Edge
        TouchInput._onCancel(x, y);
        event.preventDefault();
      }
    }
  }

  /**
   * @static
   * @method _onLostFocus
   * @private
   */
  protected static _onLostFocus() {
    TouchInput.clear();
  }

  /**
   * @static
   * @method _onTrigger
   * @param {Number} x
   * @param {Number} y
   * @private
   */
  protected static _onTrigger(x: number, y: number) {
    TouchInput._events.triggered = true;
    TouchInput._x = x;
    TouchInput._y = y;
    TouchInput._date = Date.now();
  }

  /**
   * @static
   * @method _onCancel
   * @param {Number} x
   * @param {Number} y
   * @private
   */
  protected static _onCancel(x: number, y: number) {
    TouchInput._events.cancelled = true;
    TouchInput._x = x;
    TouchInput._y = y;
  }

  /**
   * @static
   * @method _onMove
   * @param {Number} x
   * @param {Number} y
   * @private
   */
  protected static _onMove(x: number, y: number) {
    TouchInput._events.moved = true;
    TouchInput._x = x;
    TouchInput._y = y;
  }

  /**
   * @static
   * @method _onRelease
   * @param {Number} x
   * @param {Number} y
   * @private
   */
  protected static _onRelease(x: number, y: number) {
    TouchInput._events.released = true;
    TouchInput._x = x;
    TouchInput._y = y;
  }
}
