import { isFunc, isString, isUndef, isDef, isNumber } from "./assert";
import { AnyObject } from "./types";

type ChannelName = string | number;
type EventHandler<T = any> = (...payloads: T[]) => any;
type ReadonlyObject<T> = T extends AnyObject ? Readonly<T> : T;

type GetWatcherType<W> = W extends Watcher<infer R> ? R : never;
type GetWatcherListType<W extends readonly Watcher<any>[]> = {
  [K in keyof W]: GetWatcherType<W[K]>;
};
type CreateWatcherList<V extends readonly any[]> = {
  [K in keyof V]: Watcher<V[K]>;
};

/** 分类数据储存 */
export class ChannelData<T = any> {
  private _data: Record<ChannelName, T[]> = {};

  push(channel: ChannelName, data: T) {
    if (!this._data[channel]) {
      this._data[channel] = [];
    }

    this._data[channel].push(data);
  }

  pop(channel: ChannelName) {
    const stack = this._data[channel];

    if (!stack) {
      return;
    }

    const result = stack.pop();

    if (stack.length === 0) {
      delete this._data[channel];
    }

    return result;
  }

  /**
   * 移除单独的值
   *   - 此值没有和频道名称重叠时，才会检索值
   */
  remove(data: T): void;
  /** 移除某个频道的全部值 */
  remove(channel: ChannelName): void;
  remove(channel: ChannelName, data: T): void;
  remove(channel: ChannelName | T, data?: T) {
    const removeVal = (name: ChannelName, value: T) => {
      if (this._data[name]) {
        this._data[name] = this._data[name].filter((item) => item !== value);
      }
    };

    if (isUndef(data)) {
      // 是字符串或者数字时，先检索频道名
      if ((isString(channel) || isNumber(channel)) && this._data[channel]) {
        delete this._data[channel];
        return;
      }

      // 否则检索所有值
      for (const key of Object.keys(this._data)) {
        removeVal(key, channel as any);
      }
    }
    else if (isDef(channel) && isDef(data)) {
      removeVal(channel, data);
    }
  }

  clear() {
    this._data = {};
  }

  forEach(cb: (item: T, channel: ChannelName, index: number) => any) {
    for (const key of Object.keys(this._data)) {
      for (let i = 0; i < this._data[key].length; i++) {
        cb(this._data[key][i], key, i);
      }
    }
  }

  forEachInChannel(channel: ChannelName, cb: (item: T, index: number) => any) {
    (this._data[channel] ?? []).forEach(cb);
  }
}

/** 频道订阅者 */
export class ChannelSubscriber {
  /** 事件数据 */
  private _data = new ChannelData<EventHandler>();

  /** 注册观测器 */
  observe(name: ChannelName, ev: EventHandler) {
    this._data.push(name, ev);

    /** 返回取消观测器方法 */
    return () => {
      this._data.remove(name, ev);
    };
  }

  /** 取消全部观测器 */
  unObserve(): void;
  /** 取消此回调的观测器 */
  unObserve(ev: EventHandler): void;
  /** 取消此类全部观测器 */
  unObserve(name: ChannelName): void;
  /** 取消此类中的某个回调观测器 */
  unObserve(name: ChannelName, ev: EventHandler): void;

  unObserve(name?: ChannelName | EventHandler, ev?: EventHandler) {
    if (!name) {
      this._data.clear();
    }
    else {
      this._data.remove(name as string, ev as EventHandler);
    }
  }

  /** 发布变化 */
  notify(name: ChannelName, ...payloads: any[]) {
    this._data.forEachInChannel(name, (cb) => {
      cb(...payloads);
    });
  }
}

/** 订阅者 */
export class Subscriber<T> {
  /** 事件数据 */
  private _events: EventHandler<T>[] = [];

  /** 注册观测器 */
  observe(ev: EventHandler<T>) {
    // 添加观测器
    this._events.push(ev);
    // 返回注销观测器的函数
    return () => this.unObserve(ev);
  }

  /** 注销全部观测器 */
  unObserve(): void;
  /** 注销此回调的观测器 */
  unObserve(ev: EventHandler<T>): void;

  unObserve(ev?: EventHandler<T>) {
    if (!ev) {
      this._events = [];
    }
    else {
      this._events = this._events.filter((cb) => cb !== ev);
    }
  }

  /** 发布变化 */
  notify(newVal: T, lastVal: T) {
    this._events.forEach((cb) => cb(newVal, lastVal));
  }
}

/** 监控者 */
export class Watcher<T> extends Subscriber<T> {
  static computed<
    Watchers extends readonly Watcher<any>[],
    Params extends GetWatcherListType<Watchers>,
    Values extends readonly any[]
  >(
    watchers: Watchers,
    cb: (...args: Params) => Values
  ): CreateWatcherList<Values> {
    const initVal = cb(...(watchers.map(({ _data }) => _data) as any));
    const newWatchers = initVal.map((init) => new Watcher(init));

    // 更新所有观测器的回调
    const observeCb = () => {
      const current: Params = watchers.map(({ _data }) => _data) as any;
      cb(...current).forEach((val, i) => {
        newWatchers[i].setData(val);
      });
    };

    // 绑定回调
    watchers.forEach((watcher) => watcher.observe(observeCb));

    return newWatchers as any;
  }

  /** 原始值 */
  protected _data: T;

  get data(): ReadonlyObject<T> {
    return this._data as any;
  }

  constructor(initVal: T) {
    super();
    this._data = initVal;
  }

  /** 设置值 */
  setData(val: T) {
    if (val !== this._data) {
      const last = this._data;

      this._data = val;
      this.notify(val, last);
    }
  }

  /**
   * 绑定监听器
   *  - `event`监听器回调
   *  - `immediately`是否立即运行
   */
  observe(event: EventHandler<T>, immediately = false) {
    const unObserve = super.observe(event);

    // 只运行当前回调
    if (immediately) {
      event(this._data);
    }

    return unObserve;
  }

  /** 监听一次变化 */
  once(val?: T | ((item: T) => boolean)) {
    const func =
      arguments.length === 0
        ? () => true
        : isFunc(val)
          ? val
          : (item: T) => item === val;

    return new Promise<ReadonlyObject<T>>((resolve) => {
      const callback = (item: T) => {
        if (func(item)) {
          this.unObserve(callback);
          resolve(item as ReadonlyObject<T>);
        }
      };

      this.observe(callback);
    });
  }
  /** 扩展并生成新的监控器 */
  computed<U>(cb: (val: T) => U): Watcher<U> {
    const watcher = new Watcher(cb(this._data));
    this.observe((val) => watcher.setData(cb(val)));
    return watcher;
  }
}
