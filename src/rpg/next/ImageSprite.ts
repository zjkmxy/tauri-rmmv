import * as PIXI from 'pixi.js';
import { Stage } from '../core/Stage';
import { ColorArray } from '../core/Sprite';
import { arrayEquals, numberClamp } from '../core/JsExtensions';

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

export type ImageSpriteOptions = {
  frame?: PIXI.Rectangle;
  tone?: ColorArray;
  blend?: ColorArray;
  hue?: number;
  blur?: number;
};

/**
 * The class of Sprite that directly uses a Texture, without a Bitmap.
 * The source is immutable.
 */
export class ImageSprite extends Stage {
  public readonly impl = new PIXI.Sprite();

  protected _blendColor: ColorArray;
  protected _colorTone: ColorArray;
  protected _hue: number;
  protected _blur: number;
  protected _blurFilter: PIXI.BlurFilter | undefined;
  protected _tintFilter: PIXI.ColorMatrixFilter | undefined;

  protected _frame: PIXI.Rectangle;
  protected _realFrame = new PIXI.Rectangle();

  protected _updateFilters() {
    if (!this._tintFilter) {
      this._tintFilter = new PIXI.ColorMatrixFilter();
    }
    if (this._blur > 0 && !this._blurFilter) {
      this._blurFilter = new PIXI.BlurFilter({ strength: this._blur });
    }
    // hue shift
    if (this._hue > 0) {
      this._tintFilter.hue(this._hue, true);
    }
    // grey de-saturation
    const [tr, tg, tb, grey] = this._colorTone;
    if (grey != 0) {
      this._tintFilter.saturate(-grey / 255, true);
    }
    // Add extra color as tint tone
    // prettier-ignore
    if (tr != 0 || tg != 0 || tb != 0) {
      this._tintFilter.matrix = ColorMatMultiply(this._tintFilter.matrix, [
        1, 0, 0, 0, tr / 255,
        0, 1, 0, 0, tg / 255,
        0, 0, 1, 0, tb / 255,
        0, 0, 0, 1, 0
      ]);
    }
    // Blend in extra color
    const [br, bg, bb, ba] = this._blendColor;
    // prettier-ignore
    if (ba > 0) {
      this._tintFilter.matrix = ColorMatMultiply(this._tintFilter.matrix, [
        1 - ba / 255, 0, 0, 0, ((br / 255) * ba) / 255,
        0, 1 - ba / 255, 0, 0, ((bg / 255) * ba) / 255,
        0, 0, 1 - ba / 255, 0, ((bb / 255) * ba) / 255,
        0, 0, 0, 1, 0
      ]);
    }
    // Set filter layer
    if (this._blurFilter) {
      this.filters = [this._blurFilter, this._tintFilter];
    } else {
      this.filters = [this._tintFilter];
    }
  }

  constructor(
    public readonly source: PIXI.TextureSource,
    opt?: ImageSpriteOptions
  ) {
    super();

    this._frame = opt?.frame ?? new PIXI.Rectangle(0, 0, source.width, source.height);
    this._hue = opt?.hue ?? 0;
    this._blur = opt?.blur ?? 0;
    this._colorTone = opt?.tone ?? [0, 0, 0, 0];
    this._blendColor = opt?.blend ?? [0, 0, 0, 0];

    this.addChild(this.impl);
    this._refresh();
    this._updateFilters();
  }

  public _refresh() {
    const inputFrame = new PIXI.Rectangle(
      Math.floor(this._frame.x),
      Math.floor(this._frame.y),
      Math.floor(this._frame.width),
      Math.floor(this._frame.height)
    );
    const realX = numberClamp(inputFrame.x, 0, this.source.width);
    const realY = numberClamp(inputFrame.y, 0, this.source.height);
    const realW = numberClamp(inputFrame.width - realX + inputFrame.x, 0, this.source.width - realX);
    const realH = numberClamp(inputFrame.height - realY + inputFrame.y, 0, this.source.height - realY);
    this._realFrame = new PIXI.Rectangle(realX, realY, realW, realH);

    this.pivot.x = inputFrame.x - realX;
    this.pivot.y = inputFrame.y - realY;

    this.impl.texture = new PIXI.Texture({
      source: this.source,
      frame: this._realFrame
    });
  }

  get texture() {
    return this.impl.texture;
  }

  /**
   * The width of the sprite without the scale.
   *
   * @property width
   * @type Number
   */
  get width() {
    return this._frame.width;
  }

  set width(value: number) {
    this._frame.width = value;
    this._refresh();
  }

  /**
   * The height of the sprite without the scale.
   *
   * @property height
   * @type Number
   */
  get height() {
    return this._frame.height;
  }

  set height(value: number) {
    this._frame.height = value;
    this._refresh();
  }

  /**
   * The opacity of the sprite (0 to 255).
   *
   * @property opacity
   * @type Number
   */
  get opacity() {
    return this.alpha * 255;
  }

  set opacity(value: number) {
    this.alpha = numberClamp(value, 0, 255) / 255;
  }

  /**
   * Sets the x and y at once.
   *
   * @method move
   * @param {Number} x The x coordinate of the sprite
   * @param {Number} y The y coordinate of the sprite
   */
  public move(x: number, y: number) {
    [this.x, this.y] = [x, y];
  }

  /**
   * The rectagle of the bitmap that the sprite displays.
   */
  public get frame() {
    return this._frame.clone();
  }

  public set frame(value: PIXI.Rectangle) {
    const frame = this._frame;
    if (value.x !== frame.x || value.y !== frame.y || value.width !== frame.width || value.height !== frame.height) {
      this._frame = value.clone();
      this._refresh();
    }
  }

  /**
   * The blend color for the sprite.
   * Blended color is mixed into the sprite as an extra material:
   *
   * `realColor = originalColor * (1 - blendAlpha) + blendColor * blendAlpha`
   *
   * Applied after blur, hue and tone.
   *
   * Value range: `0~255`.
   */
  public get blendColor(): ColorArray {
    return [...this._blendColor];
  }

  public set blendColor([r, g, b, a]: ColorArray) {
    if (!arrayEquals(this._blendColor, [r, g, b, a])) {
      this._blendColor = [r, g, b, a];
      this._updateFilters();
    }
  }

  /**
   * The color tone for the sprite.
   * The RBG part of the color tone added to the sprite as a drift:
   *
   * `realColor = originalColor + colorTone`
   *
   * Applied after hue and before blend.
   *
   * The Alpha part of the color tone is considered as ratio of desaturation.
   * When it is `255`, the sprite will become completely grey.
   *
   * Value range: `-255~255` for all comonents
   */
  public get colorTone(): ColorArray {
    return [...this._colorTone];
  }

  public set colorTone([r, g, b, gray]: ColorArray) {
    if (!arrayEquals(this._colorTone, [r, g, b, gray])) {
      this._colorTone = [r, g, b, gray];
      this._updateFilters();
    }
  }

  /**
   * The color hue rotation for the sprite in degrees.
   * Value range: `0~360`
   */
  public get hue(): number {
    return this._hue;
  }

  public set hue(value: number) {
    if (this._hue !== value) {
      this._hue = value;
      this._updateFilters();
    }
  }

  /**
   * Applies a blur effect to the bitmap.
   * - `0` for no effect.
   * - `1` for the default blur implemented by the original RMMV.
   */
  public get blur(): number {
    return this._blur;
  }

  public set blur(value: number) {
    if (this._blur !== value) {
      this._blur = value;
      this._updateFilters();
    }
  }

  /**
   * The origin point of the sprite. (0,0) to (1,1).
   *
   * @property anchor
   * @type Point
   */
  get anchor() {
    return this.impl.anchor;
  }

  set anchor(value) {
    this.impl.anchor = value;
  }

  static async load(fullPath: string, opt?: ImageSpriteOptions) {
    const texture = await PIXI.Assets.load<PIXI.Texture>(fullPath);
    return new ImageSprite(texture.source, opt);
  }
}
