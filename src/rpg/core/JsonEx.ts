//-----------------------------------------------------------------------------

export type Circular = {
  key: string;
  parent: object;
  value?: object;
  id?: number;
};

export type EncodeOption = {
  // The recursive depth
  depth: number;
  // The next ID number to allocate in encoding
  maxId?: number;
  // The list of modified objects. Used to restore the original object after encoding.
  circulars: Array<Circular>;
  // The registry storing encoded object, only used in decoding
  registry?: Record<number, object>;
};

export enum EncodeKey {
  ID = '@c',
  Class = '@',
  ArrayValue = '@a',
  Reference = '@r'
}

export type EncodeObjExtension = {
  // The encoding ID of this object
  [EncodeKey.ID]?: number;

  // The Class name of this object
  [EncodeKey.Class]?: string;

  // The value of this object
  [EncodeKey.ArrayValue]?: Array<unknown>;

  // Refer to an already encoded object
  [EncodeKey.Reference]?: number;
};

/**
 * The static class that handles JSON with object information.
 *
 * @class JsonEx
 */
export class JsonEx {
  private constructor() {}

  /**
   * The maximum depth of objects.
   *
   * @static
   * @property maxDepth
   * @type Number
   * @default 100
   */
  static maxDepth = 100;

  protected static _id = 1;

  protected static _generateId() {
    return JsonEx._id++;
  }

  static readonly constructors: Record<string, new () => object> = {};

  /**
   * @static
   * @method _encode
   * @param {Object} value
   * @param {Array} circular
   * @param {Number} depth
   * @return {Object}
   * @private
   */
  private static _encode(value: unknown, opt: EncodeOption & { maxId: number }): unknown {
    // opt.depth += 1;
    if (opt.depth >= this.maxDepth) {
      throw new Error('Object too deep');
    }
    // const type = Object.prototype.toString.call(value);
    // if (type === '[object Object]' || type === '[object Array]')
    if (value instanceof Object) {
      const valueExt = value as EncodeObjExtension; // To mix our own fields
      valueExt[EncodeKey.ID] = opt.maxId;
      opt.maxId += 1;

      const constructorName = this._getConstructorName(value);
      if (constructorName !== 'Object' && constructorName !== 'Array') {
        valueExt[EncodeKey.Class] = constructorName;
      }
      for (const [key, propValue] of Object.entries(value)) {
        // if (Object.hasOwn(value, key) && !key.match(/^@./)) {
        if (Object.hasOwn(value, key) && !(key.length <= 2 && key[0] == '@')) {
          // if (value[key] && typeof value[key] === 'object') {
          if (propValue && propValue instanceof Object) {
            // Object or Array
            const propValueExt = propValue as EncodeObjExtension;
            const propValueEncodedId = propValueExt[EncodeKey.ID];
            if (propValueEncodedId) {
              // Already encoded object, i.e. multiple references.
              // circular.push([key, value, propValue]);
              opt.circulars.push({
                key: key,
                parent: value,
                value: propValue
              });
              (value as unknown as { [key: string]: EncodeObjExtension })[key] = {
                [EncodeKey.Reference]: propValueEncodedId
              };
            } else {
              // Need to encode first
              (value as unknown as { [key: string]: unknown })[key] = this._encode(propValue, {
                ...opt,
                depth: opt.depth + 1
              });

              if (propValue instanceof Array) {
                // Wrap array: this is the first time it occurs.
                opt.circulars.push({
                  key: key,
                  parent: value,
                  value: propValue
                });

                const newId = propValueExt[EncodeKey.ID];
                (value as unknown as { [key: string]: EncodeObjExtension })[key] = {
                  [EncodeKey.ID]: newId,
                  [EncodeKey.ArrayValue]: propValue
                };
              }
            }
          } else {
            // string, number, boolean, or null. Should need no encoding, but I keep the original code.
            (value as unknown as { [key: string]: unknown })[key] = this._encode(propValue, {
              ...opt,
              depth: opt.depth + 1
            });
          }
        }
      }
    }
    // opt.depth -= 1;
    return value;
  }

  /**
   * @static
   * @method _getConstructorName
   * @param {Object} value
   * @return {String}
   * @private
   */
  private static _getConstructorName(value: object) {
    if (!value.constructor) {
      return undefined;
    }
    const name = value.constructor.name;
    if (name === undefined) {
      // throw new Error(`No class name found for ${value}. What are you serilizing?`);
      const func = /^\s*function\s*([A-Za-z0-9_$]*)/;
      return func.exec(value.constructor.toString())?.[1];
    }
    return name;
  }

  /**
   * @static
   * @method _decode
   * @param {Object} value
   * @param {Array} circular
   * @param {Object} registry
   * @return {Object}
   * @private
   */
  private static _decode(value: object, opt: EncodeOption & { registry: object }): unknown {
    // const type = Object.prototype.toString.call(value);
    // if (type === '[object Object]' || type === '[object Array]') {
    if (value instanceof Object) {
      const valueExt = value as EncodeObjExtension;
      opt.registry[valueExt[EncodeKey.ID]!] = value; // Must be non-null
      const className = valueExt[EncodeKey.Class];
      if (!className) {
        value = this._resetPrototype(value, undefined);
      } else {
        const constructor = this.constructors[className];
        if (constructor) {
          value = this._resetPrototype(value, constructor.prototype);
        }
      }
      for (const [key, propValue] of Object.entries(value)) {
        if (Object.hasOwn(value, key)) {
          if (propValue && propValue[EncodeKey.ArrayValue]) {
            //object is an array wrapper
            const body = propValue[EncodeKey.ArrayValue];
            body[EncodeKey.ID] = propValue[EncodeKey.ID];
            (value as unknown as Record<string, unknown>)[key] = body;
          } else if (propValue && propValue[EncodeKey.Reference]) {
            //object is reference. Will link later.
            opt.circulars.push({
              key: key,
              parent: value,
              id: propValue[EncodeKey.Reference]
            });
          }
          (value as unknown as Record<string, unknown>)[key] = this._decode(
            (value as unknown as Record<string, object>)[key],
            opt
          );
        }
      }
    }
    return value;
  }

  /**
   * @static
   * @method _resetPrototype
   * @param {Object} value
   * @param {Object} prototype
   * @return {Object}
   * @private
   */
  private static _resetPrototype<T>(value: object, prototype?: new () => T): T {
    // if (Object.setPrototypeOf !== undefined) {
    //   Object.setPrototypeOf(value, prototype);
    // } else if ('__proto__' in value) {
    //   value.__proto__ = prototype;
    // } else {
    //   const newValue = Object.create(prototype);
    //   for (const key in value) {
    //     if (value.hasOwnProperty(key)) {
    //       newValue[key] = value[key];
    //     }
    //   }
    //   value = newValue;
    // }
    // NOTE: Set prototype is not preferrable in modern browser. Use bare constructors instead.
    // This disallows inheritance.
    if (prototype) {
      const newValue = new prototype();
      for (const [k, v] of Object.entries(value)) {
        (newValue as unknown as Record<string, unknown>)[k] = v;
      }
      return newValue;
    } else {
      return value as unknown as T;
    }
  }

  /** Recover objects after encoding */
  private static _restoreCircularReference(circulars: Array<Circular>) {
    for (const circular of circulars) {
      const { key, parent, value } = circular;
      (parent as unknown as Record<string, object>)[key] = value!;
    }
  }

  /** Link objects after decoding */
  private static _linkCircularReference(circulars: Array<Circular>, registry: Record<number, object>) {
    for (const circular of circulars) {
      const { key, parent, id } = circular;
      (parent as unknown as Record<string, object>)[key] = registry[id!];
    }
  }

  private static _cleanMetadata(obj: object) {
    if (!obj) return;

    delete (obj as unknown as EncodeObjExtension)[EncodeKey.Class];
    delete (obj as unknown as EncodeObjExtension)[EncodeKey.ID];

    if (obj instanceof Object) {
      for (const value of Object.values(obj)) {
        if (value instanceof Object) {
          JsonEx._cleanMetadata(value);
        }
      }
    }
  }

  /**
   * Converts an object to a JSON string with object information.
   *
   * @static
   * @method stringify
   * @param {Object} object The object to be converted
   * @return {String} The JSON string
   */
  public static stringify(obj: object) {
    const circulars: Array<Circular> = [];
    const json = JSON.stringify(
      this._encode(obj, {
        circulars: circulars,
        depth: 0,
        maxId: 1
      })
    );
    this._cleanMetadata(obj);
    this._restoreCircularReference(circulars);

    return json;
  }

  /**
   * Parses a JSON string and reconstructs the corresponding object.
   *
   * @static
   * @method parse
   * @param {String} json The JSON string
   * @return {Object} The reconstructed object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static parse(json: string): any {
    const circulars: Array<Circular> = [];
    const registry: Record<number, object> = {};
    const contents = this._decode(JSON.parse(json), {
      circulars: circulars,
      registry: registry,
      depth: 0
    });
    this._cleanMetadata(contents as object);
    this._linkCircularReference(circulars, registry);

    return contents;
  }

  /**
   * Makes a deep copy of the specified object.
   *
   * @static
   * @method makeDeepCopy
   * @param {Object} object The object to be copied
   * @return {Object} The copied object
   */
  public static makeDeepCopy<T extends object>(obj: T): T {
    return this.parse(this.stringify(obj)) as T;
  }
}
