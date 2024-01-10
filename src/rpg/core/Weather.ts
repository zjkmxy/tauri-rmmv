//-----------------------------------------------------------------------------

import * as PIXI from 'pixi.js';
import { Stage } from './Stage';
import { ScreenSprite } from './ScreenSprite';
import Graphics from './Graphics';
import { DefaultFps } from './Interpolator';
import { mathRandomInt } from './JsExtensions';

export type WeatherType = 'none' | 'rain' | 'storm' | 'snow';

/**
 * The weather effect which displays rain, storm, or snow.
 * NOTE: This does not draw custom bitmaps. So we will follow ImageSprite.
 *       Also, you have to use [origin =] instead of setting parameters.
 *
 * @class Weather
 * @constructor
 */
export class Weather extends Stage {
  protected _type: WeatherType = 'none';
  protected _power: number = 0;
  protected _origin: PIXI.PointData = new PIXI.Point(0, 0);
  protected readonly _sprites: PIXI.Graphics[] = [];
  protected readonly _dimmerSprite: ScreenSprite;
  protected readonly _rainBitmap: PIXI.Graphics;
  protected readonly _stormBitmap: PIXI.Graphics;
  protected readonly _snowBitmap: PIXI.Graphics;

  constructor() {
    super();

    // _createDimmer
    this._dimmerSprite = new ScreenSprite();
    this._dimmerSprite.setColor(80, 80, 80);
    this.addChild(this._dimmerSprite);

    // _createBitmaps
    // this._rainBitmap = new Bitmap(1, 60);
    // this._rainBitmap.fillAll('white');
    // this._stormBitmap = new Bitmap(2, 100);
    // this._stormBitmap.fillAll('white');
    // this._snowBitmap = new Bitmap(9, 9);
    // this._snowBitmap.drawCircle(4, 4, 4, 'white');
    this._rainBitmap = new PIXI.Graphics().rect(0, 0, 1, 60).fill(0xffffff);
    this._stormBitmap = new PIXI.Graphics().rect(0, 0, 2, 100).fill(0xffffff);
    this._snowBitmap = new PIXI.Graphics().circle(4, 4, 4).fill(0xffffff);
  }

  /**
   * The type of the weather in ['none', 'rain', 'storm', 'snow'].
   *
   * @property type
   * @type WeatherType
   */
  public get type() {
    return this._type;
  }

  public set type(value: WeatherType) {
    if (value === this._type) {
      return;
    }
    const oldValue = this._type;
    this._type = value;
    // Re-create Sprite for textures.
    for (const [i, sprite] of this._sprites.entries()) {
      this.removeChild(sprite);
      if (value !== 'none') {
        const newSprite = this._newSprite()!;
        this._sprites[i] = newSprite;
      }
      sprite.destroy(false);
    }
    if (value === 'none') {
      this._sprites.splice(0, this._sprites.length);
    } else if (oldValue === 'none') {
      // Trigger creation
      const power = this._power;
      this._power = 0;
      this.power = power;
    }
  }

  /**
   * The power of the weather in the range (0, 9).
   *
   * @property power
   * @type Number
   */
  public get power() {
    return this._power;
  }

  public set power(value: number) {
    if (value === this._power) {
      return;
    }
    this._power = value;
    // _updateDimmer
    this._dimmerSprite.opacity = Math.floor(value * 6);
    // Create or remove
    const maxSprites = this.maxSprites;
    if (this._sprites.length < maxSprites) {
      const newSprites = Array.from({ length: maxSprites - this._sprites.length }, () => this._newSprite()!);
      this._sprites.push(...newSprites);
    } else {
      const removed = this._sprites.splice(maxSprites, this._sprites.length - maxSprites);
      for (const sprite of removed) {
        this.removeChild(sprite);
        sprite.destroy(false);
      }
    }
  }

  protected _newSprite() {
    let ret: PIXI.Graphics | undefined;
    switch (this._type) {
      case 'rain':
        ret = this._rainBitmap.clone();
        break;
      case 'storm':
        ret = this._stormBitmap.clone();
        break;
      case 'snow':
        ret = this._snowBitmap.clone();
        break;
      default:
        return undefined;
    }
    ret.alpha = 0;
    this.addChild(ret);
    return ret;
  }

  /**
   * The origin point of the weather for scrolling.
   *
   * @property origin
   * @type Point
   */
  public get origin() {
    return this._origin;
  }

  public set origin(value: PIXI.PointData) {
    this._origin = new PIXI.Point(value.x, value.y);
    // NOTE: In this implementation, we set the sprite's position to simulate origin.

    this._boundOrigin();
    this.position = new PIXI.Point(-this._origin.x, -this._origin.y);
  }

  public get maxSprites() {
    return this._type === 'none' ? 0 : this._power * 10;
  }

  protected _boundOrigin() {
    // Origin is changed smoothly, no burst.
    if (this._origin.x < -Graphics.width) {
      this._origin.x += Graphics.width;
      for (const sprite of this._sprites) {
        sprite.x -= Graphics.width;
      }
    } else if (this._origin.x > Graphics.width) {
      this._origin.x -= Graphics.width;
      for (const sprite of this._sprites) {
        sprite.x += Graphics.width;
      }
    }
    if (this._origin.y < -Graphics.height) {
      this._origin.y += Graphics.height;
      for (const sprite of this._sprites) {
        sprite.y -= Graphics.height;
      }
    } else if (this._origin.y > Graphics.height) {
      this._origin.y -= Graphics.height;
      for (const sprite of this._sprites) {
        sprite.y += Graphics.height;
      }
    }
  }

  /**
   * @method _updateSprite
   * @param {Sprite} sprite
   * @private
   */
  protected _updateSprite(sprite: PIXI.Graphics, delta: number) {
    switch (this._type) {
      case 'rain':
        Weather._updateRainSprite(sprite, delta);
        break;
      case 'storm':
        Weather._updateStormSprite(sprite, delta);
        break;
      case 'snow':
        Weather._updateSnowSprite(sprite, delta);
        break;
    }
    if (sprite.alpha < 40 / 255) {
      this._rebornSprite(sprite);
    }
  }

  /**
   * @method _updateRainSprite
   * @param {Sprite} sprite
   * @private
   */
  protected static _updateRainSprite(sprite: PIXI.Graphics, delta: number) {
    // sprite.bitmap = this._rainBitmap;
    sprite.rotation = Math.PI / 16;
    // sprite.ax -= 6 * Math.sin(sprite.rotation);
    // sprite.ay += 6 * Math.cos(sprite.rotation);
    // sprite.opacity -= 6;
    sprite.x -= 6 * Math.sin(sprite.rotation) * delta * DefaultFps;
    sprite.y += 6 * Math.cos(sprite.rotation) * delta * DefaultFps;
    sprite.alpha -= (6 / 255) * delta * DefaultFps;
  }

  /**
   * @method _updateStormSprite
   * @param {Sprite} sprite
   * @private
   */
  protected static _updateStormSprite(sprite: PIXI.Graphics, delta: number) {
    sprite.rotation = Math.PI / 8;
    // sprite.ax -= 8 * Math.sin(sprite.rotation);
    // sprite.ay += 8 * Math.cos(sprite.rotation);
    sprite.x -= 8 * Math.sin(sprite.rotation) * delta * DefaultFps;
    sprite.y += 8 * Math.cos(sprite.rotation) * delta * DefaultFps;
    // sprite.opacity -= 8;
    sprite.alpha -= (8 / 255) * delta * DefaultFps;
  }

  /**
   * @method _updateSnowSprite
   * @param {Sprite} sprite
   * @private
   */
  protected static _updateSnowSprite(sprite: PIXI.Graphics, delta: number) {
    // sprite.bitmap = this._snowBitmap;
    sprite.rotation = Math.PI / 16;
    // sprite.ax -= 3 * Math.sin(sprite.rotation);
    // sprite.ay += 3 * Math.cos(sprite.rotation);
    // sprite.opacity -= 3;
    sprite.x -= 3 * Math.sin(sprite.rotation) * delta * DefaultFps;
    sprite.y += 3 * Math.cos(sprite.rotation) * delta * DefaultFps;
    sprite.alpha -= (3 / 255) * delta * DefaultFps;
  }

  /**
   * @method _updateAllSprites
   * @private
   */
  protected _updateAllSprites(delta: number) {
    for (const sprite of this._sprites) {
      this._updateSprite(sprite, delta);
    }
  }

  /**
   * @method _rebornSprite
   * @param {Sprite} sprite
   * @private
   */
  protected _rebornSprite(sprite: PIXI.Graphics) {
    sprite.x = mathRandomInt(Graphics.width + 100) - 100 + this.origin.x;
    sprite.y = mathRandomInt(Graphics.height + 200) - 200 + this.origin.y;
    sprite.alpha = (160 + mathRandomInt(60)) / 255;
  }

  public updateDelta(delta: number) {
    this._updateAllSprites(delta);
    // super.updateDelta(delta);  // No need to
  }

  public update() {
    // Prevent unnecessary call on children.
  }
}
