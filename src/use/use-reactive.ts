import { useRef, useEffect } from 'react';
import { AnyObject } from '../types';
import { useForceUpdate } from './use-force-update';

export function useReactive<T extends AnyObject>(initVal: T) {
  /** 强制更新 */
  const forceUpdate = useForceUpdate();
  /** 代理数据 */
  const reactive = useRef<T>();
  /** 当前状态 */
  const { current: state } = useRef(initVal);

  useEffect(() => {
    reactive.current = new Proxy(state, {
      set(target, key, value) {
        const result = Reflect.set(target, key, value);
        forceUpdate();
        return result;
      },
    });
  }, []);

  return reactive.current ?? initVal;
}
