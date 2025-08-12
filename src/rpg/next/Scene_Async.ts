//-----------------------------------------------------------------------------
// Scene_Async
//
// The scene class for asynchronous operations.

import { Scene_Base } from "../scenes/Scene_Base";
import { DisposableStack } from "../core/DisposableStack";

export type SceneAsyncExecutor = (scene: Scene_Async) => Promise<void>;

export class Scene_Async extends Scene_Base {
  protected _disposableStack: DisposableStack;
  protected _executor: SceneAsyncExecutor;
  protected _createdPromise: Promise<void>;
  protected _createdResolver: (() => void) | undefined;
  protected _startedPromise: Promise<void>;
  protected _startedResolver: (() => void) | undefined;
  protected _mainPromise: Promise<void> | undefined;

  constructor(executor: SceneAsyncExecutor) {
    super();
    this._disposableStack = new DisposableStack();
    this._executor = executor;
    this._createdPromise = new Promise((
      resolve,
    ) => (this._createdResolver = resolve));
    this._startedPromise = new Promise((
      resolve,
    ) => (this._startedResolver = resolve));
  }

  public get disposableStack() {
    return this._disposableStack;
  }

  public override async create() {
    // Start the executor
    this._mainPromise = this._executor(this);
    // Wait for the executor to call finishCreate()
    await this._createdPromise;
  }

  public override async start() {
    this._active = true;
    this._mainRunning = true;

    // Signal the start of executor
    this._startedResolver!();
    // No need to await main, but instead await the executor
    await this._mainPromise;

    this._mainRunning = false;
  }

  public async finishCreation() {
    // Signal the end of create()
    this._createdResolver!();
    // Wait for start() to be called
    await this._startedPromise;
  }

  public override updateDelta(delta: number): void {
    super.updateDelta(delta);
    // Signal update if needed
    this.emit("updateDelta", delta);
  }

  public override async main() {
    // No need to do anything.
  }

  public override terminate() {
    super.terminate();
    this._disposableStack.dispose();
  }
}

export const makeAsyncScene = (
  executor: SceneAsyncExecutor,
) => {
  return class extends Scene_Async {
    constructor() {
      super(executor);
    }
  };
}
