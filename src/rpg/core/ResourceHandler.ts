import * as Graphics from './Graphics';
import * as SceneManager from '../managers/SceneManager';

//-----------------------------------------------------------------------------
/**
 * The static class that handles resource loading.
 *
 * @class ResourceHandler
 */

export const _reloaders: Array<() => void> = [];
export const _defaultRetryInterval = [500, 1000, 3000];

export const createLoader = (
  url: string,
  retryMethod: () => void,
  resignMethod: () => void,
  retryInterval: number[] = _defaultRetryInterval
) => {
  const reloaders = _reloaders;
  let retryCount = 0;
  return () => {
    if (retryCount < retryInterval.length) {
      setTimeout(retryMethod, retryInterval[retryCount]);
      retryCount++;
    } else {
      if (resignMethod) {
        resignMethod();
      }
      if (url) {
        if (reloaders.length === 0) {
          Graphics.printLoadingError(url);
          SceneManager.stop();
        }
        reloaders.push(() => {
          retryCount = 0;
          retryMethod();
        });
      }
    }
  };
};

export const exists = () => {
  return _reloaders.length > 0;
};

export const retry = () => {
  if (_reloaders.length > 0) {
    Graphics.eraseLoadingError();
    SceneManager.resume();
    _reloaders.forEach((reloader) => {
      reloader();
    });
    _reloaders.length = 0;
  }
};
