//-----------------------------------------------------------------------------
// Scene_MapOnly
//
// The scene containing the map only

import * as PIXI from 'pixi.js';
import * as SceneManager from '../managers/SceneManager';
import * as ImageManager from '../managers/ImageManager';
import * as Graphics from '../core/Graphics';
import { Sprite } from '../core/Sprite';
import { Bitmap } from '../core/Bitmap';
import { ShaderTilemap } from '../core/ShaderTilemap';
import { makeAsyncScene } from '../next/Scene_Async';
import { readWwwFile } from '../core/Utils';
import { JsonEx } from '../core/JsonEx';

// A temporary scene paint the tilemap
export const Scene_MapOnly = makeAsyncScene(async (scene) => {
  // Schedule snapshot at termination
  scene.disposableStack.defer(() => {
    SceneManager.snapForBackground();
  });

  const tilesetsFile = await readWwwFile('data/Tilesets.json');
  const tilesetsData = JsonEx.parse(new TextDecoder().decode(tilesetsFile));

  const mapFile = await readWwwFile('data/Map001.json');
  const mapData = JsonEx.parse(new TextDecoder().decode(mapFile));

  const tileset = tilesetsData[mapData.tilesetId];
  const tilesetNames = tileset.tilesetNames;

  const bitmaps = [];

  for (const tileName of tilesetNames) {
    if (tileName.length > 0) {
      const texture = await PIXI.Assets.load<PIXI.Texture>(`img/tilesets/${tileName}`);
      bitmaps.push(texture);
    } else {
      bitmaps.push(undefined);
    }
  }

  const tilemap = new ShaderTilemap();

  tilemap.bitmaps = [...bitmaps];
  tilemap.flags = tileset.flags;
  tilemap.setData(mapData.width, mapData.height, mapData.data);
  tilemap.refresh();

  scene.addChild(tilemap);

  // Finish creation and start scene
  await scene.finishCreation();

  // Scene start
  await scene.startFadeIn(scene.fadeSpeed(), false);

  // Scene update
  let animTime = 0;
  scene.on('updateDelta', (dt) => {
    let dt2 = dt;
    const w1 = tilemap.tileWidth * tilemap.mapWidth;
    const h1 = tilemap.tileHeight * tilemap.mapHeight;
    const x1 = tilemap.origin.x;
    const y1 = tilemap.origin.y;
    let x2 = 0;
    let y2 = 0;

    const at2 = animTime + dt2;

    x2 = (Math.max(0, w1 - 800) * (Math.cos(at2 * 0.5) + 1)) / 2;
    y2 = (Math.max(0, h1 - 600) * (Math.sin(at2 * 0.4) + 1)) / 2;

    animTime += dt2;
    tilemap.origin = { x: x2, y: y2 };
    tilemap.refresh();
  });

  await new Promise(() => {}); // Hang forever
});
