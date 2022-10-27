const enum StorageType {
  local,
  session,
}

const timeSplit = '/*time-limit*/';

function requestIdleCallback(cb: () => any) {
  window.requestIdleCallback ? window.requestIdleCallback(cb) : setTimeout(cb, 0);
}

class StorageWrapper {
  /**
   * 时间限制
   *  - 单位：天
   */
  private limit: number;

  /** 存储数据库 */
  private storage: Storage;

  constructor(type: StorageType, limit = 30) {
    this.limit = limit;

    if (type === StorageType.local) {
      this.storage = localStorage;
    } else {
      this.storage = sessionStorage;
    }
  }

  get length() {
    return this.storage.length;
  }

  private get hasLimit() {
    return this.storage === window.localStorage && this.limit !== Infinity && this.limit > 0;
  }

  private get limitTime() {
    return Math.floor(new Date().getTime()) + 1000 * 60 * 60 * 24 * this.limit;
  }

  /** 获取储存的原始值 */
  private getOriginValue(key: string) {
    const [value, limit] = this.hasLimit
      ? (this.storage.getItem(key) ?? '').split(timeSplit)
      : [this.storage.getItem(key), Infinity];

    // 没有值
    if (!value) {
      return null;
    }

    // 超过时间限制
    if (new Date().getTime() > Number(limit)) {
      this.remove(key);
      return null;
    }

    return value;
  }

  get<T = string>(key: string): T | null {
    const value = this.getOriginValue(key);

    if (!value) {
      return null;
    }

    let result: T;

    try {
      result = JSON.parse(value);
    } catch (e) {
      result = value as any;
      console.warn(e);
    }

    return result;
  }

  set(key: string, value: any) {
    requestIdleCallback(() => {
      const str = this.hasLimit
        ? `${JSON.stringify(value)}${timeSplit}${this.limitTime}`
        : JSON.stringify(value);

      this.storage.setItem(key, str);
    });
  }

  remove(key: string) {
    requestIdleCallback(() => {
      this.storage.removeItem(key);
    });
  }

  exist(key: string) {
    return this.getOriginValue(key) !== null;
  }

  clear(exclude: string[] = []) {
    requestIdleCallback(() => {
      // 保存临时变量
      const data = exclude.map((key) => ({
        key,
        value: this.get(key),
      }));

      // 清除所有缓存
      this.storage.clear();
      // 临时值存入缓存
      data.forEach(({ key, value }) => this.set(key, value));
    });
  }
}

export const local = /* @__PURE__ */ new StorageWrapper(StorageType.local);
export const session = /* @__PURE__ */ new StorageWrapper(StorageType.session);
