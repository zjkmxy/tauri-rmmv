export type RequestQueueRequest = {
  isRequestReady: () => boolean;
  startRequest: () => void;
};

export type RequestQueueItem = {
  key: string;
  value: RequestQueueRequest;
};

export class RequestQueue {
  protected readonly _queue: Array<RequestQueueItem> = [];

  constructor() {}

  public enqueue(key: string, value: RequestQueueRequest) {
    this._queue.push({
      key: key,
      value: value
    });
  }

  public update() {
    if (this._queue.length === 0) return;

    const top = this._queue[0];
    if (top.value.isRequestReady()) {
      this._queue.shift();
      if (this._queue.length !== 0) {
        this._queue[0].value.startRequest();
      }
    } else {
      top.value.startRequest();
    }
  }

  public raisePriority(key: string) {
    for (let n = 0; n < this._queue.length; n++) {
      const item = this._queue[n];
      if (item.key === key) {
        this._queue.splice(n, 1);
        this._queue.unshift(item);
        break;
      }
    }
  }

  public clear() {
    this._queue.splice(0);
  }
}
