//=============================================================================

import * as SceneManager from '../managers/SceneManager';
import * as ImageManager from '../managers/ImageManager';
import * as Utils from '../core/Utils';
import * as Graphics from '../core/Graphics';
import { Stage } from '../core/Stage';
import { ScreenSprite } from '../core/ScreenSprite';
import { Interpolator, LinearInterpolator } from '../core/Interpolator';
import { WindowLayer } from '../core/WindowLayer';
import { CoreWindow } from '../core/Window';

export type SceneClass = new () => Scene_Base;

/**
 * The Superclass of all scene within the game.
 *
 * @class Scene_Base
 * @constructor
 * @extends Stage
 */
export class Scene_Base extends Stage {
  protected _active: boolean = false;
  protected _createDone: boolean = false;
  // protected _fadeSign: number = 0;
  // protected _fadeDuration: number = 0;
  protected _fadeInterpolator: Interpolator | undefined;
  protected _fadeResolver: (() => void) | undefined;
  protected _fadeSprite: ScreenSprite | undefined = undefined;
  readonly _imageReservationId: number;
  protected _windowLayer: WindowLayer | undefined;
  protected _mainRunning: boolean = false;

  /**
   * Constructor
   * All subclasses must have parameter-less constructors.
   */
  constructor() {
    super();
    this._imageReservationId = Utils.generateRuntimeId();
  }

  /**
   * Attach a reservation to the reserve queue.
   *
   * @method attachReservation
   * @instance
   * @memberof Scene_Base
   */
  public attachReservation() {
    ImageManager.setDefaultReservationId(this._imageReservationId);
  }

  /**
   * Remove the reservation from the Reserve queue.
   *
   * @method detachReservation
   * @instance
   * @memberof Scene_Base
   */
  public detachReservation() {
    ImageManager.releaseReservation(this._imageReservationId);
  }

  /**
   * Create the components and add them to the rendering process.
   *
   * @method create
   * @instance
   * @memberof Scene_Base
   */
  protected async create() {}

  /**
   * Create the components and add them to the rendering process.
   * This is the non-blocking version.
   *
   * @method create
   * @instance
   * @memberof Scene_Base
   */
  public createScene() {
    (async () => {
      await this.create();
      this._createDone = true;
    })();
  }

  /**
   * Returns whether the scene is active or not.
   *
   * @method isActive
   * @instance
   * @memberof Scene_Base
   * @return {Boolean} return true if the scene is active
   */
  public isActive() {
    return this._active;
  }

  /**
   * Return whether the scene is ready to start or not.
   *
   * @method isReady
   * @instance
   * @memberof Scene_Base
   * @return {Boolean} Return true if the scene is ready to start
   */
  public isReady() {
    return this._createDone && ImageManager.isReady();
  }

  /**
   * Start the scene processing.
   *
   * @method start
   * @instance
   * @memberof Scene_Base
   */
  public start() {
    this._active = true;
  }

  /**
   * Update the scene processing each new frame. (old frame based)
   *
   * @method update
   * @instance
   * @memberof Scene_Base
   */
  // public update() {
  //   this.updateChildren();
  //   this.updateFade();
  // }

  /**
   * Update the scene processing each new frame. (old frame based)
   *
   * @method update
   * @instance
   * @memberof Scene_Base
   */
  public override updateDelta(delta: number) {
    // this.updateChildren();
    super.updateDelta(delta);
    this.updateFade(delta);
  }

  /**
   * Stop the scene processing.
   *
   * @method stop
   * @instance
   * @memberof Scene_Base
   */
  public stop() {
    this._active = false;
  }

  /**
   * Return whether the scene is busy or not.
   *
   * @method isBusy
   * @instance
   * @memberof Scene_Base
   * @return {Boolean} Return true if the scene is currently busy
   */
  public isBusy(): boolean {
    // return this._fadeDuration > 0;
    return !!this._fadeInterpolator || this._mainRunning;
  }

  /**
   * Terminate the scene before switching to a another scene.
   *
   * @method terminate
   * @instance
   * @memberof Scene_Base
   */
  public terminate() {}

  /**
   * Create the layer for the windows children
   * and add it to the rendering process.
   *
   * @method createWindowLayer
   * @instance
   * @memberof Scene_Base
   */
  public createWindowLayer() {
    const width = Graphics.default.boxWidth;
    const height = Graphics.default.boxHeight;
    const x = (Graphics.default.width - width) / 2;
    const y = (Graphics.default.height - height) / 2;
    this._windowLayer = new WindowLayer();
    this._windowLayer.move(x, y, width, height);
    this.addChild(this._windowLayer);
  }

  /**
   * Add the children window to the windowLayer processing.
   *
   * @method addWindow
   * @instance
   * @memberof Scene_Base
   */
  public addWindow(window: CoreWindow) {
    this._windowLayer!.addChild(window);
  }

  /**
   * Request a fadeIn screen process.
   *
   * @method startFadeIn
   * @param {Number} [duration=30] The time the process will take for fadeIn the screen
   * @param {Boolean} [white=false] If true the fadein will be process with a white color else it's will be black
   *
   * @instance
   * @memberof Scene_Base
   */
  public startFadeIn(duration = 30, white = false): Promise<void> {
    this.createFadeSprite(white);
    // this._fadeSign = 1;
    // this._fadeDuration = duration;
    this._fadeInterpolator = LinearInterpolator.fromFrame(255, 0, duration);
    this._fadeSprite!.opacity = 255;

    return new Promise<void>((resolve) => {
      this._fadeResolver = resolve;
    });
  }

  /**
   * Request a fadeOut screen process.
   *
   * @method startFadeOut
   * @param {Number} [duration=30] The time the process will take for fadeOut the screen
   * @param {Boolean} [white=false] If true the fadeOut will be process with a white color else it's will be black
   *
   * @instance
   * @memberof Scene_Base
   */
  public startFadeOut(duration = 30, white = false): Promise<void> {
    this.createFadeSprite(white);
    // this._fadeSign = -1;
    // this._fadeDuration = duration;
    this._fadeInterpolator = LinearInterpolator.fromFrame(0, 255, duration);
    this._fadeSprite!.opacity = 0;

    return new Promise<void>((resolve) => {
      this._fadeResolver = resolve;
    });
  }

  /**
   * Create a Screen sprite for the fadein and fadeOut purpose and
   * add it to the rendering process.
   *
   * @method createFadeSprite
   * @instance
   * @memberof Scene_Base
   */
  public createFadeSprite(white = false) {
    if (!this._fadeSprite) {
      this._fadeSprite = new ScreenSprite();
      this.addChild(this._fadeSprite);
    }
    if (white) {
      this._fadeSprite.setWhite();
    } else {
      this._fadeSprite.setBlack();
    }
  }

  /**
   * Update the screen fade processing.
   *
   * @method updateFade
   * @instance
   * @memberof Scene_Base
   */
  public updateFade(delta: number) {
    // if (this._fadeDuration > 0) {
    //   const d = this._fadeDuration;
    //   if (this._fadeSign > 0) {
    //     this._fadeSprite!.opacity -= this._fadeSprite!.opacity / d;
    //   } else {
    //     this._fadeSprite!.opacity += (255 - this._fadeSprite!.opacity) / d;
    //   }
    //   this._fadeDuration--;
    // }
    if (this._fadeInterpolator) {
      this._fadeSprite!.opacity = this._fadeInterpolator.updateDelta(delta);
      if (this._fadeInterpolator.done) {
        this._fadeResolver?.();
        this._fadeInterpolator = undefined;
        this._fadeResolver = undefined;
      }
    }
  }

  /**
   * Pop the scene from the stack array and switch to the
   * previous scene.
   *
   * @method popScene
   * @instance
   * @memberof Scene_Base
   */
  public popScene() {
    SceneManager.pop();
  }

  /**
   * Check whether the game should be triggering a gameover.
   *
   * @method checkGameover
   * @instance
   * @memberof Scene_Base
   */
  public checkGameover() {
    // TODO: GameParty
    // if ($gameParty.isAllDead()) {
    //   SceneManager.goto(Scene_Gameover);
    // }
  }

  /**
   * Slowly fade out all the visual and audio of the scene.
   *
   * @method fadeOutAll
   * @instance
   * @memberof Scene_Base
   */
  public async fadeOutAll() {
    // const time = this.slowFadeSpeed() / 60;
    // TODO: AudioManager
    // AudioManager.fadeOutBgm(time);
    // AudioManager.fadeOutBgs(time);
    // AudioManager.fadeOutMe(time);
    return await this.startFadeOut(this.slowFadeSpeed());
  }

  /**
   * Return the screen fade speed value.
   *
   * @method fadeSpeed
   * @instance
   * @memberof Scene_Base
   * @return {Number} Return the fade speed
   */
  public fadeSpeed() {
    return 24;
  }

  /**
   * Return a slow screen fade speed value.
   *
   * @method slowFadeSpeed
   * @instance
   * @memberof Scene_Base
   * @return {Number} Return the fade speed
   */
  public slowFadeSpeed() {
    return this.fadeSpeed() * 2;
  }

  public async main() {}

  public async startMain() {
    this._mainRunning = true;
    await this.main();
    this._mainRunning = false;
  }
}
