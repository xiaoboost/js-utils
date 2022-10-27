// 浏览器环境判断
export const inBrowser = /* @__PURE__ */ typeof window !== 'undefined';
export const UA = /* @__PURE__ */ inBrowser && window.navigator.userAgent.toLowerCase();
export const isIE = /* @__PURE__ */ UA && /msie|trident/.test(UA);
export const isIE9 = /* @__PURE__ */ UA && UA.indexOf('msie 9.0') > 0;
export const isEdge = /* @__PURE__ */ UA && UA.indexOf('edge/') > 0;
export const isAndroid = /* @__PURE__ */ UA && UA.indexOf('android') > 0;
export const isIOS = /* @__PURE__ */ UA && /iphone|ipad|ipod|ios/.test(UA);
export const isChrome = /* @__PURE__ */ UA && /chrome\/\d+/.test(UA) && !isEdge;

// eslint-disable-next-line import/no-mutable-exports
export let supportsPassive = false;
// eslint-disable-next-line import/no-mutable-exports
export let supportsOnce = false;

if (inBrowser) {
  try {
    document.body.addEventListener(
      'test',
      null as any,
      Object.defineProperty({}, 'passive', {
        get() {
          supportsPassive = true;
        },
      }),
    );
  } catch (e) {
    // ..
  }

  try {
    document.body.addEventListener(
      'test',
      null as any,
      Object.defineProperty({}, 'once', {
        get() {
          supportsOnce = true;
        },
      }),
    );
  } catch (e) {
    // ..
  }
}
