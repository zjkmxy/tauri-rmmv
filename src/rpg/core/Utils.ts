//-----------------------------------------------------------------------------
/**
 * The static class that defines utility methods.
 *
 * @class Utils
 */

import { fs, path } from '@tauri-apps/api';

/**
 * The name of the RPG Maker. 'MV' in the current version.
 *
 * @static
 * @property RPGMAKER_NAME
 * @type String
 * @final
 */
export const RPGMAKER_NAME = 'TAURI-MV';

/**
 * The version of the RPG Maker.
 *
 * @static
 * @property RPGMAKER_VERSION
 * @type String
 * @final
 */
export const RPGMAKER_VERSION = '1.6.1';

export const RPGMAKER_ENGINE = 'community-1.3b';

/**
 * Checks whether the option is in the query string.
 *
 * @static
 * @method isOptionValid
 * @param {String} name The option name
 * @return {Boolean} True if the option is in the query string
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const isOptionValid = function (name: string) {
  // TOOD: See who uses this.
  // if (location.search.slice(1).split('&').contains(name)) {
  //   return true;
  // }
  // if (typeof nw !== "undefined" &&
  //   nw.App.argv.length > 0 &&
  //   nw.App.argv[0].split('&').contains(name)
  // ) {
  //   return true;
  // }
  // return false;
  return false;
};

/**
 * Checks whether the platform is NW.js.
 *
 * @static
 * @method isNwjs
 * @return {Boolean} True if the platform is NW.js
 */
export const isNwjs = function () {
  // return typeof require === 'function' && typeof process === 'object';
  throw new Error('Should not call this');
};

/**
 * Checks whether the platform is a mobile device.
 *
 * @static
 * @method isMobileDevice
 * @return {Boolean} True if the platform is a mobile device
 */
export const isMobileDevice = function () {
  // var r = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  // return !!navigator.userAgent.match(r);
  return false;
};

/**
 * Checks whether the browser is Mobile Safari.
 *
 * @static
 * @method isMobileSafari
 * @return {Boolean} True if the browser is Mobile Safari
 */
export const isMobileSafari = function () {
  // var agent = navigator.userAgent;
  // return !!(agent.match(/iPhone|iPad|iPod/) && agent.match(/AppleWebKit/) &&
  //           !agent.match('CriOS'));
  return false;
};

/**
 * Checks whether the browser is Android Chrome.
 *
 * @static
 * @method isAndroidChrome
 * @return {Boolean} True if the browser is Android Chrome
 */
export const isAndroidChrome = function () {
  // var agent = navigator.userAgent;
  // return !!(agent.match(/Android/) && agent.match(/Chrome/));
  return false;
};

/**
 * Checks whether the browser can read files in the game folder.
 *
 * @static
 * @method canReadGameFiles
 * @return {Boolean} True if the browser can read files in the game folder
 */
export const canReadGameFiles = function () {
  // var scripts = document.getElementsByTagName('script');
  // var lastScript = scripts[scripts.length - 1];
  // var xhr = new XMLHttpRequest();
  // try {
  //     xhr.open('GET', lastScript.src);
  //     xhr.overrideMimeType('text/javascript');
  //     xhr.send();
  //     return true;
  // } catch (e) {
  //     return false;
  // }
  return true;
};

/**
 * Makes a CSS color string from RGB values.
 *
 * @static
 * @method rgbToCssColor
 * @param {Number} r The red value in the range (0, 255)
 * @param {Number} g The green value in the range (0, 255)
 * @param {Number} b The blue value in the range (0, 255)
 * @return {String} CSS color string
 */
export const rgbToCssColor = function (r: number, g: number, b: number) {
  r = Math.round(r);
  g = Math.round(g);
  b = Math.round(b);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
};

export let _id = 1;
export const generateRuntimeId = function () {
  return _id++;
};

export const _supportPassiveEvent = null;
/**
 * Test this browser support passive event feature
 *
 * @static
 * @method isSupportPassiveEvent
 * @return {Boolean} this browser support passive event or not
 */
export const isSupportPassiveEvent = function () {
  // if (typeof export const _supportPassiveEvent === "boolean") {
  //     return export const _supportPassiveEvent;
  // }
  // // test support passive event
  // // https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
  // var passive = false;
  // var options = Object.defineProperty({}, "passive", {
  //     get: function() { passive = true; }
  // });
  // window.addEventListener("test", null, options);
  // export const _supportPassiveEvent = passive;
  // return passive;
  return true;
};

// --------- Newly added

export const readPublicFile = async (fileUri: string) => {
  const filePath = await path.resolveResource('public/' + fileUri);
  return await fs.readBinaryFile(filePath, {});
};
