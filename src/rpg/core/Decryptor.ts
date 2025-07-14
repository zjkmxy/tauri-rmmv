export const hasEncryptedImages = false;
export const hasEncryptedAudio = false;
// const _requestImgFile = [];
const _headerlength = 16;
// const _xhrOk = 400;
let _encryptionKey = '';
const _ignoreList = ['img/system/Window.png'];
export const SIGNATURE = '5250474d56000000';
export const VER = '000301';
export const REMAIN = '0000000000';

export const checkImgIgnore = (url: string) => {
  for (let cnt = 0; cnt < _ignoreList.length; cnt++) {
    if (url === _ignoreList[cnt]) return true;
  }
  return false;
};

export const decryptUrl = async (url: string): Promise<Uint8Array | undefined> => {
  // url = extToEncryptExt(url);
  const fileUrl = extToEncryptExt(url);

  // const requestFile = new XMLHttpRequest();
  // requestFile.open('GET', url);
  // requestFile.responseType = 'arraybuffer';
  // requestFile.send();

  // requestFile.onload = () => {
  //   if (status < _xhrOk) {
  //     const arrayBuffer = decryptArrayBuffer(requestFile.response);
  //     const image = bitmap._image!;
  //     image.src = createBlobUrl(arrayBuffer);
  //     image.addEventListener('load', (bitmap._loadListener = Bitmap.prototype._onLoad.bind(bitmap)));
  //     image.addEventListener(
  //       'error',
  //       (bitmap._errorListener = bitmap._loader || Bitmap.prototype._onError.bind(bitmap))
  //     );
  //   }
  // };

  // requestFile.onerror = () => {
  //   if (bitmap._loader) {
  //     bitmap._loader();
  //   } else {
  //     bitmap._onError();
  //   }
  // };

  const requestFile = await fetch(fileUrl);
  if (requestFile.ok) {
    return await decryptArrayBuffer(new Uint8Array(await requestFile.arrayBuffer()));
  } else {
    return undefined;
  }

  // fs version
  // try {
  //   const requestFile = await Utils.fetchFile(fileUrl);
  //   return await decryptArrayBuffer(requestFile);
  // } catch {
  //   return undefined;
  // }
};

// export const decryptHTML5Audio = (url, bgm, pos) => {
//   const requestFile = new XMLHttpRequest();
//   requestFile.open('GET', url);
//   requestFile.responseType = 'arraybuffer';
//   requestFile.send();

//   requestFile.onload = () => {
//     if (status < _xhrOk) {
//       const arrayBuffer = decryptArrayBuffer(requestFile.response);
//       const url = createBlobUrl(arrayBuffer);
//       AudioManager.createDecryptBuffer(url, bgm, pos);
//     }
//   };
// };

// export const decryptArrayBuffer = (arrayBuffer: ArrayBuffer) => {
export const decryptArrayBuffer = (arrayBuffer: Uint8Array) => {
  if (!arrayBuffer) return undefined;
  const header = new Uint8Array(arrayBuffer.buffer, arrayBuffer.byteOffset, _headerlength);

  let i;
  const ref = SIGNATURE + VER + REMAIN;
  const refBytes = new Uint8Array(16);
  for (i = 0; i < _headerlength; i++) {
    refBytes[i] = parseInt('0x' + ref.substr(i * 2, 2), 16);
  }
  for (i = 0; i < _headerlength; i++) {
    if (header[i] !== refBytes[i]) {
      throw new Error('Header is wrong');
    }
  }

  arrayBuffer = arrayBuffer.slice(_headerlength);
  // readEncryptionkey();  //TODO: Set key externally
  if (arrayBuffer) {
    const byteArray = new Uint8Array(arrayBuffer);
    for (i = 0; i < _headerlength; i++) {
      byteArray[i] = byteArray[i] ^ parseInt(_encryptionKey[i], 16);
      arrayBuffer[i] = byteArray[i];
    }
  }

  return arrayBuffer;
};

export const createBlobUrl = (arrayBuffer: ArrayBuffer) => {
  const blob = new Blob([arrayBuffer]);
  return window.URL.createObjectURL(blob);
};

export const extToEncryptExt = (url: string) => {
  const ext = url.split('.').pop();
  if (!ext) {
    return url;
  }
  let encryptedExt = ext;

  if (ext === 'ogg') encryptedExt = '.rpgmvo';
  else if (ext === 'm4a') encryptedExt = '.rpgmvm';
  else if (ext === 'png') encryptedExt = '.rpgmvp';
  else encryptedExt = ext;

  return url.slice(0, url.lastIndexOf(ext) - 1) + encryptedExt;
};

// export const readEncryptionkey = () => {
//   _encryptionKey = $dataSystem.encryptionKey.split(/(.{2})/).filter(Boolean);
// };
export const setEncryptionKey = (key: string) => {
  _encryptionKey = key;
};
