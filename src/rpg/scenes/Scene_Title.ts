//-----------------------------------------------------------------------------
// Scene_Title
//
// The scene class of the title screen.

import * as SceneManager from "../managers/SceneManager";
// import * as ImageManager from '../managers/ImageManager';
import * as Graphics from "../core/Graphics";
import { Sprite } from "../core/Sprite";
import { Bitmap } from "../core/Bitmap";
// import * as PIXI from 'pixi.js';
import { ImageSprite } from "../next/ImageSprite";
import { Window_TitleCommand } from "../windows/Window_TitleCommand";
import { makeAsyncScene } from "../next/Scene_Async";

export const Scene_Title = makeAsyncScene(async (scene) => {
  // Schedule snapshot at termination
  scene.disposableStack.defer(() => {
    SceneManager.snapForBackground();
  });

  // createBackground
  // TODO: DataManager
  // this._backSprite1 = new Sprite(ImageManager.loadTitle1($dataSystem.title1Name));
  // this._backSprite2 = new Sprite(ImageManager.loadTitle2($dataSystem.title2Name));
  const [backSprite1, backSprite2] = await Promise.all([
    ImageSprite.load("img/titles1/Book").then((sprite) => sprite),
    ImageSprite.load("img/titles2/Floral").then((sprite) => sprite),
  ]);
  scene.addChild(backSprite1);
  scene.addChild(backSprite2);

  // createForeground()
  const gameTitleSprite = new Sprite(
    new Bitmap(Graphics.default.width, Graphics.default.height),
  );
  scene.addChild(gameTitleSprite);
  const drawGameTitle = () => {
    const x = 20;
    const y = Graphics.default.height / 4;
    const maxWidth = Graphics.default.width - x * 2;
    // TODO: DataManager
    // var text = $dataSystem.gameTitle;
    const text = "GAME TITLE HERE";
    const bitmap = gameTitleSprite.bitmap;
    if (!bitmap) {
      return;
    }
    bitmap.outlineColor = "black";
    bitmap.outlineWidth = 8;
    bitmap.fontSize = 72;
    bitmap.drawText(text, x, y, maxWidth, 48, "center");

    // debug:
    // this._gameTitleSprite!.scale = {x: 3, y: 3}
  };
  // TODO: DataManager
  // if ($dataSystem.optDrawTitle) {
  drawGameTitle();
  // }

  // createCommandWindow()
  scene.createWindowLayer();
  const commandWindow = new Window_TitleCommand();
  scene.addWindow(commandWindow);

  // Finish creation and start scene
  await scene.finishCreation();

  const centerSprite = (sprite: ImageSprite) => {
    sprite.position = {
      x: Graphics.default.width / 2,
      y: Graphics.default.height / 2,
    };
    sprite.anchor = { x: 0.5, y: 0.5 };
  };

  SceneManager.clearStack();
  centerSprite(backSprite1);
  centerSprite(backSprite2);

  // playTitleMusic()
  // TODO: AudioManager
  // AudioManager.playBgm($dataSystem.titleBgm);
  // AudioManager.stopBgs();
  // AudioManager.stopMe();

  // Scene start
  await scene.startFadeIn(scene.fadeSpeed(), false);
  await commandWindow.open();

  // Wait for a command
  let command;
  while (!command) {
    command = await commandWindow.waitForCommand();
  }
  await commandWindow.close();

  // Process commands
  if (command == "newGame") {
    // TODO: Scene_Map, DataManager, Window
    // DataManager.setupNewGame();
    await scene.fadeOutAll();
    // SceneManager.goto(Scene_Map);
  } else if (command == "continue") {
    // TODO: Scene_Load, Window
    // SceneManager.push(Scene_Load);
  } else if (command == "options") {
    // TODO: Scene_Options, Window
    // SceneManager.push(Scene_Options);
  }
});
