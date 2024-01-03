import { invoke } from '@tauri-apps/api';
import * as Graphics from '../core/Graphics';
import * as Input from '../core/Input';
import * as ImageManager from './ImageManager';
import { Bitmap } from '../core/Bitmap';
import { SceneClass, Scene_Base } from '../scenes/Scene_Base';
import * as PIXI from 'pixi.js';
import { intializeAssetsParsers } from '../next/AssetsLoader';
import { TouchInput } from '../core/TouchInput';

//-----------------------------------------------------------------------------
// SceneManager
//
// The static class that manages scene transitions.

let _scene: Scene_Base | undefined;
let _nextScene: Scene_Base | undefined;
let _stack: Array<SceneClass> = [];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let _stopped = false;
let _sceneStarted = false;
let _exiting = false;
let _previousClass: SceneClass | undefined;
let _backgroundBitmap: Bitmap | undefined;
const _screenWidth = 816;
const _screenHeight = 624;
const _boxWidth = 816;
const _boxHeight = 624;
// const _deltaTime = 1.0 / 60.0;
// let _currentTime = performance.now();
// let _accumulator = 0.0;
// let _frameCount = 0;

export const run = async (sceneClass: SceneClass) => {
  try {
    await initialize();
    gotoScene(sceneClass);
    // requestUpdate();
    await startUpdate();
  } catch (e) {
    catchException(e);
  }
};

export const initialize = async () => {
  intializeAssetsParsers();
  initProgressWatcher();
  await initGraphics();
  checkFileAccess();
  initAudio();
  initInput();
  initNwjs();
  checkPluginErrors();
  setupErrorHandlers();
};

export const initProgressWatcher = () => {
  // ProgressWatcher.initialize();  // TODO: ProgressWatcher
};

export const initGraphics = async () => {
  const rendererType = preferableRendererType();
  await Graphics.initialize(_screenWidth, _screenHeight, rendererType);
  Graphics.default.boxWidth = _boxWidth;
  Graphics.default.boxHeight = _boxHeight;
  // Graphics.setLoadingImage('img/system/Loading.png');
  Graphics.setLoadingImage('Loading.png');
  // if (Utils.isOptionValid('showfps')) {
  //   Graphics.showFps();
  // }
  if (rendererType === 'webgpu') {
    checkWebGPU();
  }
};

export const preferableRendererType = (): Graphics.RendererType => {
  // if (Utils.isOptionValid('webgpu')) {
  //   return 'webgpu';
  // } else if (Utils.isOptionValid('webgl')) {
  //   return 'webgl';
  // } else {
  //   return 'auto';
  // }
  return 'auto';
};

export const shouldUseCanvasRenderer = () => {
  // return Utils.isMobileDevice();
  return false;
};

export const checkWebGPU = () => {
  if (!Graphics.hasWebGPU()) {
    throw new Error('Your browser does not support WebGPU.');
  }
};

export const checkFileAccess = () => {
  // if (!Utils.canReadGameFiles()) {
  //   throw new Error('Your browser does not allow to read local files.');
  // }
  return true; // Tauri allows
};

export const initAudio = () => {
  // TODO: WebAudio
  // var noAudio = Utils.isOptionValid('noaudio');
  // if (!WebAudio.initialize(noAudio) && !noAudio) {
  //   throw new Error('Your browser does not support Web Audio API.');
  // }
};

export const initInput = () => {
  Input.initialize();
  TouchInput.initialize();
};

export const initNwjs = () => {
  // if (Utils.isNwjs()) {
  //   var gui = require('nw.gui');
  //   var win = gui.Window.get();
  //   if (process.platform === 'darwin' && !win.menu) {
  //     var menubar = new gui.Menu({ type: 'menubar' });
  //     var option = { hideEdit: true, hideWindow: true };
  //     menubar.createMacBuiltin('Game', option);
  //     win.menu = menubar;
  //   }
  // }
};

export const checkPluginErrors = () => {
  // PluginManager.checkErrors();  //TODO: PluginManager
};

export const setupErrorHandlers = () => {
  window.addEventListener('error', onError);
  document.addEventListener('keydown', onKeyDown);
};

export const frameCount = () => {
  return Graphics.default.ticker.FPS ?? 0;
};

// export const setFrameCount = (frameCount: number) => {
//   _frameCount = frameCount;
// };

// export const resetFrameCount = () => {
//   _frameCount = 0;
// };

// This is automatic from application.Tick
// export const requestUpdate = () => {
//   if (!_stopped) {
//     requestAnimationFrame(update.bind(this));
//   }
// };

export const startUpdate = async () => {
  Graphics.default.ticker.add(update);
};

export const stopUpdate = () => {
  Graphics.default.ticker.remove(update);
};

export const update = (ticker: PIXI.Ticker) => {
  // TODO: This is automatic from application.Tick
  try {
    // tickStart();
    // if (Utils.isMobileSafari()) {
    //     updateInputData();
    // }
    updateManagers();
    updateMain(ticker);
    // tickEnd();
  } catch (e) {
    catchException(e);
  }
};

export const terminate = () => {
  window.close();
};

export const onError = (e: ErrorEvent) => {
  console.error(e.message);
  if (e.filename || e.lineno) {
    console.error(e.filename, e.lineno);
    try {
      stop();
      // Graphics.printError('Error', e.message);  // NOTE: Add more details
      Graphics.printErrorDetail(e.error);
      // AudioManager.stopAll();
      // TODO: AudioManager
    } catch (e2) {
      //
    }
  }
};

export const onKeyDown = (event: KeyboardEvent) => {
  if (!event.ctrlKey && !event.altKey) {
    switch (event.code) {
      case 'F5': // F5
        // if (Utils.isNwjs()) {
        //   location.reload();
        // }
        location.reload();
        break;
      case 'F8': // F8
        // if (Utils.isNwjs() && Utils.isOptionValid('test')) {
        //   require('nw.gui').Window.get().showDevTools();
        // }
        invoke('open_devtools');
        break;
    }
  }
};

export const catchException = (e: unknown) => {
  if (e instanceof Error) {
    Graphics.printError(e.name, e.message);
    Graphics.printErrorDetail(e);
    console.error(e.stack);
  } else {
    Graphics.printError('UnknownError', `${e}`);
  }
  // AudioManager.stopAll(); // TODO: AudioManager
  stop();
};

// export const tickStart = () => {
//   Graphics.tickStart();
// };

// export const tickEnd = () => {
//   Graphics.tickEnd();
// };

export const updateInputData = () => {
  Input.update();
  TouchInput.update();
};

export const updateMain = (ticker: PIXI.Ticker) => {
  // if (Utils.isMobileSafari()) {
  //     changeScene();
  //     updateScene();
  // } else {
  //     // ...
  // }

  // const newTime = performance.now();
  // if (_currentTime === undefined) {
  //   _currentTime = newTime;
  // }
  // const fTime = Math.min(0.25, (newTime - _currentTime) / 1000);
  // _currentTime = newTime;
  // _accumulator += fTime;
  // while (_accumulator >= _deltaTime) {
  //   updateInputData();
  //   changeScene();
  //   updateScene(ticker);
  //   _accumulator -= _deltaTime;
  // }

  updateInputData();
  changeScene();
  updateScene(ticker);

  renderScene();
  // requestUpdate();
};

export const updateManagers = () => {
  ImageManager.update();
};

export const changeScene = async () => {
  if (isSceneChanging() && !isCurrentSceneBusy()) {
    if (_scene) {
      _scene.terminate();
      _scene.detachReservation();
      _previousClass = _scene.constructor as SceneClass;
    }
    _scene = _nextScene;
    if (_scene) {
      _scene.attachReservation();
      _scene.createScene(); // Must return immediately to prevent re-entering.
      _nextScene = undefined;
      _sceneStarted = false;
      onSceneCreate();
    }
    if (_exiting) {
      terminate();
    }
  }
};

export const updateScene = (ticker: PIXI.Ticker) => {
  if (_scene) {
    if (!_sceneStarted && _scene.isReady()) {
      _scene.start();
      _sceneStarted = true;
      onSceneStart();
    }
    if (isCurrentSceneStarted()) {
      // updateFrameCount();
      _scene.updateDelta(ticker.deltaMS / 1000.0);
      _scene.update();
    }
  }
};

export const renderScene = () => {
  if (isCurrentSceneStarted()) {
    Graphics.render(_scene);
  } else if (_scene) {
    onSceneLoading();
  }
};

// export const updateFrameCount = () => {
//   _frameCount++;
// };

export const onSceneCreate = () => {
  Graphics.startLoading();
};

export const onSceneStart = () => {
  Graphics.endLoading();
};

export const onSceneLoading = () => {
  Graphics.updateLoading();
};

export const isSceneChanging = () => {
  return _exiting || !!_nextScene;
};

export const isCurrentSceneBusy = () => {
  return _scene && _scene.isBusy();
};

export const isCurrentSceneStarted = () => {
  return _scene && _sceneStarted;
};

export const isNextScene = (sceneClass: SceneClass) => {
  return _nextScene && _nextScene.constructor === sceneClass;
};

export const isPreviousScene = (sceneClass: SceneClass) => {
  return _previousClass === sceneClass;
};

export const gotoScene = <T extends Scene_Base>(sceneClass?: new () => T): T | undefined => {
  const scene = sceneClass ? new sceneClass() : undefined;
  _nextScene = scene;
  _scene?.stop();
  return scene;
};

export const push = (sceneClass: SceneClass) => {
  _stack.push(_scene!.constructor as SceneClass);
  gotoScene(sceneClass);
};

export const pushWithArgs = <Args extends Array<unknown>, T extends Scene_Base & { prepare: (...args: Args) => void }>(
  sceneClass: new () => T,
  ...args: Args
) => {
  _stack.push(_scene!.constructor as SceneClass);
  const nextScene: T = gotoScene(sceneClass)!;
  nextScene.prepare(...args);
};

export const pop = () => {
  if (_stack.length > 0) {
    gotoScene(_stack.pop());
  } else {
    exit();
  }
};

export const exit = () => {
  gotoScene(undefined);
  _exiting = true;
};

export const clearStack = () => {
  _stack = [];
};

export const stop = () => {
  _stopped = true;
  stopUpdate(); // Added
};

// export const prepareNextScene = (...args: unknown[]) => {
//   _nextScene.prepare.apply(_nextScene, args);
// };

export const snap = () => {
  // return Bitmap.snap(_scene!);
  // NOTE: Must be application's scene.
  return Bitmap.snap(Graphics.default.application!.stage);
};

export const snapForBackground = () => {
  _backgroundBitmap = snap();
  _backgroundBitmap.blur();
};

export const backgroundBitmap = () => {
  return _backgroundBitmap;
};

export const resume = () => {
  _stopped = false;
  // requestUpdate();
  startUpdate();
  // if (!Utils.isMobileSafari()) {
  //   _currentTime = _getTimeInMsWithoutMobileSafari();
  //   _accumulator = 0;
  // }
  // _currentTime = performance.now();
  // _accumulator = 0;
};
