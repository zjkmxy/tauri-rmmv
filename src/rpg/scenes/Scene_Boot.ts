//-----------------------------------------------------------------------------
// Scene_Boot
//
// The scene class for initializing the entire game.

import { Scene_Base } from './Scene_Base';
import * as ImageManager from '../managers/ImageManager';
import * as Graphics from '../core/Graphics';
import * as SceneManager from '../managers/SceneManager';
import { Scene_Title } from './Scene_Title';

export class Scene_Boot extends Scene_Base {
  protected _startDate;

  constructor() {
    super();
    this._startDate = Date.now();
  }

  public async create() {
    await super.create();
    // DataManager.loadDatabase();
    // ConfigManager.load();
    this.loadSystemWindowImage();
  }

  public loadSystemWindowImage() {
    ImageManager.reserveSystem('Window');
  }

  static loadSystemImages() {
    ImageManager.reserveSystem('IconSet');
    ImageManager.reserveSystem('Balloon');
    ImageManager.reserveSystem('Shadow1');
    ImageManager.reserveSystem('Shadow2');
    ImageManager.reserveSystem('Damage');
    ImageManager.reserveSystem('States');
    ImageManager.reserveSystem('Weapons1');
    ImageManager.reserveSystem('Weapons2');
    ImageManager.reserveSystem('Weapons3');
    ImageManager.reserveSystem('ButtonSet');
  }

  public isReady() {
    if (super.isReady()) {
      // TODO: DataManager
      // return DataManager.isDatabaseLoaded() && this.isGameFontLoaded();
      return true;
    } else {
      return false;
    }
  }

  public isGameFontLoaded() {
    if (Graphics.isFontLoaded('GameFont')) {
      return true;
    } else if (!Graphics.canUseCssFontLoading()) {
      const elapsed = Date.now() - this._startDate;
      if (elapsed >= 60000) {
        throw new Error('Failed to load GameFont');
      }
    }
  }

  public start() {
    super.start();
    // TODO: DataManager, SoundManager, Window_TitleCommand
    // SoundManager.preloadImportantSounds();
    // if (DataManager.isBattleTest()) {
    //   DataManager.setupBattleTest();
    //   SceneManager.goto(Scene_Battle);
    // } else if (DataManager.isEventTest()) {
    //   DataManager.setupEventTest();
    //   SceneManager.goto(Scene_Map);
    // } else {
    //   this.checkPlayerLocation();
    //   DataManager.setupNewGame();
    //   SceneManager.goto(Scene_Title);
    //   Window_TitleCommand.initCommandPosition();
    // }
    SceneManager.gotoScene(Scene_Title);
    this.updateDocumentTitle();
  }

  public updateDocumentTitle() {
    // document.title = $dataSystem.gameTitle;
  }

  public checkPlayerLocation() {
    // if ($dataSystem.startMapId === 0) {
    //   throw new Error('Player\'s starting position is not set');
    // }
  }
}
