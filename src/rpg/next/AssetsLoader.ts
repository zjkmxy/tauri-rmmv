import * as PIXI from 'pixi.js';
import * as Utils from '../core/Utils';
import * as Decryptor from '../core/Decryptor';

export const AssetsLoader = {
  extension: undefined,
  config: undefined,
  name: 'loadTauriImg',

  testParse: undefined,
  parse: undefined,
  test: undefined, // Not used.

  unload(asset: PIXI.Texture) {
    asset.destroy(true);
  },

  async load(
    url: string,
    asset: PIXI.ResolvedAsset<PIXI.TextureSourceOptions>,
    loader: PIXI.Loader
  ): Promise<PIXI.Texture> {
    const toDecrypt = !Decryptor.checkImgIgnore(asset.src!) && Decryptor.hasEncryptedImages;
    const fileUrl = toDecrypt ? Decryptor.extToEncryptExt(asset.src!) : asset.src!;
    let imgContent = await Utils.readWwwFile(fileUrl);
    if (toDecrypt) {
      const data = await Decryptor.decryptArrayBuffer(imgContent);
      if (data) {
        imgContent = data;
      } else {
        throw new Error('Unable to decrypt image');
      }
    }
    const imageBitmap = await createImageBitmap(new Blob([imgContent], { type: 'image/png' }));
    const base = new PIXI.ImageSource({
      resource: imageBitmap,
      alphaMode: 'premultiply-alpha-on-upload',
      autoGenerateMipmaps: false,
      ...asset.data
    });
    return PIXI.createTexture(base, loader, url);
  }
} as PIXI.LoaderParser<PIXI.Texture, PIXI.TextureSourceOptions>;

export const PathParser: PIXI.ResolveURLParser = {
  extension: undefined,
  config: undefined,

  test(url: string): boolean {
    return url.startsWith('img/');
  },
  parse(value: string): PIXI.ResolvedAsset<PIXI.TextureSourceOptions> {
    if (!value.endsWith('.png')) {
      value += '.png';
    }
    return {
      src: value,
      loadParser: 'loadTauriImg'
    };
  }
};

export const intializeAssetsParsers = () => {
  PIXI.Assets.resolver.parsers.push(PathParser);
  PIXI.Assets.loader.parsers.push(AssetsLoader);
};
