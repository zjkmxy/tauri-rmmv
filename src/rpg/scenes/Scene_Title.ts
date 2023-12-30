//-----------------------------------------------------------------------------
// Scene_Title
//
// The scene class of the title screen.

import { Scene_Base } from './Scene_Base';
import * as SceneManager from '../managers/SceneManager';
import * as ImageManager from '../managers/ImageManager';
import * as Graphics from '../core/Graphics';
import { Sprite } from '../core/Sprite';
import { Bitmap } from '../core/Bitmap';
import { Point } from 'pixi.js';

export class Scene_Title extends Scene_Base {
  protected _gameTitleSprite: Sprite | undefined;
  protected _backSprite1: Sprite | undefined;
  protected _backSprite2: Sprite | undefined;

  constructor() {
    super();
  }

  public override async create() {
    await super.create();
    this.createBackground();
    this.createForeground();
    this.createWindowLayer();
    this.createCommandWindow();

    // DEBUG: create a new Sprite from an image path
    // const texture = await PIXI.Assets.load('/bunny.png');
    // this.bunny = PIXI.Sprite.from(texture);
  }

  public override start() {
    super.start();
    SceneManager.clearStack();
    this.centerSprite(this._backSprite1!);
    this.centerSprite(this._backSprite2!);
    this.playTitleMusic();
    this.startFadeIn(this.fadeSpeed(), false);
  }

  public override update() {
    if (!this.isBusy()) {
      // TODO: Window
      // this._commandWindow.open();
    }
    super.update();
  }

  public override updateDelta(delta: number): void {
    super.updateDelta(delta);
  }

  public override isBusy() {
    // TODO: Window
    // return this._commandWindow.isClosing() || Scene_Base.prototype.isBusy.call(this);
    return super.isBusy();
  }

  public override terminate() {
    super.terminate();
    SceneManager.snapForBackground();
  }

  public createBackground() {
    // TODO: DataManager
    // this._backSprite1 = new Sprite(ImageManager.loadTitle1($dataSystem.title1Name));
    // this._backSprite2 = new Sprite(ImageManager.loadTitle2($dataSystem.title2Name));
    this._backSprite1 = new Sprite(ImageManager.loadTitle1('Book'));
    this._backSprite2 = new Sprite(ImageManager.loadTitle2('Floral'));
    this.addChild(this._backSprite1);
    this.addChild(this._backSprite2);
  }

  public createForeground() {
    this._gameTitleSprite = new Sprite(new Bitmap(Graphics.default.width, Graphics.default.height));
    this.addChild(this._gameTitleSprite);
    // TODO: DataManager
    // if ($dataSystem.optDrawTitle) {
    this.drawGameTitle();
    // }
  }

  public drawGameTitle() {
    const x = 20;
    const y = Graphics.default.height / 4;
    const maxWidth = Graphics.default.width - x * 2;
    // TODO: DataManager
    // var text = $dataSystem.gameTitle;
    const text = 'GAME TITLE HERE';
    if (!this._gameTitleSprite) {
      return;
    }
    this._gameTitleSprite.bitmap!.outlineColor = 'black';
    this._gameTitleSprite.bitmap!.outlineWidth = 8;
    this._gameTitleSprite.bitmap!.fontSize = 72;
    this._gameTitleSprite.bitmap!.drawText(text, x, y, maxWidth, 48, 'center');
  }

  public centerSprite(sprite: Sprite) {
    // sprite.x = Graphics.default.width / 2;
    // sprite.y = Graphics.default.height / 2;
    // sprite.anchor.x = 0.5;
    // sprite.anchor.y = 0.5;
    sprite.position = { x: Graphics.default.width / 2, y: Graphics.default.height / 2 };
    sprite.anchor = new Point(0.5, 0.5);
  }

  public createCommandWindow() {
    // TODO: Window
    // this._commandWindow = new Window_TitleCommand();
    // this._commandWindow.setHandler('newGame',  this.commandNewGame.bind(this));
    // this._commandWindow.setHandler('continue', this.commandContinue.bind(this));
    // this._commandWindow.setHandler('options',  this.commandOptions.bind(this));
    // this.addWindow(this._commandWindow);
  }

  public commandNewGame() {
    // TODO: Scene_Map, DataManager, Window
    // DataManager.setupNewGame();
    // this._commandWindow.close();
    this.fadeOutAll();
    // SceneManager.goto(Scene_Map);
  }

  public commandContinue() {
    // TODO: Scene_Load, Window
    // this._commandWindow.close();
    // SceneManager.push(Scene_Load);
  }

  public commandOptions() {
    // TODO: Scene_Options, Window
    // this._commandWindow.close();
    // SceneManager.push(Scene_Options);
  }

  public playTitleMusic() {
    // TODO: AudioManager
    // AudioManager.playBgm($dataSystem.titleBgm);
    // AudioManager.stopBgs();
    // AudioManager.stopMe();
  }
}
