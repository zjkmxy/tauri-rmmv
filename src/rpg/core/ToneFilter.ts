import * as PIXI from 'pixi.js';
import { numberClamp } from './JsExtensions';

export interface FilterImpl {
  _loadMatrix(matrix: PIXI.ColorMatrix, multiply?: boolean): void;
}

export const ColorMatMultiply = (a: PIXI.ColorMatrix, b: PIXI.ColorMatrix): PIXI.ColorMatrix => [
  // Red Channel
  a[0] * b[0] + a[1] * b[5] + a[2] * b[10] + a[3] * b[15],
  a[0] * b[1] + a[1] * b[6] + a[2] * b[11] + a[3] * b[16],
  a[0] * b[2] + a[1] * b[7] + a[2] * b[12] + a[3] * b[17],
  a[0] * b[3] + a[1] * b[8] + a[2] * b[13] + a[3] * b[18],
  a[0] * b[4] + a[1] * b[9] + a[2] * b[14] + a[3] * b[19] + a[4],
  // Green Channel
  a[5] * b[0] + a[6] * b[5] + a[7] * b[10] + a[8] * b[15],
  a[5] * b[1] + a[6] * b[6] + a[7] * b[11] + a[8] * b[16],
  a[5] * b[2] + a[6] * b[7] + a[7] * b[12] + a[8] * b[17],
  a[5] * b[3] + a[6] * b[8] + a[7] * b[13] + a[8] * b[18],
  a[5] * b[4] + a[6] * b[9] + a[7] * b[14] + a[8] * b[19] + a[9],
  // Blue Channel
  a[10] * b[0] + a[11] * b[5] + a[12] * b[10] + a[13] * b[15],
  a[10] * b[1] + a[11] * b[6] + a[12] * b[11] + a[13] * b[16],
  a[10] * b[2] + a[11] * b[7] + a[12] * b[12] + a[13] * b[17],
  a[10] * b[3] + a[11] * b[8] + a[12] * b[13] + a[13] * b[18],
  a[10] * b[4] + a[11] * b[9] + a[12] * b[14] + a[13] * b[19] + a[14],
  // Alpha Channel
  a[15] * b[0] + a[16] * b[5] + a[17] * b[10] + a[18] * b[15],
  a[15] * b[1] + a[16] * b[6] + a[17] * b[11] + a[18] * b[16],
  a[15] * b[2] + a[16] * b[7] + a[17] * b[12] + a[18] * b[17],
  a[15] * b[3] + a[16] * b[8] + a[17] * b[13] + a[18] * b[18],
  a[15] * b[4] + a[16] * b[9] + a[17] * b[14] + a[18] * b[19] + a[19]
];

/** The color matrix filter for WebGL. */
export class ToneFilter extends PIXI.ColorMatrixFilter {
  /**
   * Changes the hue.
   *
   * @method adjustHue
   * @param {Number} value The hue value in the range (-360, 360)
   */
  public adjustHue(hue: number) {
    return this.hue(hue, true);
  }

  /**
   * Changes the saturation.
   *
   * @method adjustSaturation
   * @param {Number} value The saturation value in the range (-255, 255)
   */
  public adjustSaturation(value: number = 0) {
    value = numberClamp(value, -255, 255) / 255;
    return this.saturate(value, true);
  }

  /**
   * Changes the tone.
   *
   * @method adjustTone
   * @param {Number} r The red strength in the range (-255, 255)
   * @param {Number} g The green strength in the range (-255, 255)
   * @param {Number} b The blue strength in the range (-255, 255)
   */
  // prettier-ignore
  public adjustTone(r: number, g: number, b: number) {
    r = numberClamp(r, -255, 255) / 255;
    g = numberClamp(g, -255, 255) / 255;
    b = numberClamp(b, -255, 255) / 255;
    this.matrix = ColorMatMultiply(this.matrix, [
      1, 0, 0, r, 0,
      0, 1, 0, g, 0,
      0, 0, 1, b, 0,
      0, 0, 0, 1, 0
    ]);
  }

  // prettier-ignore
  public blendColor(r: number, g: number, b: number, a: number) {
    r = numberClamp(r, -255, 255) / 255;
    g = numberClamp(g, -255, 255) / 255;
    b = numberClamp(b, -255, 255) / 255;
    a = numberClamp(a, -255, 255) / 255;
    this.matrix = ColorMatMultiply(this.matrix, [
      1 - a, 0, 0, 0, r * a,
      0, 1 - a, 0, 0, g * a,
      0, 0, 1 - a, 0, b * a,
      0, 0, 0, 1, 0
    ]);
  }
}
