/** @module The module that carries out graphics processing. */
import * as PIXI from 'pixi.js';
import { numberClamp } from './JsExtensions';
// import * as ResourceHandler from './ResourceHandler';

const _cssFontLoading = Boolean(document.fonts && document.fonts.ready && document.fonts.ready.then);
let _fontLoaded: FontFaceSet | undefined;
let _videoVolume = 1;

export type RendererType = 'webgl' | 'auto' | 'webgpu';

let _width: number;
let _height: number;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let _rendererType: RendererType;
let _boxWidth: number;
let _boxHeight: number;
let _scale: number = 1;
let _realScale: number = 1;
let _errorShowed: boolean = false;
let _errorPrinter: HTMLParagraphElement | undefined;
let _canvas: HTMLCanvasElement | undefined;
let _video: HTMLVideoElement | undefined;
let _videoUnlocked: boolean = false;
let _videoLoading: boolean = false;
let _upperCanvas: HTMLCanvasElement | undefined;
// let _renderer: PIXI.Renderer | undefined
let _application: PIXI.Application | undefined;
// let _fpsMeter: FPSMeter | undefined
let _modeBox: HTMLDivElement | undefined;
let _fpsText: HTMLDivElement | undefined;
// const _skipCount: number = 0;
// const _maxSkip: number = 3;
// const _rendered: boolean = false;
let _loadingImage: HTMLImageElement | undefined;
let _loadingCount: number = 0;
// let _fpsMeterToggled: boolean
let _stretchEnabled = false;
let _canUseDifferenceBlend = false;
let _canUseSaturationBlend = false;
let _hiddenCanvas: HTMLCanvasElement | undefined;

let _progressEnabled = false;
let _progressTimeout: number | undefined;
let _progressElement: HTMLDivElement | undefined;
let _filledBarElement: HTMLDivElement | undefined;
let _errorMessage = '';
let _showErrorDetail = false;

/**
 * Initializes the graphics system.
 *
 * @param width The width of the game screen
 * @param height The height of the game screen
 * @param type The type of the renderer.
 *        'webgpu', 'webgl', or 'auto'.
 */
export const initialize = async (width?: number, height?: number, type?: RendererType) => {
  _width = width ?? 800;
  _height = height ?? 600;
  _rendererType = type ?? 'auto';
  _boxWidth = _width;
  _boxHeight = _height;

  // _fpsMeter = null;
  // _fpsMeterToggled = false;
  _stretchEnabled = _defaultStretchMode();

  _testCanvasBlendModes();
  _modifyExistingElements();
  _updateRealScale();
  await _createAllElements();
  _disableTextSelection();
  _disableContextMenu();
  _setupEventHandlers();
  await _setupCssFontLoading();
  _setupProgress();
};

const _setupCssFontLoading = async () => {
  if (_cssFontLoading) {
    try {
      _fontLoaded = await document.fonts.ready;
    } catch (error) {
      // SceneManager.onError(error); // TODO:
      window.alert(error);
    }
  }
};

export const canUseCssFontLoading = () => _cssFontLoading;

/**
 * The total frame count of the game screen.
 *
 * @static
 * @property frameCount
 * @type Number
 */
export const frameCount = 0;

/**
 * The alias of PIXI.blendModes.NORMAL.
 *
 * @static
 * @property BLEND_NORMAL
 * @type Number
 * @final
 */
export const BLEND_NORMAL = 0;

/**
 * The alias of PIXI.blendModes.ADD.
 *
 * @static
 * @property BLEND_ADD
 * @type Number
 * @final
 */
export const BLEND_ADD = 1;

/**
 * The alias of PIXI.blendModes.MULTIPLY.
 *
 * @static
 * @property BLEND_MULTIPLY
 * @type Number
 * @final
 */
export const BLEND_MULTIPLY = 2;

/**
 * The alias of PIXI.blendModes.SCREEN.
 *
 * @static
 * @property BLEND_SCREEN
 * @type Number
 * @final
 */
export const BLEND_SCREEN = 3;

/**
 * Marks the beginning of each frame for FPSMeter.
 *
 * @static
 * @method tickStart
 */
export const tickStart = () => {
  // if (_fpsMeter) {
  //   _fpsMeter.tickStart();
  // }
};

/**
 * Marks the end of each frame for FPSMeter.
 *
 * @static
 * @method tickEnd
 */
export const tickEnd = () => {
  // if (_fpsMeter && _rendered) {
  //   _fpsMeter.tick();
  // }
};

/**
 * Renders the stage to the game screen.
 *
 * @static
 * @method render
 * @param {Stage} stage The stage object to be rendered
 */
export const render = (stage?: PIXI.Container) => {
  // if (_skipCount <= 0) {
  //   let startTime = Date.now();
  //   if (stage) {
  //     _renderer.render(stage);
  //     if (_renderer.gl && _renderer.gl.flush) {
  //       _renderer.gl.flush();
  //     }
  //   }
  //   let endTime = Date.now();
  //   let elapsed = endTime - startTime;
  //   _skipCount = Math.min(Math.floor(elapsed / 15), _maxSkip);
  //   _rendered = true;
  // } else {
  //   _skipCount--;
  //   _rendered = false;
  // }
  // frameCount++;
  if (_application) {
    if (stage) {
      if (_application.stage.children.length > 0) {
        const oldChild = _application.stage.children[0];
        if (oldChild === stage) {
          return;
        }
        _application.stage.removeChild(oldChild);
      }
      _application.stage.addChild(stage);
      stage.scale = { x: _realScale, y: _realScale };
    }
    // NOTE: Should be not automatic
    // _application.render();
  }
};

/**
 * Checks whether the renderer type is WebGL.
 *
 * @static
 * @method isWebGPU
 * @return {Boolean} True if the renderer type is WebGPU
 */
// export const isWebGL = () => {
//   return _renderer && _renderer.type === PIXI.RendererType.WEBGL;
// };
export const isWebGPU = () => _application?.renderer.type === PIXI.RendererType.WEBGPU;

/**
 * Checks whether the current browser supports WebGL.
 * NOTE: Should always be true for morden browsers.
 *
 * @static
 * @method hasWebGPU
 * @return {Boolean} True if the current browser supports WebGL.
 */
export const hasWebGPU = async () => {
  const gpu = navigator.gpu;
  if (!gpu) {
    return false;
  }
  const adapter = await gpu.requestAdapter();
  if (!adapter) {
    return false;
  }
};

/**
 * Checks whether the canvas blend mode 'difference' is supported.
 *
 * @static
 * @method canUseDifferenceBlend
 * @return {Boolean} True if the canvas blend mode 'difference' is supported
 */
export const canUseDifferenceBlend = () => {
  return _canUseDifferenceBlend;
};

/**
 * Checks whether the canvas blend mode 'saturation' is supported.
 *
 * @static
 * @method canUseSaturationBlend
 * @return {Boolean} True if the canvas blend mode 'saturation' is supported
 */
export const canUseSaturationBlend = () => {
  return _canUseSaturationBlend;
};

/**
 * Sets the source of the "Now Loading" image.
 *
 * @static
 * @method setLoadingImage
 */
export const setLoadingImage = (src: string) => {
  _loadingImage = new Image();
  _loadingImage.src = src;
};

/**
 * Sets whether the progress bar is enabled.
 *
 * @static
 * @method setEnableProgress
 */
export const setProgressEnabled = (enable: boolean) => {
  _progressEnabled = enable;
};

/**
 * Initializes the counter for displaying the "Now Loading" image.
 *
 * @static
 * @method startLoading
 */
export const startLoading = () => {
  _loadingCount = 0;

  // ProgressWatcher.truncateProgress();
  // ProgressWatcher.setProgressListener(_updateProgressCount.bind(this));
  // TODO: rpgcore ProgressWatcher
  _progressTimeout = window.setTimeout(() => {
    _showProgress();
  }, 1500);
};

const _setupProgress = () => {
  _progressElement = document.createElement('div');
  _progressElement.id = 'loading-progress';
  _progressElement.style.width = '600';
  _progressElement.style.height = '300';
  _progressElement.style.visibility = 'hidden';

  const _barElement = document.createElement('div');
  _barElement.id = 'loading-bar';
  _barElement.style.width = 'calc(100% - 30px)';
  _barElement.style.height = '10%';
  _barElement.style.background = 'linear-gradient(to top, gray, lightgray)';
  _barElement.style.border = '5px solid white';
  _barElement.style.borderRadius = '15px';
  _barElement.style.marginTop = '40%';

  _filledBarElement = document.createElement('div');
  _filledBarElement.id = 'loading-filled-bar';
  _filledBarElement.style.width = '0%';
  _filledBarElement.style.height = 'calc(100% - 20px)';
  _filledBarElement.style.background = 'linear-gradient(to top, lime, honeydew)';
  _filledBarElement.style.borderRadius = '10px';

  _progressElement.appendChild(_barElement);
  _barElement.appendChild(_filledBarElement);
  _updateProgress();

  document.body.appendChild(_progressElement);
};

const _showProgress = () => {
  if (_progressEnabled && _progressElement) {
    // _progressElement.value = 0;
    _progressElement.style.visibility = 'visible';
    _progressElement.style.zIndex = '98';
  }
};

const _hideProgress = () => {
  if (_progressElement) {
    _progressElement.style.visibility = 'hidden';
  }
  clearTimeout(_progressTimeout);
};

// const _updateProgressCount = (countLoaded: number, countLoading: number) => {
//   let progressValue;
//   if (countLoading !== 0) {
//     progressValue = (countLoaded / countLoading) * 100;
//   } else {
//     progressValue = 100;
//   }

//   if (_filledBarElement) {
//     _filledBarElement.style.width = progressValue + '%';
//   }
// };

const _updateProgress = () => {
  if (_progressElement) _centerElement(_progressElement);
};

/**
 * Increments the loading counter and displays the "Now Loading" image if necessary.
 *
 * @static
 * @method updateLoading
 */
export const updateLoading = () => {
  _loadingCount++;
  _paintUpperCanvas();
  _upperCanvas!.style.opacity = '1';
  _updateProgress();
};

/**
 * Erases the "Now Loading" image.
 *
 * @static
 * @method endLoading
 */
export const endLoading = () => {
  _clearUpperCanvas();
  _upperCanvas!.style.opacity = '0';
  _hideProgress();
};

/**
 * Displays the loading error text to the screen.
 *
 * @static
 * @method printLoadingError
 * @param {String} url The url of the resource failed to load
 */
export const printLoadingError = (url: string) => {
  if (_errorPrinter && !_errorShowed) {
    _updateErrorPrinter();
    _errorPrinter.innerHTML = _makeErrorHtml('Loading Error', 'Failed to load: ' + url);
    _errorPrinter.style.userSelect = 'text';
    _errorPrinter.oncontextmenu = null; // enable context menu
    const button = document.createElement('button');
    button.innerHTML = 'Retry';
    button.style.fontSize = '24px';
    button.style.color = '#ffffff';
    button.style.backgroundColor = '#000000';
    button.addEventListener('touchstart', (event) => {
      event.stopPropagation();
    });
    button.addEventListener('click', () => {
      // Does not make sense: the file is already missing
      // ResourceHandler.retry();
    });
    _errorPrinter.appendChild(button);
    _loadingCount = -Infinity;
  }
};

/**
 * Erases the loading error text.
 *
 * @static
 * @method eraseLoadingError
 */
export const eraseLoadingError = () => {
  if (_errorPrinter && !_errorShowed) {
    _errorPrinter.innerHTML = '';
    _errorPrinter.style.userSelect = 'none';
    _errorPrinter.oncontextmenu = () => false;
    startLoading();
  }
};

// The following code is partly borrowed from triacontane.
/**
 * Displays the error text to the screen.
 *
 * @static
 * @method printError
 * @param {String} name The name of the error
 * @param {String} message The message of the error
 */
export const printError = (name: string, message: string) => {
  _errorShowed = true;
  _hideProgress();
  hideFps();
  if (_errorPrinter) {
    _updateErrorPrinter();
    _errorPrinter.innerHTML = _makeErrorHtml(name, message);
    _errorPrinter.style.userSelect = 'text';
    _errorPrinter.oncontextmenu = null; // enable context menu
    if (_errorMessage) {
      _makeErrorMessage();
    }
  }
  _applyCanvasFilter();
  _clearUpperCanvas();
};

/**
 * Shows the detail of error.
 *
 * @static
 * @method printErrorDetail
 */
export const printErrorDetail = (error: Error) => {
  if (_errorPrinter && _showErrorDetail) {
    const eventInfo = _formatEventInfo(error);
    const eventCommandInfo = _formatEventCommandInfo(error);
    const info = eventCommandInfo ? eventInfo + ', ' + eventCommandInfo : eventInfo;
    const stack = _formatStackTrace(error);
    _makeErrorDetail(info, stack);
  }
};

/**
 * Sets the error message.
 *
 * @static
 * @method setErrorMessage
 */
export const setErrorMessage = (message: string) => {
  _errorMessage = message;
};

/**
 * Sets whether shows the detail of error.
 *
 * @static
 * @method setShowErrorDetail
 */
export const setShowErrorDetail = (showErrorDetail: boolean) => {
  _showErrorDetail = showErrorDetail;
};

/**
 * Shows the FPSMeter element.
 *
 * @static
 * @method showFps
 */
export const showFps = () => {
  // if (_fpsMeter) {
  //   _fpsMeter.show();
  //   _modeBox.style.opacity = 1;
  // }
  if (_modeBox) {
    _modeBox.style.opacity = '1';
  }
};

/**
 * Hides the FPSMeter element.
 *
 * @static
 * @method hideFps
 */
export const hideFps = () => {
  // if (_fpsMeter) {
  //   _fpsMeter.hide();
  //   _modeBox.style.opacity = 0;
  // }
  if (_modeBox) {
    _modeBox.style.opacity = '0';
  }
};

/**
 * Loads a font file.
 *
 * @static
 * @method loadFont
 * @param {String} name The face name of the font
 * @param {String} url The url of the font file
 */
export const loadFont = (name: string, url: string) => {
  const style = document.createElement('style');
  const head = document.getElementsByTagName('head');
  const rule = '@font-face { font-family: "' + name + '"; src: url("' + url + '"); }';
  style.type = 'text/css';
  head.item(0)?.appendChild(style);
  style.sheet?.insertRule(rule, 0);
  _createFontLoader(name);
};

/**
 * Checks whether the font file is loaded.
 *
 * @static
 * @method isFontLoaded
 * @param {String} name The face name of the font
 * @return {Boolean} True if the font file is loaded
 */
export const isFontLoaded = (name: string) => {
  if (_cssFontLoading) {
    if (_fontLoaded) {
      return _fontLoaded.check('10px "' + name + '"');
    }

    return false;
  } else {
    if (!_hiddenCanvas) {
      _hiddenCanvas = document.createElement('canvas');
    }
    const context = _hiddenCanvas.getContext('2d')!;
    const text = 'abcdefghijklmnopqrstuvwxyz';
    context.font = '40px ' + name + ', sans-serif';
    const width1 = context.measureText(text).width;
    context.font = '40px sans-serif';
    const width2 = context.measureText(text).width;
    return width1 !== width2;
  }
};

/**
 * Starts playback of a video.
 *
 * @static
 * @method playVideo
 * @param {String} src
 */
export const playVideo = (src: string) => {
  // TODO: ResourceHandler
  // _videoLoader = ResourceHandler.createLoader(null, _playVideo.bind(this, src), _onVideoError.bind(this));
  _playVideo(src);
};

/**
 * @static
 * @method _playVideo
 * @param {String} src
 * @private
 */
const _playVideo = (src: string) => {
  if (_video) {
    _video.src = src; // TODO: src
    _video.onloadeddata = _onVideoLoad;
    // TODO: ResourceHandler
    // _video.onerror = _videoLoader;
    _video.onended = _onVideoEnd;
    _video.load();
    _videoLoading = true;
  }
};

/**
 * Checks whether the video is playing.
 *
 * @static
 * @method isVideoPlaying
 * @return {Boolean} True if the video is playing
 */
export const isVideoPlaying = () => {
  return _videoLoading || _isVideoVisible();
};

/**
 * Checks whether the browser can play the specified video type.
 *
 * @static
 * @method canPlayVideoType
 * @param {String} type The video type to test support for
 * @return {Boolean} True if the browser can play the specified video type
 */
export const canPlayVideoType = (type: string) => {
  return _video && _video.canPlayType(type);
};

/**
 * Sets volume of a video.
 *
 * @static
 * @method setVideoVolume
 * @param {Number} value
 */
export const setVideoVolume = (value: number) => {
  _videoVolume = value;
  if (_video) {
    _video.volume = _videoVolume;
  }
};

/**
 * Converts an x coordinate on the page to the corresponding
 * x coordinate on the canvas area.
 *
 * @static
 * @method pageToCanvasX
 * @param {Number} x The x coordinate on the page to be converted
 * @return {Number} The x coordinate on the canvas area
 */
export const pageToCanvasX = (x: number) => {
  if (_canvas) {
    const left = _canvas.offsetLeft;
    return Math.round((x - left) / _realScale);
  } else {
    return 0;
  }
};

/**
 * Converts a y coordinate on the page to the corresponding
 * y coordinate on the canvas area.
 *
 * @static
 * @method pageToCanvasY
 * @param {Number} y The y coordinate on the page to be converted
 * @return {Number} The y coordinate on the canvas area
 */
export const pageToCanvasY = (y: number) => {
  if (_canvas) {
    const top = _canvas.offsetTop;
    return Math.round((y - top) / _realScale);
  } else {
    return 0;
  }
};

/**
 * Checks whether the specified point is inside the game canvas area.
 *
 * @static
 * @method isInsideCanvas
 * @param {Number} x The x coordinate on the canvas area
 * @param {Number} y The y coordinate on the canvas area
 * @return {Boolean} True if the specified point is inside the game canvas area
 */
export const isInsideCanvas = (x: number, y: number) => {
  return x >= 0 && x < _width && y >= 0 && y < _height;
};

/**
 * Calls pixi.js garbage collector
 */
export const callGC = () => {
  // if (isWebGL()) {
  //   _renderer.textureGC.run();
  // }
};

const Graphics = {
  /**
   * The width of the game screen.
   *
   * @static
   * @property width
   * @type Number
   */
  get width() {
    return _width;
  },
  set width(value: number) {
    if (_width !== value) {
      _width = value;
      _updateAllElements();
    }
  },
  /**
   * The height of the game screen.
   *
   * @static
   * @property height
   * @type Number
   */
  get height() {
    return _height;
  },
  set height(value: number) {
    if (_height !== value) {
      _height = value;
      _updateAllElements();
    }
  },
  /**
   * The width of the window display area.
   *
   * @static
   * @property boxWidth
   * @type Number
   */
  get boxWidth() {
    return _boxWidth;
  },
  set boxWidth(value: number) {
    _boxWidth = value;
  },
  /**
   * The height of the window display area.
   *
   * @static
   * @property boxHeight
   * @type Number
   */
  get boxHeight() {
    return _boxHeight;
  },
  set boxHeight(value: number) {
    _boxHeight = value;
  },

  /**
   * The zoom scale of the game screen.
   *
   * @static
   * @property scale
   * @type Number
   */
  get scale() {
    return _scale;
  },
  set scale(value: number) {
    if (_scale !== value) {
      _scale = value;
      _updateAllElements();
    }
  },

  get application() {
    return _application;
  },

  get ticker() {
    if (_application && _application.ticker) {
      return _application.ticker;
    } else {
      return PIXI.Ticker.shared;
    }
  }
};
export default Graphics;

/**
 * @static
 * @method _createAllElements
 * @private
 */
const _createAllElements = async () => {
  _createErrorPrinter();
  _createCanvas();
  _createVideo();
  _createUpperCanvas();
  await _createRenderer();
  // _createFPSMeter();
  _createModeBox();
  _createGameFontLoader();
};

/**
 * @static
 * @method _updateAllElements
 * @private
 */
const _updateAllElements = () => {
  _updateRealScale();
  _updateErrorPrinter();
  _updateCanvas();
  _updateVideo();
  _updateUpperCanvas();
  _updateRenderer();
  _paintUpperCanvas();
  _updateProgress();
};

/**
 * @static
 * @method _updateRealScale
 * @private
 */
const _updateRealScale = () => {
  if (_stretchEnabled) {
    let h = window.innerWidth / _width;
    let v = window.innerHeight / _height;
    if (h >= 1 && h - 0.01 <= 1) h = 1;
    if (v >= 1 && v - 0.01 <= 1) v = 1;
    _realScale = Math.min(h, v);
  } else {
    _realScale = _scale;
  }
};

/**
 * @static
 * @method _makeErrorHtml
 * @param {String} name
 * @param {String} message
 * @return {String}
 * @private
 */
const _makeErrorHtml = (name: string, message: string) => {
  return (
    '<font color="yellow"><b>' +
    name +
    '</b></font><br>' +
    '<font color="white">' +
    decodeURIComponent(message) +
    '</font><br>'
  );
};

/**
 * @static
 * @method _defaultStretchMode
 * @private
 */
const _defaultStretchMode = () => {
  // return Utils.isNwjs() || Utils.isMobileDevice();
  return true;
};

/**
 * @static
 * @method _testCanvasBlendModes
 * @private
 */
const _testCanvasBlendModes = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d')!;
  context.globalCompositeOperation = 'source-over';
  context.fillStyle = 'white';
  context.fillRect(0, 0, 1, 1);
  context.globalCompositeOperation = 'difference';
  context.fillStyle = 'white';
  context.fillRect(0, 0, 1, 1);
  const imageData1 = context.getImageData(0, 0, 1, 1);
  context.globalCompositeOperation = 'source-over';
  context.fillStyle = 'black';
  context.fillRect(0, 0, 1, 1);
  context.globalCompositeOperation = 'saturation';
  context.fillStyle = 'white';
  context.fillRect(0, 0, 1, 1);
  const imageData2 = context.getImageData(0, 0, 1, 1);
  _canUseDifferenceBlend = imageData1.data[0] === 0;
  _canUseSaturationBlend = imageData2.data[0] === 0;
  // Both should always be true.
};

/**
 * @static
 * @method _modifyExistingElements
 * @private
 */
const _modifyExistingElements = () => {
  const elements = document.getElementsByTagName('*');
  for (const element of elements) {
    const elem = element as HTMLElement;
    if (Number(elem.style.zIndex) > 0) {
      elem.style.zIndex = '0';
    }
  }
};

/**
 * @static
 * @method _createErrorPrinter
 * @private
 */
const _createErrorPrinter = () => {
  _errorPrinter = document.createElement('p');
  _errorPrinter.id = 'ErrorPrinter';
  _updateErrorPrinter();
  document.body.appendChild(_errorPrinter);
};

/**
 * @static
 * @method _updateErrorPrinter
 * @private
 */
const _updateErrorPrinter = () => {
  if (!_errorPrinter) {
    return;
  }
  _errorPrinter.style.width = String(_width * 0.9);
  if (_errorShowed && _showErrorDetail) {
    _errorPrinter.style.height = String(_height * 0.9);
  } else if (_errorShowed && _errorMessage) {
    _errorPrinter.style.height = String(100);
  } else {
    _errorPrinter.style.height = String(40);
  }
  _errorPrinter.style.textAlign = 'center';
  _errorPrinter.style.textShadow = '1px 1px 3px #000';
  _errorPrinter.style.fontSize = '20px';
  _errorPrinter.style.zIndex = '99';
  _centerElement(_errorPrinter);
};

/**
 * @static
 * @method _makeErrorMessage
 * @private
 */
const _makeErrorMessage = () => {
  const mainMessage = document.createElement('div');
  const style = mainMessage.style;
  style.color = 'white';
  style.textAlign = 'left';
  style.fontSize = '18px';
  mainMessage.innerHTML = '<hr>' + _errorMessage;
  _errorPrinter?.appendChild(mainMessage);
};

/**
 * @static
 * @method _makeErrorDetail
 * @private
 */
const _makeErrorDetail = (info: string, stack: string) => {
  const detail = document.createElement('div');
  const style = detail.style;
  style.color = 'white';
  style.textAlign = 'left';
  style.fontSize = '18px';
  detail.innerHTML = '<br><hr>' + info + '<br><br>' + stack;
  _errorPrinter?.appendChild(detail);
};

/**
 * @static
 * @method _formatEventInfo
 * @private
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _formatEventInfo = (error: any) => {
  switch (String(error.eventType)) {
    case 'map_event':
      return `MapID: ${error.mapId}, MapEventID: ${error.mapEventId}, page: ${error.page}, line: ${error.line}`;
    case 'common_event':
      return `CommonEventID: ${error.commonEventId}, line: ${error.line}`;
    case 'battle_event':
      return `TroopID: ${error.troopId}, page: ${error.page}, line: ${error.line}`;
    case 'test_event':
      return `TestEvent, line: ${error.line}`;
    default:
      return 'No information';
  }
};

/**
 * @static
 * @method _formatEventCommandInfo
 * @private
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _formatEventCommandInfo = (error: any) => {
  switch (String(error.eventCommand)) {
    case 'plugin_command':
      return '◆Plugin Command: ' + error.content;
    case 'script':
      return '◆Script: ' + error.content;
    case 'control_variables':
      return '◆Control Variables: Script: ' + error.content;
    case 'conditional_branch_script':
      return '◆If: Script: ' + error.content;
    case 'set_route_script':
      return '◆Set Movement Route: ◇Script: ' + error.content;
    case 'auto_route_script':
      return 'Autonomous Movement Custom Route: ◇Script: ' + error.content;
    case 'other':
    default:
      return '';
  }
};

/**
 * @static
 * @method _formatStackTrace
 * @private
 */
const _formatStackTrace = (error: Error) => {
  return decodeURIComponent(
    (error.stack || '')
      .replace(/file:.*js\//g, '')
      .replace(/http:.*js\//g, '')
      .replace(/https:.*js\//g, '')
      .replace(/chrome-extension:.*js\//g, '')
      .replace(/\n/g, '<br>')
  );
};

/**
 * @static
 * @method _createCanvas
 * @private
 */
const _createCanvas = () => {
  _canvas = document.createElement('canvas');
  _canvas.id = 'GameCanvas';
  _updateCanvas();
  document.body.appendChild(_canvas);
};

/**
 * @static
 * @method _updateCanvas
 * @private
 */
const _updateCanvas = () => {
  if (!_canvas) {
    return;
  }
  _canvas.width = _width;
  _canvas.height = _height;
  _canvas.style.zIndex = '1';
  _centerElement(_canvas);
};

/**
 * @static
 * @method _createVideo
 * @private
 */
const _createVideo = () => {
  _video = document.createElement('video');
  _video.id = 'GameVideo';
  _video.style.opacity = '0';
  _video.setAttribute('playsinline', '');
  _video.volume = _videoVolume;
  _updateVideo();
  // makeVideoPlayableInline(_video); // TODO: makeVideoPlayableInline
  document.body.appendChild(_video);
};

/**
 * @static
 * @method _updateVideo
 * @private
 */
const _updateVideo = () => {
  if (!_video) {
    return;
  }
  _video.width = _width;
  _video.height = _height;
  _video.style.zIndex = '2';
  _centerElement(_video);
};

/**
 * @static
 * @method _createUpperCanvas
 * @private
 */
const _createUpperCanvas = () => {
  _upperCanvas = document.createElement('canvas');
  _upperCanvas.id = 'UpperCanvas';
  _updateUpperCanvas();
  document.body.appendChild(_upperCanvas);
};

/**
 * @static
 * @method _updateUpperCanvas
 * @private
 */
const _updateUpperCanvas = () => {
  if (!_upperCanvas) {
    return;
  }
  _upperCanvas.width = _width;
  _upperCanvas.height = _height;
  _upperCanvas.style.zIndex = '3';
  _centerElement(_upperCanvas);
};

/**
 * @static
 * @method _clearUpperCanvas
 * @private
 */
const _clearUpperCanvas = () => {
  const context = _upperCanvas?.getContext('2d');
  context?.clearRect(0, 0, _width, _height);
};

/**
 * @static
 * @method _paintUpperCanvas
 * @private
 */
const _paintUpperCanvas = () => {
  _clearUpperCanvas();
  if (_loadingImage && _loadingCount >= 20) {
    const context = _upperCanvas!.getContext('2d');
    const dx = (_width - _loadingImage.width) / 2;
    const dy = (_height - _loadingImage.height) / 2;
    const alpha = numberClamp((_loadingCount - 20) / 30, 0, 1);
    context!.save();
    context!.globalAlpha = alpha;
    context!.drawImage(_loadingImage, dx, dy);
    context!.restore();
  }
};

/**
 * @static
 * @method _createRenderer
 * @private
 */
const _createRenderer = async () => {
  // PIXI.dontSayHello = true;
  // let width = _width;
  // let height = _height;
  // let options = { view: _canvas };
  // try {
  //   switch (_rendererType) {
  //     case 'webgpu':
  //       _renderer = new PIXI.WebGPURenderer();
  //       await _renderer.init({ width, height, options })
  //       break;
  //     case 'webgl':
  //       _renderer = new PIXI.WebGLRenderer();
  //       await _renderer.init({ width, height, options });
  //       break;
  //     default:
  //       _renderer = await PIXI.autoDetectRenderer({ width, height, options });
  //       break;
  //   }

  //   if (_renderer && _renderer.textureGC)
  //     _renderer.textureGC.maxIdle = 1;

  // } catch (e) {
  //   _renderer = null;
  // }
  _updateCanvas();
  _application = new PIXI.Application();
  await _application.init({ resizeTo: _canvas, canvas: _canvas, autoDensity: false, preference: 'webgpu' });

  setInterval(() => {
    if (_fpsText && _application && _application.ticker) {
      _fpsText.innerText = `${Math.floor(_application.ticker.FPS)}`;
    }
  }, 1000);
};

/**
 * @static
 * @method _updateRenderer
 * @private
 */
const _updateRenderer = () => {
  // if (_renderer) {
  //   _renderer.resize(_width, _height);
  // }
  if (_application) {
    // _updateCanvas();  // Already called
    _application.resize();
    if (_application.stage.children.length > 0) {
      _application.stage.children[0].scale = { x: _realScale, y: _realScale };
    }
  }
};

/**
 * @static
 * @method _createFPSMeter
 * @private
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _createFPSMeter = () => {
  // let options = { graph: 1, decimals: 0, theme: 'transparent', toggleOn: null };
  // _fpsMeter = new FPSMeter(options);
  // _fpsMeter.hide();
};

/**
 * @static
 * @method _createModeBox
 * @private
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _createModeBox = () => {
  const box = document.createElement('div');
  box.id = 'modeTextBack';
  box.style.position = 'absolute';
  box.style.left = '5px';
  box.style.top = '5px';
  box.style.width = '119px';
  box.style.height = '58px';
  box.style.background = 'rgba(0,0,0,0.2)';
  box.style.zIndex = '9';
  box.style.opacity = '0';

  const text = document.createElement('div');
  text.id = 'modeText';
  text.style.position = 'absolute';
  text.style.left = '0px';
  text.style.top = '41px';
  text.style.width = '119px';
  text.style.fontSize = '12px';
  text.style.fontFamily = 'monospace';
  text.style.color = 'white';
  text.style.textAlign = 'center';
  text.style.textShadow = '1px 1px 0 rgba(0,0,0,0.5)';
  text.innerHTML = isWebGPU() ? 'WebGPU mode' : 'WebGL mode';

  const fpsText = document.createElement('div');
  fpsText.id = 'modeText';
  fpsText.style.position = 'absolute';
  fpsText.style.left = '0px';
  fpsText.style.top = '2px';
  fpsText.style.width = '119px';
  fpsText.style.fontSize = '20px';
  fpsText.style.fontFamily = 'monospace';
  fpsText.style.color = 'white';
  fpsText.style.textAlign = 'center';
  fpsText.style.textShadow = '1px 1px 0 rgba(0,0,0,0.5)';
  fpsText.innerHTML = '';

  document.body.appendChild(box);
  box.appendChild(text);
  box.appendChild(fpsText);

  _modeBox = box;
  _fpsText = fpsText;
};

/**
 * @static
 * @method _createGameFontLoader
 * @private
 */
const _createGameFontLoader = () => {
  _createFontLoader('GameFont');
};

/**
 * @static
 * @method _createFontLoader
 * @param {String} name
 * @private
 */
const _createFontLoader = (name: string) => {
  const div = document.createElement('div');
  const text = document.createTextNode('.');
  div.style.fontFamily = name;
  div.style.fontSize = '0px';
  div.style.color = 'transparent';
  div.style.position = 'absolute';
  div.style.margin = 'auto';
  div.style.top = '0px';
  div.style.left = '0px';
  div.style.width = '1px';
  div.style.height = '1px';
  div.appendChild(text);
  document.body.appendChild(div);
};

/**
 * @static
 * @method _centerElement
 * @param {HTMLElement} element
 * @private
 */
const _centerElement = (element: HTMLElement) => {
  // const width = element.offsetWidth * _realScale;
  // const height = element.offsetHeight * _realScale;
  const width = _width * _realScale;
  const height = _height * _realScale;
  element.style.position = 'absolute';
  element.style.margin = 'auto';
  element.style.top = '0';
  element.style.left = '0';
  element.style.right = '0';
  element.style.bottom = '0';
  element.style.width = width + 'px';
  element.style.height = height + 'px';
};

/**
 * @static
 * @method _disableTextSelection
 * @private
 */
const _disableTextSelection = () => {
  const body = document.body;
  body.style.userSelect = 'none';
};

/**
 * @static
 * @method _disableContextMenu
 * @private
 */
const _disableContextMenu = () => {
  const elements = document.body.getElementsByTagName('*');
  for (const element of elements) {
    (element as HTMLElement).oncontextmenu = () => {
      return false;
    };
  }
};

/**
 * @static
 * @method _applyCanvasFilter
 * @private
 */
const _applyCanvasFilter = () => {
  if (_canvas) {
    _canvas.style.opacity = '0.5';
    _canvas.style.filter = 'blur(8px)';
  }
};

/**
 * @static
 * @method _onVideoLoad
 * @private
 */
const _onVideoLoad = () => {
  _video?.play();
  _updateVisibility(true);
  _videoLoading = false;
};

/**
 * @static
 * @method _onVideoError
 * @private
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _onVideoError = () => {
  _updateVisibility(false);
  _videoLoading = false;
};

/**
 * @static
 * @method _onVideoEnd
 * @private
 */
const _onVideoEnd = () => {
  _updateVisibility(false);
};

/**
 * @static
 * @method _updateVisibility
 * @param {Boolean} videoVisible
 * @private
 */
const _updateVisibility = (videoVisible: boolean) => {
  if (!_video || !_canvas) {
    return;
  }
  _video.style.opacity = videoVisible ? '1' : '0';
  _canvas.style.opacity = videoVisible ? '0' : '1';
};

/**
 * @static
 * @method _isVideoVisible
 * @return {Boolean}
 * @private
 */
const _isVideoVisible = () => {
  return _video && Number(_video.style.opacity) > 0;
};

/**
 * @static
 * @method _setupEventHandlers
 * @private
 */
const _setupEventHandlers = () => {
  window.addEventListener('resize', _onWindowResize);
  document.addEventListener('keydown', _onKeyDown);
  document.addEventListener('keydown', _onTouchEnd);
  document.addEventListener('mousedown', _onTouchEnd);
  document.addEventListener('touchend', _onTouchEnd);
};

/**
 * @static
 * @method _onWindowResize
 * @private
 */
const _onWindowResize = () => {
  _updateAllElements();
};

/**
 * @static
 * @method _onKeyDown
 * @param {KeyboardEvent} event
 * @private
 */
const _onKeyDown = (event: KeyboardEvent) => {
  if (!event.ctrlKey && !event.altKey) {
    switch (event.code) {
      case 'F2': // F2
        event.preventDefault();
        _switchFPSMeter();
        break;
      case 'F3': // F3
        event.preventDefault();
        _switchStretchMode();
        break;
      case 'F4': // F4
        event.preventDefault();
        _switchFullScreen();
        break;
    }
  }
};

/**
 * @static
 * @method _onTouchEnd
 * @param {TouchEvent} event
 * @private
 */
const _onTouchEnd = () => {
  if (!_videoUnlocked) {
    _video?.play();
    _videoUnlocked = true;
  }
  if (_isVideoVisible() && _video?.paused) {
    _video.play();
  }
};

/**
 * @static
 * @method _switchFPSMeter
 * @private
 */
const _switchFPSMeter = () => {
  // if (_fpsMeter.isPaused) {
  //   showFps();
  //   _fpsMeter.showFps();
  //   _fpsMeterToggled = false;
  // } else if (!_fpsMeterToggled) {
  //   _fpsMeter.showDuration();
  //   _fpsMeterToggled = true;
  // } else {
  //   hideFps();
  // }

  if (_modeBox?.style.opacity !== '1') {
    showFps();
  } else {
    hideFps();
  }
};

/**
 * @static
 * @method _switchStretchMode
 * @return {Boolean}
 * @private
 */
const _switchStretchMode = () => {
  _stretchEnabled = !_stretchEnabled;
  _updateAllElements();
};

/**
 * @static
 * @method _switchFullScreen
 * @private
 */
const _switchFullScreen = () => {
  if (_isFullScreen()) {
    _cancelFullScreen();
  } else {
    _requestFullScreen();
  }
};

/**
 * @static
 * @method _isFullScreen
 * @return {Boolean}
 * @private
 */
const _isFullScreen = () => document.fullscreenElement;

/**
 * @static
 * @method _requestFullScreen
 * @private
 */
const _requestFullScreen = () => {
  const element = document.body;
  if (element.requestFullscreen) {
    element.requestFullscreen();
  }
};

/**
 * @static
 * @method _cancelFullScreen
 * @private
 */
const _cancelFullScreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
};
