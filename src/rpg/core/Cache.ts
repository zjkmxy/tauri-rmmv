//-----------------------------------------------------------------------------

/**
 * The resource class. Allows to be collected as a garbage if not use for some time or ticks
 * NOTE: NOT used any more
 *
 * @class CacheEntry
 * @constructor
 * @param {CacheMap} resource manager
 * @param {string} key, url of the resource
 * @param {string} item - Bitmap, HTML5Audio, WebAudio - whatever you want to store in the cache
 */
export class CacheEntry<T> {
  cached = false;
  touchTicks = 0;
  touchSeconds = 0;
  ttlTicks = 0;
  ttlSeconds = 0;
  freedByTTL = false;

  constructor(
    public readonly cache: CacheMap<T>,
    public readonly key: string,
    public readonly item: T
  ) {}

  /**
   * frees the resource
   */
  public free(byTTL: boolean = false) {
    this.freedByTTL = byTTL || false;
    if (this.cached) {
      this.cached = false;
      delete this.cache._inner[this.key];
    }
  }

  /**
   * Allocates the resource
   * @returns {CacheEntry}
   */
  public allocate() {
    if (!this.cached) {
      this.cache._inner[this.key] = this;
      this.cached = true;
    }
    this.touch();
    return this;
  }

  /**
   * Sets the time to live
   * @param {number} ticks TTL in ticks, 0 if not set
   * @param {number} time TTL in seconds, 0 if not set
   * @returns {CacheEntry}
   */
  public setTimeToLive(ticks = 0, seconds = 0) {
    this.ttlTicks = ticks;
    this.ttlSeconds = seconds;
    return this;
  }

  public isStillAlive() {
    const cache = this.cache;
    return (
      (this.ttlTicks == 0 || this.touchTicks + this.ttlTicks < cache.updateTicks) &&
      (this.ttlSeconds == 0 || this.touchSeconds + this.ttlSeconds < cache.updateSeconds)
    );
  }

  /**
   * makes sure that resource wont freed by Time To Live
   * if resource was already freed by TTL, put it in cache again
   */
  public touch() {
    const cache = this.cache;
    if (this.cached) {
      this.touchTicks = cache.updateTicks;
      this.touchSeconds = cache.updateSeconds;
    } else if (this.freedByTTL) {
      this.freedByTTL = false;
      if (!cache._inner[this.key]) {
        cache._inner[this.key] = this;
      }
    }
  }
}

/**
 * Cache for images, audio, or any other kind of resource
 * NOTE: NOT used any more
 * @param manager
 * @constructor
 */
export class CacheMap<T> {
  public readonly _inner: Record<string, CacheEntry<T>> = {};
  // protected _lastRemovedEntries = {};
  public updateTicks = 0;
  public lastCheckTTL = 0;
  public delayCheckTTL = 100.0;
  public updateSeconds: number;

  constructor() {
    this.updateSeconds = Date.now();
  }

  /**
   * checks ttl of all elements and removes dead ones
   */
  public checkTTL() {
    // var cache = this._inner;
    // var temp = this._lastRemovedEntries;
    // if (!temp) {
    //     temp = [];
    //     this._lastRemovedEntries = temp;
    // }
    // for (var key in cache) {
    //     var entry = cache[key];
    //     if (!entry.isStillAlive()) {
    //         temp.push(entry);
    //     }
    // }
    // for (var i = 0; i < temp.length; i++) {
    //     temp[i].free(true);
    // }
    // temp.length = 0;
    Object.values(this._inner)
      .filter((entry) => !entry.isStillAlive())
      .forEach((entry) => entry.free(true));
  }

  /**
   * cache item
   * @param key url of cache element
   * @returns {*|null}
   */
  public getItem(key: string): T | undefined {
    const entry = this._inner[key];
    if (entry) {
      return entry.item;
    }
    return undefined;
  }

  public clear() {
    // var keys = Object.keys(this._inner);
    // for (var i = 0; i < keys.length; i++) {
    //   this._inner[keys[i]].free();
    // }
    Object.values(this._inner).forEach((entry) => entry.free());
  }

  public setItem(key: string, item: T) {
    return new CacheEntry(this, key, item).allocate();
  }

  /**
   * Update in the game loop triggered by ticker
   * @param ticks the number of ticks past
   * @param delta the number of seconds past
   */
  public update(ticks: number, delta: number) {
    this.updateTicks += ticks;
    this.updateSeconds += delta;
    if (this.updateSeconds >= this.delayCheckTTL + this.lastCheckTTL) {
      this.lastCheckTTL = this.updateSeconds;
      this.checkTTL();
    }
  }
}
