import * as PIXI from 'pixi.js';

/**
 * The root object of the display tree.
 */
export class Stage extends PIXI.Container {
  constructor() {
    super();

    // The interactive flag causes a memory leak.
    this.interactive = false;

    this.filters = [];
  }

  /** The frame-based update. Approximately 60 FPS. */
  public update() {
    this.updateChildren();
  }

  /** The frame-independent update. Approximately 60 FPS. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public updateDelta(delta: number) {
    this.updateChildrenDelta(delta);
  }

  /**
   * Update the children of the scene EACH frame.
   *
   * @method updateChildren
   * @instance
   * @memberof Scene_Base
   */
  public updateChildren() {
    for (const child of this.children) {
      if (child instanceof Stage && child.update) {
        child.update();
      }
    }
  }

  /**
   * Update the children of the scene frame-independently.
   *
   * @method updateChildrenDelta
   * @instance
   * @memberof Scene_Base
   */
  public updateChildrenDelta(delta: number) {
    for (const child of this.children) {
      if (child instanceof Stage && child.updateDelta) {
        child.updateDelta(delta);
      }
    }
  }

  /**
   * [read-only] The array of children of the stage.
   *
   * @property children
   * @type Array
   */

  /**
   * Adds a child to the container.
   *
   * @method addChild
   * @param {Object} child The child to add
   * @return {Object} The child that was added
   */

  /**
   * Adds a child to the container at a specified index.
   *
   * @method addChildAt
   * @param {Object} child The child to add
   * @param {Number} index The index to place the child in
   * @return {Object} The child that was added
   */

  /**
   * Removes a child from the container.
   *
   * @method removeChild
   * @param {Object} child The child to remove
   * @return {Object} The child that was removed
   */

  /**
   * Removes a child from the specified index position.
   *
   * @method removeChildAt
   * @param {Number} index The index to get the child from
   * @return {Object} The child that was removed
   */
}
