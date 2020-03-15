import axios from 'axios';

import { useEffect, useRef } from 'react';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { isArray, isBoolean, isUndef } from '../shared/assert';

import { useMounted } from './use-mounted';
import { useForceUpdate } from './use-force-update';

interface AjaxError {
    code: number;
    message: string;
}

// TODO: 基础连接
axios.defaults.baseURL = '';

type FetchData<T> = (
    {
        fetch: () => Promise<T>;
        count: number;
        loading: true;
        error: null;
        data: null;
    } |
    {
        fetch: () => Promise<T>;
        count: number;
        loading: false;
        error: null;
        data: T;
    } |
    {
        fetch: () => Promise<T>;
        count: number;
        loading: false;
        error: AjaxError;
        data: null;
    }
);

interface UseFetchMethod {
    /**
     * 获取数据
     */
    <T = any>(url: string): FetchData<T>;

    /**
     * 获取数据
     *  - immediate 是否立即获取数据
     */
    <T = any>(url: string, immediate: boolean): FetchData<T>;

    /**
     * 获取数据
     *  - depend 数组内容变更时会重新获取
     *  - 不会立即获取数据
     */
    <T = any>(url: string, depend: any[]): FetchData<T>;

    /**
     * 获取数据
     *  - params `Get` 获取时为链接中的参数，`Post`获取时为附带的获取数据
     *  - 不会立即获取数据
     */
    <T = any, P extends object = Record<string, any>>(url: string, params: P): FetchData<T>;

    /**
     * 获取数据
     *  - params `Get` 获取时为链接中的参数，`Post`获取时为附带的获取数据
     *  - depend 数组内容变更时会重新获取
     *  - 不会立即获取数据
     */
    <T = any, P extends object = Record<string, any>>(url: string, params: P, depend: any[]): FetchData<T>;

    /**
     * 获取数据
     *  - params `Get` 获取时为链接中的参数，`Post`获取时为附带的获取数据
     *  - immediate 是否立即获取数据
     */
    <T = any, P extends object = Record<string, any>>(url: string, params: P, immediate: boolean): FetchData<T>;

    /**
     * 获取数据
     *  - params `Get` 获取时为链接中的参数，`Post`获取时为附带的获取数据
     *  - depend 数组内容变更时会重新获取
     *  - immediate 是否立即获取数据
     */
    <T = any, P extends object = Record<string, any>>(url: string, params: P, depend: any[], immediate: boolean): FetchData<T>;
}

interface PromiseSwitch {
    resolve(arg: any): void;
    reject(arg: any): void;
}

function standard(
    url: string,
    params?: Record<string, any> | any[] | boolean,
    depend?: any[] | boolean,
    immediate?: boolean,
) {
    // 一个参数
    if (isUndef(params)) {
        params = {};
        depend = [];
        immediate = false;
    }
    // 两个参数
    else if (isUndef(depend)) {
        if (isBoolean(params)) {
            immediate = params as any;
            params = {};
            depend = [];
        }
        else if (isArray(params)) {
            depend = params;
            params = {};
            immediate = false;
        }
        else {
            depend = [];
            immediate = false;
        }
    }
    // 三个参数
    else if (isUndef(immediate)) {
        if (isArray(params)) {
            immediate = depend as boolean;
            depend = params;
            params = {};
        }
        else if (isArray(depend)) {
            immediate = false;
        }
        else {
            immediate = depend;
            depend = [];
        }
    }

    return [url, params, depend, immediate] as [string, Record<string, any>, any[], boolean];
}

export function useFetch<T = any>(params: AxiosRequestConfig, depend: any[] = [], immediate = false): FetchData<T> {
    const isMounted = useMounted();
    const forceUpdate = useForceUpdate();
    const { current: immeRef } = useRef(immediate);
    const { current: state } = useRef({
        count: 0,
        loading: immediate,
        error: null as null | AjaxError,
        result: null as null | T,
    });

    /** 外部 promise 开关 */
    const { current: promise } = useRef<PromiseSwitch>({
        resolve: () => void 0,
        reject: () => void 0,
    });

    /** 重置状态 */
    function beforeFetch() {
        state.loading = true;
        state.result = null;
        state.error = null;
        state.count += 1;

        forceUpdate();
    }

    /** 获取数据 */
    function fetch() {
        axios(params)
            .then(({ data }: AxiosResponse<T>) => {
                if (!isMounted()) {
                    return;
                }

                state.result = data;
                state.loading = false;
                promise.resolve(data);

                forceUpdate();
            })
            .catch((error: AjaxError) => {
                if (!isMounted()) {
                    return;
                }

                state.error = error;
                state.loading = false;
                promise.reject(error);

                forceUpdate();
            });
    }

    /**
     * 重新获取数据
     *  - 这里并不会直接调用`fetch`函数，而是通过变更`loading`状态触发`useEffect`来实现的，
     *    这么做主要是为了保证是最后才触发调用，确保传进来的`params`是最新的值，而不是旧的值
     */
    function reFetch(): Promise<T> {
        beforeFetch();

        return new Promise((resolve, reject) => {
            promise.reject = reject;
            promise.resolve = resolve;
        });
    }

    // 外部数据监听
    useEffect(() => {
        if (state.count === 0) {
            return;
        }

        beforeFetch();
    }, depend);

    // 首次运行
    useEffect(() => {
        if (immeRef) {
            beforeFetch();
        }
    }, []);

    // 内部数据监听
    useEffect(() => {
        if (!state.loading) {
            return;
        }

        fetch();
    }, [state.loading]);

    return {
        count: state.count,
        fetch: reFetch,
        loading: state.loading,
        error: state.error,
        data: state.result,
    } as FetchData<T>;
}

export const useGet: UseFetchMethod = (
    iurl: string,
    iparams?: Record<string, any> | any[] | boolean,
    idepend?: any[] | boolean,
    iimmediate?: boolean,
) => {
    const [url, params, depend, immediate] = standard(iurl, iparams, idepend, iimmediate);
    return useFetch({ url, params, method: 'GET' }, depend, immediate);
};

export const usePost: UseFetchMethod = (
    iurl: string,
    iparams?: Record<string, any> | any[] | boolean,
    idepend?: any[] | boolean,
    iimmediate?: boolean,
) => {
    const [url, data, depend, immediate] = standard(iurl, iparams, idepend, iimmediate);
    return useFetch({ url, data, method: 'POST' }, depend, immediate);
};

export const usePut: UseFetchMethod = (
    iurl: string,
    iparams?: Record<string, any> | any[] | boolean,
    idepend?: any[] | boolean,
    iimmediate?: boolean,
) => {
    const [url, data, depend, immediate] = standard(iurl, iparams, idepend, iimmediate);
    return useFetch({ url, data, method: 'PUT' }, depend, immediate);
};
