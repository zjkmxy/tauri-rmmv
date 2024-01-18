//-----------------------------------------------------------------------------

import { CompositeTilemap } from '../../tilemap';
import { Tilemap } from './Tilemap';

/**
 * The tilemap which displays 2D tile-based game map using shaders
 *
 * @class Tilemap
 * @constructor
 */
export class ShaderTilemap extends Tilemap {
  roundPixels = false;
  protected _lastBitmapLength = -1;
  // protected _needsRepaint = false;
  protected _lastStartX: number | undefined;
  protected _lastStartY: number | undefined;

  public lowerLayer: CompositeTilemap[];
  public upperLayer: CompositeTilemap[];
  public shadowLayer: CompositeTilemap;

  constructor(
    /** Whether to paint the whole map at once */
    public readonly paintAll = false
  ) {
    super();

    // @hackerham: create layers only in initialization. Doesn't depend on width/height
    // Adapted from old _createLayers
    this.lowerLayer = Array.from({ length: 4 }, () => new CompositeTilemap());
    this.addChild(this.lowerLayer[0], this.lowerLayer[1]);
    this.shadowLayer = new CompositeTilemap();
    this.addChild(this.shadowLayer);
    this.addChild(this.lowerLayer[2], this.lowerLayer[3]);
    this.upperLayer = Array.from({ length: 4 }, () => new CompositeTilemap());
    this.addChild(...this.upperLayer);

    this._createLayers();

    this.refresh();
  }

  /**
   * Forces to repaint the entire tilemap AND update bitmaps list if needed
   *
   * @method refresh
   */
  public refresh() {
    if (this._lastBitmapLength !== this.bitmaps.length) {
      this._lastBitmapLength = this.bitmaps.length;
      this._updateBitmaps();
    }
    // this._needsRepaint = true;
    this._repaint(true);
  }

  /**
   * Updates bitmaps list
   *
   * @method refresh
   * @private
   */
  protected _updateBitmaps() {
    // const bitmaps = this.bitmaps;
    // this.lowerLayer.tileset(bitmaps);
    // this.upperLayer.tileset(bitmaps);
    for (const layer of this.lowerLayer) {
      layer.tileset(this.bitmaps);
    }
    for (const layer of this.upperLayer) {
      layer.tileset(this.bitmaps);
    }
  }

  /**
   * @method updateTransform
   * @private
   */
  public override _repaint(force: boolean) {
    let ox: number;
    let oy: number;

    if (this.roundPixels) {
      ox = Math.floor(this.origin.x);
      oy = Math.floor(this.origin.y);
    } else {
      ox = this.origin.x;
      oy = this.origin.y;
    }
    if (this.paintAll) {
      this._updateLayerPositions(0, 0);
      if (force) {
        this._paintAllTiles(0, 0);
      }
    } else {
      const startX = Math.floor((ox - this._margin) / this._tileWidth);
      const startY = Math.floor((oy - this._margin) / this._tileHeight);

      this._updateLayerPositions(startX, startY);
      if (force || this._lastStartX !== startX || this._lastStartY !== startY) {
        this._lastStartX = startX;
        this._lastStartY = startY;
        this._paintAllTiles(startX, startY);
        // this._needsRepaint = false;
      }
    }
    // this._sortChildren();
    // super.updateTransform();
  }

  protected override updateTileAnim(x: number, y: number) {
    // this.lowerLayer.setTileAnim({ x, y });
    // this.upperLayer.setTileAnim({ x, y });
    for (const layer of this.lowerLayer) {
      layer.setTileAnim({ x, y });
    }
    for (const layer of this.upperLayer) {
      layer.setTileAnim({ x, y });
    }
  }

  /**
   * @method _createLayers
   * @private
   */
  protected override _createLayers() {
    // const width = this._width;
    // const height = this._height;
    // const margin = this._margin;
    // const tileCols = Math.ceil(width / this._tileWidth) + 1;
    // const tileRows = Math.ceil(height / this._tileHeight) + 1;
    // const layerWidth = this._layerWidth = tileCols * this._tileWidth;
    // const layerHeight = this._layerHeight = tileRows * this._tileHeight;

    // this._needsRepaint = true;
    this._repaint(true);
  }

  /**
   * @method _updateLayerPositions
   * @param {Number} startX
   * @param {Number} startY
   * @private
   */
  protected _updateLayerPositions(startX: number, startY: number) {
    let ox: number;
    let oy: number;

    if (this.roundPixels) {
      ox = Math.floor(this.origin.x);
      oy = Math.floor(this.origin.y);
    } else {
      ox = this.origin.x;
      oy = this.origin.y;
    }
    // this.lowerLayer.position = {
    //     x: (startX * this._tileWidth) - ox,
    //     y: (startY * this._tileHeight) - oy
    // };
    // this.upperLayer.position = {
    //     x: (startX * this._tileWidth) - ox,
    //     y: (startY * this._tileHeight) - oy
    // };
    for (const layer of this.lowerLayer) {
      layer.position = {
        x: startX * this._tileWidth - ox,
        y: startY * this._tileHeight - oy
      };
    }
    for (const layer of this.upperLayer) {
      layer.position = {
        x: startX * this._tileWidth - ox,
        y: startY * this._tileHeight - oy
      };
    }
    this.shadowLayer.position = {
      x: startX * this._tileWidth - ox,
      y: startY * this._tileHeight - oy
    };
  }

  /**
   * @method _paintAllTiles
   * @param {Number} startX
   * @param {Number} startY
   * @private
   */
  protected _paintAllTiles(startX: number, startY: number) {
    // this.lowerLayer.clear();
    // this.upperLayer.clear();
    for (const layer of this.lowerLayer) {
      layer.clear();
    }
    for (const layer of this.upperLayer) {
      layer.clear();
    }
    this.shadowLayer.clear();

    if (this.paintAll) {
      for (let y = 0; y < this._mapHeight; y++) {
        for (let x = 0; x < this._mapWidth; x++) {
          this._paintTiles(0, 0, x, y);
        }
      }
    } else {
      const tileCols = Math.ceil(this._width / this._tileWidth) + 1;
      const tileRows = Math.ceil(this._height / this._tileHeight) + 1;

      for (let y = 0; y < tileRows; y++) {
        for (let x = 0; x < tileCols; x++) {
          this._paintTiles(startX, startY, x, y);
        }
      }
    }
  }

  /**
   * @method _paintTiles
   * @param {Number} startX
   * @param {Number} startY
   * @param {Number} x
   * @param {Number} y
   * @private
   */
  protected _paintTiles(startX: number, startY: number, x: number, y: number) {
    if (!this.lowerLayer || !this.upperLayer) {
      return;
    }
    const mx = startX + x;
    const my = startY + y;
    const dx = x * this._tileWidth;
    const dy = y * this._tileHeight;
    const tileId0 = this._readMapData(mx, my, 0);
    const tileId1 = this._readMapData(mx, my, 1);
    const tileId2 = this._readMapData(mx, my, 2);
    const tileId3 = this._readMapData(mx, my, 3);
    const shadowBits = this._readMapData(mx, my, 4);
    const upperTileId1 = this._readMapData(mx, my - 1, 1);
    const lowerLayer = this.lowerLayer;
    const upperLayer = this.upperLayer;

    if (this._isHigherTile(tileId0)) {
      this._drawTile(upperLayer[0], tileId0, dx, dy);
    } else {
      this._drawTile(lowerLayer[0], tileId0, dx, dy);
    }
    if (this._isHigherTile(tileId1)) {
      this._drawTile(upperLayer[1], tileId1, dx, dy);
    } else {
      this._drawTile(lowerLayer[1], tileId1, dx, dy);
    }

    this._drawShadow(this.shadowLayer, shadowBits, dx, dy);
    if (this._isTableTile(upperTileId1) && !this._isTableTile(tileId1)) {
      if (!Tilemap.isShadowingTile(tileId0)) {
        this._drawTableEdge(lowerLayer[2], upperTileId1, dx, dy);
      }
    }

    if (this._isOverpassPosition(mx, my)) {
      this._drawTile(upperLayer[2], tileId2, dx, dy);
      this._drawTile(upperLayer[3], tileId3, dx, dy);
    } else {
      if (this._isHigherTile(tileId2)) {
        this._drawTile(upperLayer[2], tileId2, dx, dy);
      } else {
        this._drawTile(lowerLayer[2], tileId2, dx, dy);
      }
      if (this._isHigherTile(tileId3)) {
        this._drawTile(upperLayer[3], tileId3, dx, dy);
      } else {
        this._drawTile(lowerLayer[3], tileId3, dx, dy);
      }
    }
  }

  /**
   * @method _drawTile
   * @param {Array} layers
   * @param {Number} tileId
   * @param {Number} dx
   * @param {Number} dy
   * @private
   */
  protected _drawTile(layer: CompositeTilemap, tileId: number, dx: number, dy: number) {
    if (Tilemap.isVisibleTile(tileId)) {
      if (Tilemap.isAutotile(tileId)) {
        this._drawAutotile(layer, tileId, dx, dy);
      } else {
        this._drawNormalTile(layer, tileId, dx, dy);
      }
    }
  }

  /**
   * @method _drawNormalTile
   * @param {Array} layers
   * @param {Number} tileId
   * @param {Number} dx
   * @param {Number} dy
   * @private
   */
  protected _drawNormalTile(layer: CompositeTilemap, tileId: number, dx: number, dy: number) {
    let setNumber = 0;

    if (Tilemap.isTileA5(tileId)) {
      setNumber = 4;
    } else {
      setNumber = 5 + Math.floor(tileId / 256);
    }

    const w = this._tileWidth;
    const h = this._tileHeight;
    const sx = ((Math.floor(tileId / 128) % 2) * 8 + (tileId % 8)) * w;
    const sy = (Math.floor((tileId % 256) / 8) % 16) * h;

    layer.tile(setNumber, dx, dy, {
      u: sx,
      v: sy,
      tileWidth: w,
      tileHeight: h
    });
  }

  /**
   * @method _drawAutotile
   * @param {Array} layers
   * @param {Number} tileId
   * @param {Number} dx
   * @param {Number} dy
   * @private
   */
  protected _drawAutotile(layer: CompositeTilemap, tileId: number, dx: number, dy: number) {
    let autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
    const kind = Tilemap.getAutotileKind(tileId);
    const shape = Tilemap.getAutotileShape(tileId);
    const tx = kind % 8;
    const ty = Math.floor(kind / 8);
    let bx = 0;
    let by = 0;
    let setNumber = 0;
    let isTable = false;
    let animX = 0;
    let animY = 0;

    if (Tilemap.isTileA1(tileId)) {
      setNumber = 0;
      if (kind === 0) {
        animX = 2;
        by = 0;
      } else if (kind === 1) {
        animX = 2;
        by = 3;
      } else if (kind === 2) {
        bx = 6;
        by = 0;
      } else if (kind === 3) {
        bx = 6;
        by = 3;
      } else {
        bx = Math.floor(tx / 4) * 8;
        by = ty * 6 + (Math.floor(tx / 2) % 2) * 3;
        if (kind % 2 === 0) {
          animX = 2;
        } else {
          bx += 6;
          autotileTable = Tilemap.WATERFALL_AUTOTILE_TABLE;
          animY = 1;
        }
      }
    } else if (Tilemap.isTileA2(tileId)) {
      setNumber = 1;
      bx = tx * 2;
      by = (ty - 2) * 3;
      isTable = this._isTableTile(tileId);
    } else if (Tilemap.isTileA3(tileId)) {
      setNumber = 2;
      bx = tx * 2;
      by = (ty - 6) * 2;
      autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
    } else if (Tilemap.isTileA4(tileId)) {
      setNumber = 3;
      bx = tx * 2;
      by = Math.floor((ty - 10) * 2.5 + (ty % 2 === 1 ? 0.5 : 0));
      if (ty % 2 === 1) {
        autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
      }
    }

    const table = autotileTable[shape];
    const w1 = this._tileWidth / 2;
    const h1 = this._tileHeight / 2;

    for (let i = 0; i < 4; i++) {
      const qsx = table[i][0];
      const qsy = table[i][1];
      const sx1 = (bx * 2 + qsx) * w1;
      const sy1 = (by * 2 + qsy) * h1;
      const dx1 = dx + (i % 2) * w1;
      const dy1 = dy + Math.floor(i / 2) * h1;

      if (isTable && (qsy === 1 || qsy === 5)) {
        let qsx2 = qsx;
        const qsy2 = 3;

        if (qsy === 1) {
          // qsx2 = [0, 3, 2, 1][qsx];
          qsx2 = (4 - qsx) % 4;
        }
        const sx2 = (bx * 2 + qsx2) * w1;
        const sy2 = (by * 2 + qsy2) * h1;

        layer.tile(setNumber, dx1, dy1, {
          u: sx2,
          v: sy2,
          tileWidth: w1,
          tileHeight: h1,
          animX,
          animY
        });
        layer.tile(setNumber, dx1, dy1 + h1 / 2, {
          u: sx1,
          v: sy1,
          tileWidth: w1,
          tileHeight: h1 / 2,
          animX,
          animY
        });
      } else {
        layer.tile(setNumber, dx1, dy1, {
          u: sx1,
          v: sy1,
          tileWidth: w1,
          tileHeight: h1,
          animX,
          animY
        });
      }
    }
  }

  /**
   * @method _drawTableEdge
   * @param {Array} layers
   * @param {Number} tileId
   * @param {Number} dx
   * @param {Number} dy
   * @private
   */
  protected _drawTableEdge(layer: CompositeTilemap, tileId: number, dx: number, dy: number) {
    if (Tilemap.isTileA2(tileId)) {
      const autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
      const kind = Tilemap.getAutotileKind(tileId);
      const shape = Tilemap.getAutotileShape(tileId);
      const tx = kind % 8;
      const ty = Math.floor(kind / 8);
      const setNumber = 1;
      const bx = tx * 2;
      const by = (ty - 2) * 3;
      const table = autotileTable[shape];
      const w1 = this._tileWidth / 2;
      const h1 = this._tileHeight / 2;

      for (let i = 0; i < 2; i++) {
        const qsx = table[2 + i][0];
        const qsy = table[2 + i][1];
        const sx1 = (bx * 2 + qsx) * w1;
        const sy1 = (by * 2 + qsy) * h1 + h1 / 2;
        const dx1 = dx + (i % 2) * w1;
        const dy1 = dy + Math.floor(i / 2) * h1;

        layer.tile(setNumber, dx1, dy1, {
          u: sx1,
          v: sy1,
          tileWidth: w1,
          tileHeight: h1 / 2
        });
      }
    }
  }

  /**
   * @method _drawShadow
   * @param {Number} shadowBits
   * @param {Number} dx
   * @param {Number} dy
   * @private
   */
  protected _drawShadow(layer: CompositeTilemap, shadowBits: number, dx: number, dy: number) {
    if (shadowBits & 0x0f) {
      const w1 = this._tileWidth / 2;
      const h1 = this._tileHeight / 2;

      for (let i = 0; i < 4; i++) {
        if (shadowBits & (1 << i)) {
          const dx1 = dx + (i % 2) * w1;
          const dy1 = dy + Math.floor(i / 2) * h1;

          layer.tile(-1, dx1, dy1, {
            tileWidth: w1,
            tileHeight: h1
          });
        }
      }
    }
  }
}
