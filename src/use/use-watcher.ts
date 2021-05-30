import { Watcher } from '../subject';
import { AnyObject } from '../types';
import { BaseType, isBaseType } from '../assert';
import { useForceUpdate } from './use-force-update';

import { useRef, useEffect } from 'react';

export function useWatcher<T extends BaseType>(watcher: Watcher<T>): [T, (val: T) => void];
export function useWatcher<T extends AnyObject>(watcher: Watcher<T>): [Readonly<T>, (val: Partial<T>) => void];
export function useWatcher<T>(watcher: Watcher<T>) {
  const update = useForceUpdate();
  const state = useRef(watcher.data);
  const setStatus = isBaseType(watcher.data)
    ? (val: T) => watcher.setData(val)
    : (val: Partial<T>) => watcher.setData({
      ...state.current,
      ...val,
    });

  function handleChange(val: T) {
    state.current = val as any;
    update();
  }

  useEffect(() => {
    watcher.observe(handleChange);
    return () => watcher.unObserve(handleChange);
  }, []);

  return [state.current, setStatus] as const;
}

interface ListActions<U, T extends Array<U>> {
  /** 重新填充数据 */
  reset: (newList: T) => void;
  /** 将元素加入数组末尾 */
  push: (...items: U[]) => void;
  /** 弹出最后的元素 */
  pop: () => U | undefined;
  /** 移除指定下标的元素 */
  remove: (index: number) => void;
  /** 替换指定下标的元素 */
  replace: (index: number, val: U) => void;
  /** 清空数组 */
  clear: () => void;
}

export function useWatcherList<U, T extends Array<U>>(watcher: Watcher<T>) {
  const update = useForceUpdate();
  const state = useRef(watcher.data);
  const setStatus = (val: T) => watcher.setData(val);
  const methods: ListActions<U, T> = {
    reset: (newList: T) => setStatus(newList),
    push(...items: U[]) {
      const newList = state.current.slice();
      newList.push(...items);
      setStatus(newList as any);
    },
    pop() {
      const newList = state.current.slice();
      const result = newList.pop();
      setStatus(newList as any);
      return result;
    },
    remove(index: number) {
      const newList = state.current.slice();
      newList.slice(index, 1);
      setStatus(newList as any);
    },
    clear() {
      setStatus([] as any);
    },
    replace(index: number, val: U) {
      const newList = state.current.slice();
      newList.splice(index, 1, val);
      setStatus(newList as any);
    },
  };

  function handleChange(val: T) {
    state.current = val as any;
    update();
  }

  useEffect(() => {
    watcher.observe(handleChange);
    return () => watcher.unObserve(handleChange);
  }, []);

  return [state.current, methods] as const;
}
