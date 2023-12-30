//-----------------------------------------------------------------------------
// ImageManager
//
// The static class that loads images, creates bitmap objects and retains them.

import { Bitmap } from '../core/Bitmap';
import { CacheMap } from '../core/Cache';
import { ImageCache } from '../core/ImageCache';
import { RequestQueue } from '../core/RequestQueue';
import * as Utils from '../core/Utils';

let _defaultReservationId = 0;
let _creationHook: undefined | ((bitmap: Bitmap) => void);

/** The obsoleted cache. Not used any more. */
export const cache = new CacheMap<Bitmap>();

let _imageCache = new ImageCache();
const _requestQueue = new RequestQueue();
const _systemReservationId = Utils.generateRuntimeId();

const _generateCacheKey = (path: string, hue: number) => {
  return path + ':' + hue;
};

export const loadAnimation = (filename: string, hue?: number) => {
  return loadBitmap('img/animations/', filename, hue, true);
};

export const loadBattleback1 = (filename: string, hue?: number) => {
  return loadBitmap('img/battlebacks1/', filename, hue, true);
};

export const loadBattleback2 = (filename: string, hue?: number) => {
  return loadBitmap('img/battlebacks2/', filename, hue, true);
};

export const loadEnemy = (filename: string, hue?: number) => {
  return loadBitmap('img/enemies/', filename, hue, true);
};

export const loadCharacter = (filename: string, hue?: number) => {
  return loadBitmap('img/characters/', filename, hue, false);
};

export const loadFace = (filename: string, hue?: number) => {
  return loadBitmap('img/faces/', filename, hue, true);
};

export const loadParallax = (filename: string, hue?: number) => {
  return loadBitmap('img/parallaxes/', filename, hue, true);
};

export const loadPicture = (filename: string, hue?: number) => {
  return loadBitmap('img/pictures/', filename, hue, true);
};

export const loadSvActor = (filename: string, hue?: number) => {
  return loadBitmap('img/sv_actors/', filename, hue, false);
};

export const loadSvEnemy = (filename: string, hue?: number) => {
  return loadBitmap('img/sv_enemies/', filename, hue, true);
};

export const loadSystem = (filename: string, hue?: number) => {
  return loadBitmap('img/system/', filename, hue, false);
};

export const loadTileset = (filename: string, hue?: number) => {
  return loadBitmap('img/tilesets/', filename, hue, false);
};

export const loadTitle1 = (filename: string, hue?: number) => {
  return loadBitmap('img/titles1/', filename, hue, true);
};

export const loadTitle2 = (filename: string, hue?: number) => {
  return loadBitmap('img/titles2/', filename, hue, true);
};

export const loadBitmap = (folder: string, filename: string, hue?: number, smooth?: boolean) => {
  if (filename) {
    const path = folder + encodeURIComponent(filename) + '.png';
    const bitmap = loadNormalBitmap(path, hue ?? 0, smooth);
    // if (smooth) { bitmap.smooth = smooth; }
    return bitmap;
  } else {
    return loadEmptyBitmap();
  }
};

export const loadEmptyBitmap = () => {
  let empty = _imageCache.get('empty');
  if (!empty) {
    empty = new Bitmap();
    _imageCache.add('empty', empty);
    _imageCache.reserve('empty', empty, _systemReservationId);
  }

  return empty;
};

export const loadNormalBitmap = (path: string, hue: number, smooth?: boolean) => {
  const key = _generateCacheKey(path, hue);
  let bitmap = _imageCache.get(key);
  if (!bitmap) {
    bitmap = Bitmap.load(path, smooth);
    _callCreationHook(bitmap);

    bitmap.addLoadListener((loadedBitmap) => {
      loadedBitmap.rotateHue(hue);
    });
    _imageCache.add(key, bitmap);
  } else if (!bitmap.isReady()) {
    bitmap.decode();
  }

  return bitmap;
};

export const clear = () => {
  _imageCache = new ImageCache();
};

export const isReady = () => {
  return _imageCache.isReady();
};

export const isObjectCharacter = (filename: string) => {
  const sign = filename.match(/^[!$]+/);
  return sign && sign[0].includes('!');
};

export const isBigCharacter = (filename: string) => {
  const sign = filename.match(/^[!$]+/);
  return sign && sign[0].includes('$');
};

export const isZeroParallax = (filename: string) => {
  return filename.charAt(0) === '!';
};

export const reserveAnimation = (filename: string, hue?: number, reservationId?: number) => {
  return reserveBitmap('img/animations/', filename, hue, true, reservationId);
};

export const reserveBattleback1 = (filename: string, hue?: number, reservationId?: number) => {
  return reserveBitmap('img/battlebacks1/', filename, hue, true, reservationId);
};

export const reserveBattleback2 = (filename: string, hue?: number, reservationId?: number) => {
  return reserveBitmap('img/battlebacks2/', filename, hue, true, reservationId);
};

export const reserveEnemy = (filename: string, hue?: number, reservationId?: number) => {
  return reserveBitmap('img/enemies/', filename, hue, true, reservationId);
};

export const reserveCharacter = (filename: string, hue?: number, reservationId?: number) => {
  return reserveBitmap('img/characters/', filename, hue, false, reservationId);
};

export const reserveFace = (filename: string, hue?: number, reservationId?: number) => {
  return reserveBitmap('img/faces/', filename, hue, true, reservationId);
};

export const reserveParallax = (filename: string, hue?: number, reservationId?: number) => {
  return reserveBitmap('img/parallaxes/', filename, hue, true, reservationId);
};

export const reservePicture = (filename: string, hue?: number, reservationId?: number) => {
  return reserveBitmap('img/pictures/', filename, hue, true, reservationId);
};

export const reserveSvActor = (filename: string, hue?: number, reservationId?: number) => {
  return reserveBitmap('img/sv_actors/', filename, hue, false, reservationId);
};

export const reserveSvEnemy = (filename: string, hue?: number, reservationId?: number) => {
  return reserveBitmap('img/sv_enemies/', filename, hue, true, reservationId);
};

export const reserveSystem = (filename: string, hue?: number, reservationId?: number) => {
  return reserveBitmap('img/system/', filename, hue, false, reservationId ?? _systemReservationId);
};

export const reserveTileset = (filename: string, hue?: number, reservationId?: number) => {
  return reserveBitmap('img/tilesets/', filename, hue, false, reservationId);
};

export const reserveTitle1 = (filename: string, hue?: number, reservationId?: number) => {
  return reserveBitmap('img/titles1/', filename, hue, true, reservationId);
};

export const reserveTitle2 = (filename: string, hue?: number, reservationId?: number) => {
  return reserveBitmap('img/titles2/', filename, hue, true, reservationId);
};

export const reserveBitmap = (
  folder: string,
  filename: string,
  hue?: number,
  smooth?: boolean,
  reservationId?: number
) => {
  if (filename) {
    const path = folder + encodeURIComponent(filename) + '.png';
    const bitmap = reserveNormalBitmap(path, hue ?? 0, reservationId ?? _defaultReservationId, smooth);
    // bitmap.smooth = smooth;
    return bitmap;
  } else {
    return loadEmptyBitmap();
  }
};

export const reserveNormalBitmap = (path: string, hue: number, reservationId: number, smooth?: boolean) => {
  const bitmap = loadNormalBitmap(path, hue, smooth);
  _imageCache.reserve(_generateCacheKey(path, hue), bitmap, reservationId);

  return bitmap;
};

export const releaseReservation = (reservationId: number) => {
  _imageCache.releaseReservation(reservationId);
};

export const setDefaultReservationId = (reservationId: number) => {
  _defaultReservationId = reservationId;
};

export const requestAnimation = (filename: string, hue: number) => {
  return requestBitmap('img/animations/', filename, hue, true);
};

export const requestBattleback1 = (filename: string, hue: number) => {
  return requestBitmap('img/battlebacks1/', filename, hue, true);
};

export const requestBattleback2 = (filename: string, hue: number) => {
  return requestBitmap('img/battlebacks2/', filename, hue, true);
};

export const requestEnemy = (filename: string, hue: number) => {
  return requestBitmap('img/enemies/', filename, hue, true);
};

export const requestCharacter = (filename: string, hue: number) => {
  return requestBitmap('img/characters/', filename, hue, false);
};

export const requestFace = (filename: string, hue: number) => {
  return requestBitmap('img/faces/', filename, hue, true);
};

export const requestParallax = (filename: string, hue: number) => {
  return requestBitmap('img/parallaxes/', filename, hue, true);
};

export const requestPicture = (filename: string, hue: number) => {
  return requestBitmap('img/pictures/', filename, hue, true);
};

export const requestSvActor = (filename: string, hue: number) => {
  return requestBitmap('img/sv_actors/', filename, hue, false);
};

export const requestSvEnemy = (filename: string, hue: number) => {
  return requestBitmap('img/sv_enemies/', filename, hue, true);
};

export const requestSystem = (filename: string, hue: number) => {
  return requestBitmap('img/system/', filename, hue, false);
};

export const requestTileset = (filename: string, hue: number) => {
  return requestBitmap('img/tilesets/', filename, hue, false);
};

export const requestTitle1 = (filename: string, hue: number) => {
  return requestBitmap('img/titles1/', filename, hue, true);
};

export const requestTitle2 = (filename: string, hue: number) => {
  return requestBitmap('img/titles2/', filename, hue, true);
};

export const requestBitmap = (folder: string, filename: string, hue?: number, smooth?: boolean) => {
  if (filename) {
    const path = folder + encodeURIComponent(filename) + '.png';
    const bitmap = requestNormalBitmap(path, hue ?? 0, smooth);
    // bitmap.smooth = smooth;
    return bitmap;
  } else {
    return loadEmptyBitmap();
  }
};

export const requestNormalBitmap = (path: string, hue: number, smooth?: boolean) => {
  const key = _generateCacheKey(path, hue);
  let bitmap = _imageCache.get(key);
  if (!bitmap) {
    bitmap = Bitmap.request(path, smooth);
    _callCreationHook(bitmap);

    bitmap.addLoadListener((loadedBitmap) => {
      loadedBitmap.rotateHue(hue);
    });
    _imageCache.add(key, bitmap);
    _requestQueue.enqueue(key, bitmap);
  } else {
    _requestQueue.raisePriority(key);
  }

  return bitmap;
};

export const update = () => {
  _requestQueue.update();
};

export const clearRequest = () => {
  _requestQueue.clear();
};

export const setCreationHook = (hook?: (bitmap: Bitmap) => void) => {
  _creationHook = hook; // Used by ProgressWatcher only
  // TODO: ProgressWatcher (especially make it Promise)
};

const _callCreationHook = (bitmap: Bitmap) => {
  if (_creationHook) _creationHook(bitmap);
};
