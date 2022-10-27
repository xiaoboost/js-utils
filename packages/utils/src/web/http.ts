import { isBaseType, isUndef } from '../assert';
import { AnyObject } from '../types';

/**
 * 由输入对象创建 url 链接参数
 * @param {object} params 参数对象
 * @returns {string}
 */
export function urlParamEncode(params: AnyObject) {
  /** 解析参数中的对象 */
  function objEncode(from: AnyObject, pre = '') {
    let ans = '';

    for (const key in from) {
      if (from.hasOwnProperty(key)) {
        const val = from[key];

        if (isUndef(val)) {
          continue;
        }

        // 非顶级属性则需要加上方括号
        const uKey = pre.length > 0 ? `[${key}]` : key;
        // 连接参数
        ans += isBaseType(val)
          ? `&${pre}${uKey}=${encodeURIComponent(val!.toString())}`
          : `&${objEncode(val, `${pre}${uKey}`)}`;
      }
    }

    return ans.substring(1);
  }

  const result = objEncode(params);

  return result.length > 0 ? `?${result}` : '';
}

/** 创建获取 url 参数的函数 */
const createUrlMethod = /* @__PURE__ */ function createUrlMethod(reg: (str: string) => string) {
  return (name: string) => {
    name = name.replace(/[[\]]/g, '\\$&');

    const regex = new RegExp(reg(name));
    const results = regex.exec(window.location.href);

    if (!results || !results[1]) {
      return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  };
};

/** 获取 url 中的参数 - 问号后面的参数 */
export const getQueryByName = /* @__PURE__ */ createUrlMethod((name: string) => {
  return `[?&]${name}(=([^&#]*)|&|#|$)`;
});

/** 获取 url 中的参数 - 链接中的参数 */
export const getParameterByName = /* @__PURE__ */ createUrlMethod((name) => {
  return `\\/${name}(\\/([^&# ]+?)(\\/|\\?|$))`;
});

/** ajax 请求接口 */
const ajax = /* @__PURE__ */ function ajax<T>(type: 'GET' | 'POST', url: string, data?: AnyObject) {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(type, url);

    if (type === 'POST') {
      xhr.setRequestHeader('Content-Type', 'application/json');
    }

    xhr.send(type === 'POST' && data ? JSON.stringify(data) : null);

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) {
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Network Error: ${xhr.status}`));
      }
    };
  });
};

/** GET 请求 */
export const get = /* @__PURE__ */ <T = any>(url: string, params: AnyObject = {}) => {
  return ajax<T>('GET', `${url}${urlParamEncode(params)}`);
};

/** POST 请求 */
export const post = /* @__PURE__ */ <T = any>(url: string, data?: AnyObject) => {
  return ajax<T>('POST', url, data);
};

/** 加载外部 script 文件 */
export function loadScript(src: string, id?: string, callback?: () => void) {
  // src 重复
  if (document.querySelector(`[src|="${src}"]`)) {
    return;
  }

  // id 重复
  if (id && document.getElementById(id)) {
    return;
  }

  const script = document.createElement('script');
  const firstScript = document.getElementsByTagName('script')[0];

  if (id) {
    script.id = id;
  }

  script.async = true;
  script.src = src;

  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.body.appendChild(script);
  }

  if (callback) {
    script.addEventListener('load', callback);
  }
}
