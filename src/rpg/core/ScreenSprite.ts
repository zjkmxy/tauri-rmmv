import * as PIXI from 'pixi.js';
import { numberClamp } from './JsExtensions';
import * as Utils from '../core/Utils';
import * as Graphics from '../core/Graphics';

//-----------------------------------------------------------------------------
/**
 * The sprite which covers the entire game screen.
 *
 * @class ScreenSprite
 * @constructor
 */
export class ScreenSprite extends PIXI.Container {
  protected readonly _graphics;

  protected _red = -1;
  protected _green = -1;
  protected _blue = -1;
  protected _colorText = '';

  constructor() {
    super();

    this._graphics = new PIXI.Graphics();
    this.addChild(this._graphics);
    this.opacity = 0;

    this.setBlack();
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

  get anchor() {
    // ScreenSprite.warnYep();
    // this.scale = { x: 1, y: 1 };
    // return { x: 0, y: 0 };
    throw new Error('Should not be called');
  }

  set anchor(value: number) {
    throw new Error('Should not be called');
    // this.alpha = numberClamp(value, 0, 255) / 255;
  }

  get blendMode() {
    return this._graphics.blendMode;
  }

  set blendMode(value) {
    this._graphics.blendMode = value;
  }

  /**
   * Sets black to the color of the screen sprite.
   *
   * @method setBlack
   */
  public setBlack() {
    this.setColor(0, 0, 0);
  }

  /**
   * Sets white to the color of the screen sprite.
   *
   * @method setWhite
   */
  public setWhite() {
    this.setColor(255, 255, 255);
  }

  /**
   * Sets the color of the screen sprite by values.
   *
   * @method setColor
   * @param {Number} r The red value in the range (0, 255)
   * @param {Number} g The green value in the range (0, 255)
   * @param {Number} b The blue value in the range (0, 255)
   */
  public setColor(r?: number, g?: number, b?: number) {
    if (this._red !== r || this._green !== g || this._blue !== b) {
      r = numberClamp(Math.round(r ?? 0), 0, 255);
      g = numberClamp(Math.round(g ?? 0), 0, 255);
      b = numberClamp(Math.round(b ?? 0), 0, 255);
      this._red = r;
      this._green = g;
      this._blue = b;
      this._colorText = Utils.rgbToCssColor(r, g, b);

      const graphics = this._graphics;
      graphics.clear();
      const intColor = (r << 16) | (g << 8) | b;
      // graphics.beginFill(intColor, 1);
      //whole screen with zoom. BWAHAHAHAHA
      // graphics.drawRect(-Graphics.width * 5, -Graphics.height * 5, Graphics.width * 10, Graphics.height * 10);
      graphics
        .rect(
          -Graphics.default.width * 5,
          -Graphics.default.height * 5,
          Graphics.default.width * 10,
          Graphics.default.height * 10
        )
        .fill({ color: intColor, alpha: 1 });
    }
  }
}
