//-----------------------------------------------------------------------------
/**
 * The static class that handles input data from the keyboard and gamepads.
 *
 */

export enum KeyName {
  Ok = 'ok',
  Escape = 'escape', // Escape is keyboard only
  Cancel = 'cancel', // Cancel and Menu are gamepad only
  Menu = 'menu',
  Left = 'left',
  Up = 'up',
  Right = 'right',
  Down = 'down',
  Tab = 'tab',
  Shift = 'shift',
  Control = 'control',
  PageUp = 'pageup',
  PageDown = 'pagedown',
  Debug = 'debug'
}

export type KeyType = `${KeyName}`;
export const KeyNameValues: KeyType[] = Object.values(KeyName);

let _currentState: Record<KeyType, boolean> = {} as Record<KeyType, boolean>;
let _previousState: Record<KeyType, boolean> = {} as Record<KeyType, boolean>;
let _gamepadStates: Array<boolean[]> = [];
let _latestButton: KeyType | undefined = undefined;
let _pressedTime = 0;
let _dir4 = 0;
let _dir8 = 0;
let _preferredAxis = '';
let _date = 0;

/**
 * Initializes the input system.
 *
 * @static
 * @method initialize
 */
export const initialize = () => {
  clear();
  _wrapNwjsAlert();
  _setupEventHandlers();
};

/**
 * The wait time of the key repeat in frames.
 *
 * @static
 * @property keyRepeatWait
 * @type Number
 */
export const keyRepeatWait = 24;

/**
 * The interval of the key repeat in frames.
 *
 * @static
 * @property keyRepeatInterval
 * @type Number
 */
export const keyRepeatInterval = 6;

/**
 * A hash table to convert from a virtual key code to a mapped key name.
 *
 * @static
 * @property keyMapper
 */
export const keyMapper: Record<string, KeyType> = {
  Tab: 'tab', // tab
  Enter: 'ok', // enter
  ShiftLeft: 'shift', // shift
  ControlLeft: 'control', // control
  // NOTE: Disabled as it usually breaks things
  // "AltLeft": 'control',  // alt
  Escape: 'escape', // escape
  Space: 'ok', // space
  PageUp: 'pageup', // pageup
  PageDown: 'pagedown', // pagedown
  ArrowLeft: 'left', // left arrow
  ArrowUp: 'up', // up arrow
  ArrowRight: 'right', // right arrow
  ArrowDown: 'down', // down arrow
  Insert: 'escape', // insert
  KeyQ: 'pageup', // Q
  KeyW: 'pagedown', // W
  KeyX: 'escape', // X
  KeyZ: 'ok', // Z
  Numpad0: 'escape', // numpad 0
  Numpad2: 'down', // numpad 2
  Numpad4: 'left', // numpad 4
  Numpad6: 'right', // numpad 6
  Numpad8: 'up', // numpad 8
  F9: 'debug' // F9
};

/**
 * A hash table to convert from a gamepad button to a mapped key name.
 * NOTE: Some keys are hard-coded.
 *
 * @static
 * @property gamepadMapper
 */
export const gamepadMapper: Record<number, KeyType> = {
  0: 'ok', // A
  1: 'cancel', // B
  2: 'shift', // X
  3: 'menu', // Y
  4: 'pageup', // LB
  5: 'pagedown', // RB
  12: 'up', // D-pad up
  13: 'down', // D-pad down
  14: 'left', // D-pad left
  15: 'right' // D-pad right
};

/**
 * Clears all the input data.
 *
 * @static
 * @method clear
 */
export const clear = () => {
  _currentState = Object.fromEntries(KeyNameValues.map((k) => [k, false])) as Record<KeyType, boolean>;
  _previousState = Object.fromEntries(KeyNameValues.map((k) => [k, false])) as Record<KeyType, boolean>;
  _gamepadStates = [];
  _latestButton = undefined;
  _pressedTime = 0;
  _dir4 = 0;
  _dir8 = 0;
  _preferredAxis = '';
  _date = 0;
};

/**
 * Updates the input data.
 *
 * @static
 * @method update
 */
export const update = () => {
  _pollGamepads();
  if (_latestButton && _currentState[_latestButton]) {
    _pressedTime++;
  } else {
    _latestButton = undefined;
  }
  for (const nameVal in _currentState) {
    const name = nameVal as KeyType;
    if (_currentState[name] && !_previousState[name]) {
      _latestButton = name;
      _pressedTime = 0;
      _date = Date.now();
    }
    _previousState[name] = _currentState[name];
  }
  _updateDirection();
};

/**
 * Checks whether a key is currently pressed down.
 *
 * @static
 * @method isPressed
 * @param {String} keyName The mapped name of the key
 * @return {Boolean} True if the key is pressed
 */
export const isPressed = (keyName: KeyType) => {
  if (_isEscapeCompatible(keyName) && isPressed('escape')) {
    return true;
  } else {
    return !!_currentState[keyName];
  }
};

/**
 * Checks whether a key is just pressed.
 *
 * @static
 * @method isTriggered
 * @param {String} keyName The mapped name of the key
 * @return {Boolean} True if the key is triggered
 */
export const isTriggered = (keyName: KeyType) => {
  if (_isEscapeCompatible(keyName) && isTriggered('escape')) {
    return true;
  } else {
    return _latestButton === keyName && _pressedTime === 0;
  }
};

/**
 * Checks whether a key is just pressed or a key repeat occurred.
 *
 * @static
 * @method isRepeated
 * @param {String} keyName The mapped name of the key
 * @return {Boolean} True if the key is repeated
 */
export const isRepeated = (keyName: KeyType) => {
  if (_isEscapeCompatible(keyName) && isRepeated('escape')) {
    return true;
  } else {
    return (
      _latestButton === keyName &&
      (_pressedTime === 0 || (_pressedTime >= keyRepeatWait && _pressedTime % keyRepeatInterval === 0))
    );
  }
};

/**
 * Checks whether a key is kept depressed.
 *
 * @static
 * @method isLongPressed
 * @param {String} keyName The mapped name of the key
 * @return {Boolean} True if the key is long-pressed
 */
export const isLongPressed = (keyName: KeyType) => {
  if (_isEscapeCompatible(keyName) && isLongPressed('escape')) {
    return true;
  } else {
    return _latestButton === keyName && _pressedTime >= keyRepeatWait;
  }
};

/**
 * [read-only] The four direction value as a number of the numpad, or 0 for neutral.
 *
 * @static
 * @property dir4
 * @type Number
 */
export const dir4 = () => _dir4;

/**
 * [read-only] The eight direction value as a number of the numpad, or 0 for neutral.
 *
 * @static
 * @property dir8
 * @type Number
 */
export const dir8 = () => _dir8;

/**
 * [read-only] The time of the last input in milliseconds.
 *
 * @static
 * @property date
 * @type Number
 */
export const date = () => _date;

/**
 * @static
 * @method _wrapNwjsAlert
 * @private
 */
const _wrapNwjsAlert = () => {
  // if (Utils.isNwjs()) {
  //   var _alert = window.alert;
  //   window.alert = () => {
  //     var gui = require('nw.gui');
  //     var win = gui.Window.get();
  //     _alert.apply(this, arguments);
  //     win.focus();
  //     Input.clear();
  //   };
  // }
};

/**
 * @static
 * @method _setupEventHandlers
 * @private
 */
const _setupEventHandlers = () => {
  document.addEventListener('keydown', _onKeyDown);
  document.addEventListener('keyup', _onKeyUp);
  window.addEventListener('blur', _onLostFocus);
};

/**
 * @static
 * @method _onKeyDown
 * @param {KeyboardEvent} event
 * @private
 */
const _onKeyDown = (event: KeyboardEvent) => {
  if (_shouldPreventDefault(event.code)) {
    event.preventDefault();
  }
  if (event.code === 'NumLock') {
    // Numlock
    clear();
  }
  const buttonName = keyMapper[event.code];
  // NOTE: Does not make sense
  // if (ResourceHandler.exists() && buttonName === 'ok') {
  //   ResourceHandler.retry();
  // } else if (buttonName) {
  //   _currentState[buttonName] = true;
  // }
  if (buttonName) {
    _currentState[buttonName] = true;
  }
};

/**
 * @static
 * @method _shouldPreventDefault
 * @param {Number} keyCode
 * @private
 */
export const _shouldPreventDefault = (keyCode: string) => {
  switch (keyCode) {
    case 'Backspace': // backspace
    case 'PageUp': // pageup
    case 'PageDown': // pagedown
    case 'ArrowLeft': // left arrow
    case 'ArrowUp': // up arrow
    case 'ArrowRight': // right arrow
    case 'ArrowDown': // down arrow
      return true;
  }
  return false;
};

/**
 * @static
 * @method _onKeyUp
 * @param {KeyboardEvent} event
 * @private
 */
export const _onKeyUp = (event: KeyboardEvent) => {
  const buttonName = keyMapper[event.code];
  if (buttonName) {
    _currentState[buttonName] = false;
  }
  // if (event.code === 0) {  // For QtWebEngine on OS X
  //   clear();
  // }
};

/**
 * @static
 * @method _onLostFocus
 * @private
 */
export const _onLostFocus = () => {
  clear();
};

/**
 * @static
 * @method _pollGamepads
 * @private
 */
export const _pollGamepads = () => {
  if (navigator.getGamepads) {
    const gamepads = navigator.getGamepads();
    if (gamepads) {
      for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (gamepad && gamepad.connected) {
          _updateGamepadState(gamepad);
        }
      }
    }
  }
};

/**
 * @static
 * @method _updateGamepadState
 * @param {Gamepad} gamepad
 * @private
 */
const _updateGamepadState = (gamepad: Gamepad) => {
  const lastState = _gamepadStates[gamepad.index] || [];
  const newState = [];
  const buttons = gamepad.buttons;
  const axes = gamepad.axes;
  const threshold = 0.5;
  newState[12] = false;
  newState[13] = false;
  newState[14] = false;
  newState[15] = false;
  for (let i = 0; i < buttons.length; i++) {
    newState[i] = buttons[i].pressed;
  }
  if (axes[1] < -threshold) {
    newState[12] = true; // up
  } else if (axes[1] > threshold) {
    newState[13] = true; // down
  }
  if (axes[0] < -threshold) {
    newState[14] = true; // left
  } else if (axes[0] > threshold) {
    newState[15] = true; // right
  }
  for (let j = 0; j < newState.length; j++) {
    if (newState[j] !== lastState[j]) {
      const buttonName = gamepadMapper[j];
      if (buttonName) {
        _currentState[buttonName] = newState[j];
      }
    }
  }
  _gamepadStates[gamepad.index] = newState;
};

/**
 * @static
 * @method _updateDirection
 * @private
 */
export const _updateDirection = () => {
  let x = _signX();
  let y = _signY();

  _dir8 = _makeNumpadDirection(x, y);

  if (x !== 0 && y !== 0) {
    if (_preferredAxis === 'x') {
      y = 0;
    } else {
      x = 0;
    }
  } else if (x !== 0) {
    _preferredAxis = 'y';
  } else if (y !== 0) {
    _preferredAxis = 'x';
  }

  _dir4 = _makeNumpadDirection(x, y);
};

/**
 * @static
 * @method _signX
 * @private
 */
export const _signX = () => {
  let x = 0;

  if (isPressed('left')) {
    x--;
  }
  if (isPressed('right')) {
    x++;
  }
  return x;
};

/**
 * @static
 * @method _signY
 * @private
 */
export const _signY = () => {
  let y = 0;

  if (isPressed('up')) {
    y--;
  }
  if (isPressed('down')) {
    y++;
  }
  return y;
};

/**
 * @static
 * @method _makeNumpadDirection
 * @param {Number} x
 * @param {Number} y
 * @return {Number}
 * @private
 */
export const _makeNumpadDirection = (x: number, y: number) => {
  if (x !== 0 || y !== 0) {
    return 5 - y * 3 + x;
  }
  return 0;
};

/**
 * @static
 * @method _isEscapeCompatible
 * @param {String} keyName
 * @return {Boolean}
 * @private
 */
export const _isEscapeCompatible = (keyName: KeyType) => {
  return keyName === 'cancel' || keyName === 'menu';
};
