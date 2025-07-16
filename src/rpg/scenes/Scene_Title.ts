//-----------------------------------------------------------------------------
// Scene_Title
//
// The scene class of the title screen.

import { Scene_Base } from './Scene_Base';
import * as SceneManager from '../managers/SceneManager';
// import * as ImageManager from '../managers/ImageManager';
import * as Graphics from '../core/Graphics';
import { Sprite } from '../core/Sprite';
import { Bitmap } from '../core/Bitmap';
// import * as PIXI from 'pixi.js';
import { ImageSprite } from '../next/ImageSprite';
import { Window_TitleCommand } from '../windows/Window_TitleCommand';

export class Scene_Title extends Scene_Base {
  protected _gameTitleSprite: Sprite | undefined;
  protected _backSprite1: ImageSprite | undefined;
  protected _backSprite2: ImageSprite | undefined;
  protected _commandWindow: Window_TitleCommand | undefined;

  constructor() {
    super();
  }

  public override async create() {
    await super.create();
    await this.createBackground();
    this.createForeground();
    this.createWindowLayer();
    this.createCommandWindow();
  }

  public override async start() {
    super.start();
    SceneManager.clearStack();
    this.centerSprite(this._backSprite1!);
    this.centerSprite(this._backSprite2!);
    this.playTitleMusic();
  }

  public override async main() {
    // Scene start
    await this.startFadeIn(this.fadeSpeed(), false);
    await this._commandWindow!.open();

    // Wait for a command
    let command;
    while (!command) {
      command = await this._commandWindow!.waitForCommand();
    }
    await this._commandWindow!.close();

    // Process commands
    if (command == 'newGame') {
      // TODO: Scene_Map, DataManager, Window
      // DataManager.setupNewGame();
      await this.fadeOutAll();
      // SceneManager.goto(Scene_Map);
    } else if (command == 'continue') {
      // TODO: Scene_Load, Window
      // SceneManager.push(Scene_Load);
    } else if (command == 'options') {
      // TODO: Scene_Options, Window
      // SceneManager.push(Scene_Options);
    }
  }

  public override terminate() {
    super.terminate();
    SceneManager.snapForBackground();
  }

  public async createBackground() {
    // TODO: DataManager
    // this._backSprite1 = new Sprite(ImageManager.loadTitle1($dataSystem.title1Name));
    // this._backSprite2 = new Sprite(ImageManager.loadTitle2($dataSystem.title2Name));
    await Promise.all([
      ImageSprite.load('img/titles1/Book').then((sprite) => (this._backSprite1 = sprite)),
      ImageSprite.load('img/titles2/Floral').then((sprite) => (this._backSprite2 = sprite))
    ]);
    this.addChild(this._backSprite1!);
    this.addChild(this._backSprite2!);
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
    if (!this._gameTitleSprite || !this._gameTitleSprite.bitmap) {
      return;
    }
    const bitmap = this._gameTitleSprite.bitmap;
    bitmap.outlineColor = 'black';
    bitmap.outlineWidth = 8;
    bitmap.fontSize = 72;
    bitmap.drawText(text, x, y, maxWidth, 48, 'center');

    // debug:
    // this._gameTitleSprite!.scale = {x: 3, y: 3}
  }

  public centerSprite(sprite: ImageSprite) {
    // sprite.x = Graphics.default.width / 2;
    // sprite.y = Graphics.default.height / 2;
    // sprite.anchor.x = 0.5;
    // sprite.anchor.y = 0.5;
    sprite.position = {
      x: Graphics.default.width / 2,
      y: Graphics.default.height / 2
    };
    sprite.anchor = { x: 0.5, y: 0.5 };
  }

  public createCommandWindow() {
    this._commandWindow = new Window_TitleCommand();
    // this._commandWindow.setHandler('newGame', () => this.commandNewGame());
    // this._commandWindow.setHandler('continue', () => this.commandContinue());
    // this._commandWindow.setHandler('options', () => this.commandOptions());
    this.addWindow(this._commandWindow);
  }

  public playTitleMusic() {
    // TODO: AudioManager
    // AudioManager.playBgm($dataSystem.titleBgm);
    // AudioManager.stopBgs();
    // AudioManager.stopMe();
  }
}
