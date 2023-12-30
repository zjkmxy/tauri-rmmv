import { Bitmap } from './Bitmap';

export type ImageCacheItem = {
  bitmap: Bitmap;
  touch: number;
  key: string;
  reservationId?: number;
};

export class ImageCache {
  /** Maximum number of pixels */
  static readonly limit = 10 * 1000 * 1000;
  protected readonly _items: Record<string, ImageCacheItem> = {};

  constructor() {}

  public add(key: string, value: Bitmap) {
    this._items[key] = {
      bitmap: value,
      touch: Date.now(),
      key: key
    };

    this._truncateCache();
  }

  public get(key: string) {
    if (this._items[key]) {
      const item = this._items[key];
      item.touch = Date.now();
      return item.bitmap;
    }

    return null;
  }

  public reserve(key: string, value: Bitmap, reservationId: number) {
    if (!this._items[key]) {
      this._items[key] = {
        bitmap: value,
        touch: Date.now(),
        key: key
      };
    }

    this._items[key].reservationId = reservationId;
  }

  public releaseReservation(reservationId: number) {
    const items = this._items;

    Object.values(items).forEach((item) => {
      if (item.reservationId === reservationId) {
        delete item.reservationId;
      }
    });
  }

  protected _truncateCache() {
    const items = this._items;
    let sizeLeft = ImageCache.limit;

    Object.values(items)
      .sort((a, b) => {
        return b.touch - a.touch;
      })
      .forEach((item) => {
        if (sizeLeft > 0 || this._mustBeHeld(item)) {
          const bitmap = item.bitmap;
          sizeLeft -= bitmap.width * bitmap.height;
        } else {
          delete items[item.key];
        }
      });
  }

  protected _mustBeHeld(item: ImageCacheItem) {
    // request only is weak so It's purgeable
    if (item.bitmap.isRequestOnly()) return false;
    // reserved item must be held
    if (item.reservationId) return true;
    // not ready bitmap must be held (because of checking isReady())
    if (!item.bitmap.isReady()) return true;
    // then the item may purgeable
    return false;
  }

  public isReady() {
    const items = this._items;
    return !Object.keys(items).some(function (key) {
      return !items[key].bitmap.isRequestOnly() && !items[key].bitmap.isReady();
    });
  }

  /** Get bitmaps that are in error state. Not used any more. */
  public getErrorBitmap() {
    const items = this._items;
    let bitmap = null;
    if (
      Object.keys(items).some(function (key) {
        if (items[key].bitmap.isError()) {
          bitmap = items[key].bitmap;
          return true;
        }
        return false;
      })
    ) {
      return bitmap;
    }

    return null;
  }
}
