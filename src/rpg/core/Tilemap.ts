import * as PIXI from 'pixi.js';
import * as Graphics from './Graphics';
import { Stage } from './Stage';
import { numberMod } from './JsExtensions';
import { CounterInterpolator, DefaultFps } from './Interpolator';

//-----------------------------------------------------------------------------
/**
 * The tilemap which displays 2D tile-based game map.
 *
 * @class Tilemap
 * @constructor
 */

export abstract class Tilemap extends Stage {
  protected _margin = 20;
  protected _tileWidth = 48;
  protected _tileHeight = 48;
  protected _mapWidth = 0;
  protected _mapHeight = 0;
  protected _mapData: Array<number> | undefined;
  protected _layerWidth = 0;
  protected _layerHeight = 0;

  /**
   * The bitmaps used as a tileset.
   */
  bitmaps: Array<PIXI.Texture | undefined> = [];

  /**
   * The origin point of the tilemap for scrolling.
   */
  _scrollOrigin = new PIXI.Point();

  get scrollOrigin(): PIXI.Point {
    return this._scrollOrigin;
  }

  set scrollOrigin(value: PIXI.PointData) {
    if (value.x !== this._scrollOrigin.x || value.y !== this._scrollOrigin.y) {
      this._scrollOrigin = new PIXI.Point(value.x, value.y);
      this._repaint(false);
    }
  }

  /**
   * The tileset flags.
   */
  flags = [];

  /**
   * The animation count for autotiles.
   */
  animationCount = new CounterInterpolator(12, 0, 30 / DefaultFps);

  /**
   * Whether the tilemap loops horizontal.
   */
  horizontalWrap = false;

  /**
   * Whether the tilemap loops vertical.
   */
  verticalWrap = false;

  public animationFrame = 0;

  protected _width: number;
  protected _height: number;

  constructor() {
    super();

    this._width = Graphics.default.width + this._margin * 2;
    this._height = Graphics.default.height + this._margin * 2;

    // Not able to do so, since the derived class's constructor will overwrite the values.
    // this._createLayers();
    // this.refresh();
  }

  protected abstract _createLayers(): void;

  // public abstract refresh(): void;

  protected abstract updateTileAnim(x: number, y: number): void;

  protected abstract _repaint(forceRepaint: boolean): void;

  /**
   * The width of the screen in pixels.
   *
   * @property width
   * @type Number
   */
  public get width() {
    return this._width;
  }

  public set width(value) {
    if (this._width !== value) {
      this._width = value;
      this._createLayers();
    }
  }

  /**
   * The height of the screen in pixels.
   *
   * @property height
   * @type Number
   */
  public get height() {
    return this._height;
  }

  public set height(value) {
    if (this._height !== value) {
      this._height = value;
      this._createLayers();
    }
  }

  /**
   * The width of a tile in pixels.
   *
   * @property tileWidth
   * @type Number
   */
  public get tileWidth() {
    return this._tileWidth;
  }

  public set tileWidth(value) {
    if (this._tileWidth !== value) {
      this._tileWidth = value;
      this._createLayers();
    }
  }

  /**
   * The height of a tile in pixels.
   *
   * @property tileHeight
   * @type Number
   */
  public get tileHeight() {
    return this._tileHeight;
  }

  public set tileHeight(value) {
    if (this._tileHeight !== value) {
      this._tileHeight = value;
      this._createLayers();
    }
  }

  public get margin() {
    return this._margin;
  }

  public get mapWidth() {
    return this._mapWidth;
  }

  public get mapHeight() {
    return this._mapHeight;
  }

  /**
   * Sets the tilemap data.
   *
   * @method setData
   * @param {Number} width The width of the map in number of tiles
   * @param {Number} height The height of the map in number of tiles
   * @param {Array} data The one dimensional array for the map data
   */
  public setData(width: number, height: number, data: Array<number>) {
    this._mapWidth = width;
    this._mapHeight = height;
    this._mapData = data;
  }

  /**
   * Updates the tilemap for each frame.
   *
   * @method updateDelta
   */
  public override updateDelta(delta: number) {
    this.animationCount.updateDelta(delta);

    this.animationFrame = this.animationCount.value;

    let af = this.animationFrame % 4;

    if (af === 3) af = 1;

    this.updateTileAnim(af * this._tileWidth, (this.animationFrame % 3) * this._tileHeight);
  }

  public _tempLowerTiles = [];
  public _tempUpperTiles = [];

  /**
   * @method _readMapData
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @return {Number}
   * @private
   */
  protected _readMapData(x: number, y: number, z: number): number {
    if (this._mapData) {
      const width = this._mapWidth;
      const height = this._mapHeight;

      if (this.horizontalWrap) {
        x = numberMod(x, width);
      }
      if (this.verticalWrap) {
        y = numberMod(y, height);
      }
      if (x >= 0 && x < width && y >= 0 && y < height) {
        return this._mapData[(z * height + y) * width + x] ?? 0;
      }

      return 0;
    }

    return 0;
  }

  /**
   * @method _isHigherTile
   * @param {Number} tileId
   * @return {Boolean}
   * @private
   */
  protected _isHigherTile(tileId: number): boolean {
    return !!(this.flags[tileId] & 0x10);
  }

  /**
   * @method _isTableTile
   * @param {Number} tileId
   * @return {Boolean}
   * @private
   */
  protected _isTableTile(tileId: number): boolean {
    return !!(Tilemap.isTileA2(tileId) && this.flags[tileId] & 0x80);
  }

  /**
   * @method _isOverpassPosition
   * @param {Number} mx
   * @param {Number} my
   * @return {Boolean}
   * @private
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected _isOverpassPosition(_mx: number, _my: number): boolean {
    return false;
  }

  // Tile type checkers

  public static TILE_ID_B = 0;
  public static TILE_ID_C = 256;
  public static TILE_ID_D = 512;
  public static TILE_ID_E = 768;
  public static TILE_ID_A5 = 1536;
  public static TILE_ID_A1 = 2048;
  public static TILE_ID_A2 = 2816;
  public static TILE_ID_A3 = 4352;
  public static TILE_ID_A4 = 5888;
  public static TILE_ID_MAX = 8192;

  public static isVisibleTile(tileId: number) {
    return tileId > 0 && tileId < this.TILE_ID_MAX;
  }

  public static isAutotile(tileId: number) {
    return tileId >= this.TILE_ID_A1;
  }

  public static getAutotileKind(tileId: number) {
    return Math.floor((tileId - this.TILE_ID_A1) / 48);
  }

  public static getAutotileShape(tileId: number) {
    return (tileId - this.TILE_ID_A1) % 48;
  }

  public static makeAutotileId(kind: number, shape: number) {
    return this.TILE_ID_A1 + kind * 48 + shape;
  }

  public static isSameKindTile(tileID1: number, tileID2: number) {
    if (this.isAutotile(tileID1) && this.isAutotile(tileID2)) {
      return this.getAutotileKind(tileID1) === this.getAutotileKind(tileID2);
    }

    return tileID1 === tileID2;
  }

  public static isTileA1(tileId: number) {
    return tileId >= this.TILE_ID_A1 && tileId < this.TILE_ID_A2;
  }

  public static isTileA2(tileId: number) {
    return tileId >= this.TILE_ID_A2 && tileId < this.TILE_ID_A3;
  }

  public static isTileA3(tileId: number) {
    return tileId >= this.TILE_ID_A3 && tileId < this.TILE_ID_A4;
  }

  public static isTileA4(tileId: number) {
    return tileId >= this.TILE_ID_A4 && tileId < this.TILE_ID_MAX;
  }

  public static isTileA5(tileId: number) {
    return tileId >= this.TILE_ID_A5 && tileId < this.TILE_ID_A1;
  }

  public static isWaterTile(tileId: number) {
    if (this.isTileA1(tileId)) {
      return !(tileId >= this.TILE_ID_A1 + 96 && tileId < this.TILE_ID_A1 + 192);
    }

    return false;
  }

  public static isWaterfallTile(tileId: number) {
    if (tileId >= this.TILE_ID_A1 + 192 && tileId < this.TILE_ID_A2) {
      return this.getAutotileKind(tileId) % 2 === 1;
    }

    return false;
  }

  public static isGroundTile(tileId: number) {
    return this.isTileA1(tileId) || this.isTileA2(tileId) || this.isTileA5(tileId);
  }

  public static isShadowingTile(tileId: number) {
    return this.isTileA3(tileId) || this.isTileA4(tileId);
  }

  public static isRoofTile(tileId: number) {
    return this.isTileA3(tileId) && this.getAutotileKind(tileId) % 16 < 8;
  }

  public static isWallTopTile(tileId: number) {
    return this.isTileA4(tileId) && this.getAutotileKind(tileId) % 16 < 8;
  }

  public static isWallSideTile(tileId: number) {
    return (this.isTileA3(tileId) || this.isTileA4(tileId)) && this.getAutotileKind(tileId) % 16 >= 8;
  }

  public static isWallTile(tileId: number) {
    return this.isWallTopTile(tileId) || this.isWallSideTile(tileId);
  }

  public static isFloorTypeAutotile(tileId: number) {
    return (
      (this.isTileA1(tileId) && !this.isWaterfallTile(tileId)) || this.isTileA2(tileId) || this.isWallTopTile(tileId)
    );
  }

  public static isWallTypeAutotile(tileId: number) {
    return this.isRoofTile(tileId) || this.isWallSideTile(tileId);
  }

  public static isWaterfallTypeAutotile(tileId: number) {
    return this.isWaterfallTile(tileId);
  }

  // Autotile shape number to coordinates of tileset images

  public static readonly FLOOR_AUTOTILE_TABLE = [
    [
      [2, 4],
      [1, 4],
      [2, 3],
      [1, 3]
    ],
    [
      [2, 0],
      [1, 4],
      [2, 3],
      [1, 3]
    ],
    [
      [2, 4],
      [3, 0],
      [2, 3],
      [1, 3]
    ],
    [
      [2, 0],
      [3, 0],
      [2, 3],
      [1, 3]
    ],
    [
      [2, 4],
      [1, 4],
      [2, 3],
      [3, 1]
    ],
    [
      [2, 0],
      [1, 4],
      [2, 3],
      [3, 1]
    ],
    [
      [2, 4],
      [3, 0],
      [2, 3],
      [3, 1]
    ],
    [
      [2, 0],
      [3, 0],
      [2, 3],
      [3, 1]
    ],
    [
      [2, 4],
      [1, 4],
      [2, 1],
      [1, 3]
    ],
    [
      [2, 0],
      [1, 4],
      [2, 1],
      [1, 3]
    ],
    [
      [2, 4],
      [3, 0],
      [2, 1],
      [1, 3]
    ],
    [
      [2, 0],
      [3, 0],
      [2, 1],
      [1, 3]
    ],
    [
      [2, 4],
      [1, 4],
      [2, 1],
      [3, 1]
    ],
    [
      [2, 0],
      [1, 4],
      [2, 1],
      [3, 1]
    ],
    [
      [2, 4],
      [3, 0],
      [2, 1],
      [3, 1]
    ],
    [
      [2, 0],
      [3, 0],
      [2, 1],
      [3, 1]
    ],
    [
      [0, 4],
      [1, 4],
      [0, 3],
      [1, 3]
    ],
    [
      [0, 4],
      [3, 0],
      [0, 3],
      [1, 3]
    ],
    [
      [0, 4],
      [1, 4],
      [0, 3],
      [3, 1]
    ],
    [
      [0, 4],
      [3, 0],
      [0, 3],
      [3, 1]
    ],
    [
      [2, 2],
      [1, 2],
      [2, 3],
      [1, 3]
    ],
    [
      [2, 2],
      [1, 2],
      [2, 3],
      [3, 1]
    ],
    [
      [2, 2],
      [1, 2],
      [2, 1],
      [1, 3]
    ],
    [
      [2, 2],
      [1, 2],
      [2, 1],
      [3, 1]
    ],
    [
      [2, 4],
      [3, 4],
      [2, 3],
      [3, 3]
    ],
    [
      [2, 4],
      [3, 4],
      [2, 1],
      [3, 3]
    ],
    [
      [2, 0],
      [3, 4],
      [2, 3],
      [3, 3]
    ],
    [
      [2, 0],
      [3, 4],
      [2, 1],
      [3, 3]
    ],
    [
      [2, 4],
      [1, 4],
      [2, 5],
      [1, 5]
    ],
    [
      [2, 0],
      [1, 4],
      [2, 5],
      [1, 5]
    ],
    [
      [2, 4],
      [3, 0],
      [2, 5],
      [1, 5]
    ],
    [
      [2, 0],
      [3, 0],
      [2, 5],
      [1, 5]
    ],
    [
      [0, 4],
      [3, 4],
      [0, 3],
      [3, 3]
    ],
    [
      [2, 2],
      [1, 2],
      [2, 5],
      [1, 5]
    ],
    [
      [0, 2],
      [1, 2],
      [0, 3],
      [1, 3]
    ],
    [
      [0, 2],
      [1, 2],
      [0, 3],
      [3, 1]
    ],
    [
      [2, 2],
      [3, 2],
      [2, 3],
      [3, 3]
    ],
    [
      [2, 2],
      [3, 2],
      [2, 1],
      [3, 3]
    ],
    [
      [2, 4],
      [3, 4],
      [2, 5],
      [3, 5]
    ],
    [
      [2, 0],
      [3, 4],
      [2, 5],
      [3, 5]
    ],
    [
      [0, 4],
      [1, 4],
      [0, 5],
      [1, 5]
    ],
    [
      [0, 4],
      [3, 0],
      [0, 5],
      [1, 5]
    ],
    [
      [0, 2],
      [3, 2],
      [0, 3],
      [3, 3]
    ],
    [
      [0, 2],
      [1, 2],
      [0, 5],
      [1, 5]
    ],
    [
      [0, 4],
      [3, 4],
      [0, 5],
      [3, 5]
    ],
    [
      [2, 2],
      [3, 2],
      [2, 5],
      [3, 5]
    ],
    [
      [0, 2],
      [3, 2],
      [0, 5],
      [3, 5]
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1]
    ]
  ];

  public static readonly WALL_AUTOTILE_TABLE = [
    [
      [2, 2],
      [1, 2],
      [2, 1],
      [1, 1]
    ],
    [
      [0, 2],
      [1, 2],
      [0, 1],
      [1, 1]
    ],
    [
      [2, 0],
      [1, 0],
      [2, 1],
      [1, 1]
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1]
    ],
    [
      [2, 2],
      [3, 2],
      [2, 1],
      [3, 1]
    ],
    [
      [0, 2],
      [3, 2],
      [0, 1],
      [3, 1]
    ],
    [
      [2, 0],
      [3, 0],
      [2, 1],
      [3, 1]
    ],
    [
      [0, 0],
      [3, 0],
      [0, 1],
      [3, 1]
    ],
    [
      [2, 2],
      [1, 2],
      [2, 3],
      [1, 3]
    ],
    [
      [0, 2],
      [1, 2],
      [0, 3],
      [1, 3]
    ],
    [
      [2, 0],
      [1, 0],
      [2, 3],
      [1, 3]
    ],
    [
      [0, 0],
      [1, 0],
      [0, 3],
      [1, 3]
    ],
    [
      [2, 2],
      [3, 2],
      [2, 3],
      [3, 3]
    ],
    [
      [0, 2],
      [3, 2],
      [0, 3],
      [3, 3]
    ],
    [
      [2, 0],
      [3, 0],
      [2, 3],
      [3, 3]
    ],
    [
      [0, 0],
      [3, 0],
      [0, 3],
      [3, 3]
    ]
  ];

  public static readonly WATERFALL_AUTOTILE_TABLE = [
    [
      [2, 0],
      [1, 0],
      [2, 1],
      [1, 1]
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1]
    ],
    [
      [2, 0],
      [3, 0],
      [2, 1],
      [3, 1]
    ],
    [
      [0, 0],
      [3, 0],
      [0, 1],
      [3, 1]
    ]
  ];
}

/*
 * Z coordinate:
 *
 * 0 : Lower tiles
 * 1 : Lower characters
 * 3 : Normal characters
 * 4 : Upper tiles
 * 5 : Upper characters
 * 6 : Airship shadow
 * 7 : Balloon
 * 8 : Animation
 * 9 : Destination
 */
