//-----------------------------------------------------------------------------

import * as PIXI from 'pixi.js';
import { Sprite } from './Sprite';
import { Stage } from './Stage';
import { numberClamp } from './JsExtensions';

export type TilingSpriteOptions = {
  frame?: PIXI.Rectangle;
  width?: number;
  height?: number;
};

/**
 * The sprite object for a tiling image.
 * NOTE: This does not draw custom bitmaps. So we will follow ImageSprite.
 *       Also, you have to use [origin =] instead of setting parameters.
 *
 * @class TilingSprite
 * @constructor
 * @param {Bitmap} bitmap The image for the tiling sprite
 */
export class TilingSprite extends Stage {
  readonly impl: PIXI.TilingSprite;
  _frame: PIXI.Rectangle;
  public readonly spriteId: number;
  private _scrollOrigin: PIXI.PointData = new PIXI.Point();

  constructor(
    public readonly source: PIXI.TextureSource,
    opt?: TilingSpriteOptions
  ) {
    super();
    this._frame = opt?.frame ?? new PIXI.Rectangle(0, 0, source.width, source.height);
    this.spriteId = Sprite._counter++;

    this.impl = new PIXI.TilingSprite({
      texture: new PIXI.Texture({
        source: this.source,
        frame: this._frame
      }),
      width: opt?.width ?? 0,
      height: opt?.height ?? 0
    });
    this.addChild(this.impl);
  }

  // Need to override width and height since the container's width and height are always 0.

  public override get width() {
    return this.impl.width;
  }
  public override set width(value: number) {
    this.impl.width = value;
  }

  public override get height() {
    return this.impl.height;
  }
  public override set height(value: number) {
    this.impl.height = value;
  }

  /**
   * The opacity of the tiling sprite (0 to 255).
   *
   * @property opacity
   * @type Number
   */
  public get opacity() {
    return this.alpha * 255;
  }

  public set opacity(value) {
    this.alpha = numberClamp(value, 0, 255) / 255;
  }

  /**
   * Sets the x, y, width, and height all at once.
   *
   * @method move
   * @param {Number} x The x coordinate of the tiling sprite
   * @param {Number} y The y coordinate of the tiling sprite
   * @param {Number} width The width of the tiling sprite
   * @param {Number} height The height of the tiling sprite
   */
  public move(x?: number, y?: number, width?: number, height?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.width = width ?? 0;
    this.height = height ?? 0;
  }

  /**
   * Specifies the region of the image that the tiling sprite will use.
   *
   * @method setFrame
   * @param {Number} x The x coordinate of the frame
   * @param {Number} y The y coordinate of the frame
   * @param {Number} width The width of the frame
   * @param {Number} height The height of the frame
   */
  public setFrame(x?: number, y?: number, width?: number, height?: number) {
    this._frame = new PIXI.Rectangle(x ?? 0, y ?? 0, width ?? this.source.width, height ?? this.source.height);
    this._refresh();
  }

  /**
   * @method _refresh
   * @private
   */
  protected _refresh() {
    // const frame = this._frame.clone();
    // if (frame.width === 0 && frame.height === 0 && this._bitmap) {
    //   frame.width = this._bitmap.width;
    //   frame.height = this._bitmap.height;
    // }
    // this.texture.frame = frame;
    // this.texture._updateID++;
    // this.tilingTexture = null;
    this.impl.texture = new PIXI.Texture({
      source: this.source,
      frame: this._frame
    });
  }

  // updateTransform(opts: Partial<PIXI.UpdateTransformOptions>): this {
  //   super.updateTransform(opts);
  //   this.impl.tilePosition = new PIXI.Point(
  //     Math.round(-this.origin.x),
  //     Math.round(-this.origin.y)
  //   );
  //   return this;
  // }

  /**
   * The origin point of the tiling sprite for scrolling.
   *
   * @property origin
   * @type Point
   */
  public get scrollOrigin() {
    return this._scrollOrigin;
  }

  public set scrollOrigin(value: PIXI.PointData) {
    this._scrollOrigin = value;
    this.impl.tilePosition = new PIXI.Point(Math.round(-this._scrollOrigin.x), Math.round(-this._scrollOrigin.y));
  }

  static async load(fullPath: string, opt?: TilingSpriteOptions) {
    const texture = await PIXI.Assets.load<PIXI.Texture>(fullPath);
    return new TilingSprite(texture.source, opt);
  }
}
