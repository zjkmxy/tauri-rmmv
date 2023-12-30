export const DefaultFps = 60;

export interface Interpolator {
  get value(): number;
  get done(): boolean;
  updateDelta(delta: number): number;
}

export class LinearInterpolator implements Interpolator {
  protected _current: number;
  protected _remaining: number;

  constructor(
    public readonly start: number,
    public readonly target: number,
    public readonly duration: number
  ) {
    this._current = start;
    this._remaining = duration;
  }

  get value(): number {
    return this._current;
  }

  get done(): boolean {
    return this._remaining > 1e-8;
  }

  public updateDelta(delta: number): number {
    if (this._remaining <= 1e-8 + delta) {
      this._current = this.target;
      this._remaining = 0;
    } else {
      const pastRatio = delta / this._remaining;
      const newValue = this._current + (this.target - this._current) * pastRatio;
      this._current = newValue;
      this._remaining -= delta;
    }
    return this._current;
  }

  public static fromFrame(start: number, target: number, frame: number) {
    return new LinearInterpolator(start, target, frame / DefaultFps);
  }
}
