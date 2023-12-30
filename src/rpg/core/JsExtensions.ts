//-----------------------------------------------------------------------------
/**
 * This is not a class, but contains some methods that will be added to the
 * standard Javascript objects.
 *
 * @class JsExtensions
 */

/**
 * Returns a number whose value is limited to the given range.
 *
 * @method Number.prototype.clamp
 * @param {Number} min The lower boundary
 * @param {Number} max The upper boundary
 * @return {Number} A number in the range (min, max)
 */
export const numberClamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
// Number.prototype.clamp = function(min, max) {
//   return Math.min(Math.max(this, min), max);
// };

/**
 * Returns a modulo value which is always positive.
 *
 * @method Number.prototype.mod
 * @param {Number} n The divisor
 * @return {Number} A modulo value
 */
export const numberMod = (v: number, n: number) => ((v % n) + n) % n;
// Number.prototype.mod = function(n) {
//   return ((this % n) + n) % n;
// };

/**
 * Replaces %1, %2 and so on in the string to the arguments.
 *
 * @method String.prototype.format
 * @param {Any} ...args The objects to format
 * @return {String} A formatted string
 */
export const stringFormat = (v: string, ...args: unknown[]) =>
  v.replace(/%([0-9]+)/g, (_, n) => String(args[Number(n) - 1]));
// String.prototype.format = function() {
//   var args = arguments;
//   return this.replace(/%([0-9]+)/g, function(s, n) {
//       return args[Number(n) - 1];
//   });
// };

/**
 * Makes a number string with leading zeros.
 *
 * @method String.prototype.padZero
 * @param {Number} length The length of the output string
 * @return {String} A string with leading zeros
 */
export const stringPadZero = (v: string, length: number) => v.padStart(length, '0');
// String.prototype.padZero = function (length) {
//   var s = this;
//   while (s.length < length) {
//     s = '0' + s;
//   }
//   return s;
// };

/**
 * Makes a number string with leading zeros.
 *
 * @method Number.prototype.padZero
 * @param {Number} length The length of the output string
 * @return {String} A string with leading zeros
 */
export const numberPadZero = (v: number, length: number) => stringPadZero(`${v}`, length);
// Number.prototype.padZero = function (length) {
//   return String(this).padZero(length);
// };

// Object.defineProperties(Array.prototype, {
//   /**
//    * Checks whether the two arrays are same.
//    *
//    * @method Array.prototype.equals
//    * @param {Array} array The array to compare to
//    * @return {Boolean} True if the two arrays are same
//    */
//   equals: {
//     enumerable: false,
//     value: function (array) {
//       if (!array || this.length !== array.length) {
//         return false;
//       }
//       for (var i = 0; i < this.length; i++) {
//         if (this[i] instanceof Array && array[i] instanceof Array) {
//           if (!this[i].equals(array[i])) {
//             return false;
//           }
//         } else if (this[i] !== array[i]) {
//           return false;
//         }
//       }
//       return true;
//     }
//   },
//   /**
//    * Makes a shallow copy of the array.
//    *
//    * @method Array.prototype.clone
//    * @return {Array} A shallow copy of the array
//    */
//   clone: {
//     enumerable: false,
//     value: function () {
//       return this.slice(0);
//     }
//   },
//   /**
//    * Checks whether the array contains a given element.
//    *
//    * @method Array.prototype.contains
//    * @param {Any} element The element to search for
//    * @return {Boolean} True if the array contains a given element
//    */
//   contains: {
//     enumerable: false,
//     value: function (element) {
//       return this.indexOf(element) >= 0;
//     }
//   }
// });

/**
 * Checks whether the two arrays are same.
 *
 * @method Array.prototype.equals
 * @param {Array} array The array to compare to
 * @return {Boolean} True if the two arrays are same
 */
export const arrayEquals = (lhs?: unknown[], rhs?: unknown[]) => {
  if (!lhs && !rhs) {
    return true;
  }
  if (!lhs || !rhs || rhs.length != lhs.length) {
    return false;
  }
  for (const [i, lv] of lhs.entries()) {
    const rv = rhs[i];
    if (lv instanceof Array && rv instanceof Array) {
      if (!arrayEquals(lv, rv)) {
        return false;
      }
    } else if (lv !== rv) {
      return false;
    }
  }
  return true;
};

/**
 * Makes a shallow copy of the array.
 *
 * @method Array.prototype.clone
 * @return {Array} A shallow copy of the array
 */
export const arrayClone = <T>(v: T[]) => v.slice(0);

/**
 * Checks whether the array contains a given element.
 *
 * @method Array.prototype.contains
 * @param {Any} element The element to search for
 * @return {Boolean} True if the array contains a given element
 */
export const arrayContains = (v: unknown[], element: unknown) => v.includes(element);

/**
 * Checks whether the string contains a given string.
 *
 * @method String.prototype.contains
 * @param {String} str The string to search for
 * @return {Boolean} True if the string contains a given string
 */
export const stringContains = (v: string, str: string) => v.includes(str);
// String.prototype.contains = function (string) {
//   return this.indexOf(string) >= 0;
// };

/**
 * Generates a random integer in the range (0, max-1).
 *
 * @static
 * @method Math.randomInt
 * @param {Number} max The upper boundary (excluded)
 * @return {Number} A random integer
 */
export const mathRandomInt = (max: number) => Math.floor(max * Math.random());
// Math.randomInt = function (max) {
//   return Math.floor(max * Math.random());
// };
