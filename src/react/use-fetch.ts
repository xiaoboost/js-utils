import { default as axios, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

import { useState, useEffect } from 'react';
import { isArray, isBoolean, isUndef } from '../shared/assert';

// TODO: 基础连接
axios.defaults.baseURL = '';

/** 错误消息 */
interface ResError {
    code: number;
    message: string;
}

/** 后台数据 */
interface Ajax<T = any> {
    code: number;
    message: string;
    data: T;
}

/**
 * 异步 hook 返回数据
 *  - [结果，loading，错误信息，再次获取]
 */
type FetchData<T> = (
    [null, true, null, () => void] |
    [T, false, null, () => void] |
    [null, false, ResError, () => void]
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
            params = {};
            depend = [];
            immediate = params as any;
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
        if (isArray(depend)) {
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
    const [loading, setLoading] = useState(immediate);
    const [result, setResult] = useState<null | T>(null);
    const [error, setError] = useState<null | ResError>(null);
    const [allow, setAllow] = useState(immediate);

    // 依赖带上“允许获取”标志位
    const depends = depend.concat([loading, allow]);

    function reFetch() {
        if (!allow) {
            setAllow(true);
        }

        setLoading(true);
        setResult(null);
        setError(null);
    }

    useEffect(() => {
        if (!allow || !loading) {
            return;
        }

        axios(params)
            .then(({ data }: AxiosResponse<Ajax<T>>) => {
                setLoading(false);

                if (data.code === 200) {
                    setResult(data.data);
                }
                else {
                    setError({
                        code: data.code,
                        message: data.message,
                    });
                }
            })
            .catch((error: AxiosError) => {
                setLoading(false);

                setError({
                    code: Number(error.code || 0),
                    message: error.message,
                });

                return error;
            });
    }, depends);

    return [result, loading, error, reFetch] as FetchData<T>;
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
