import { isString, isObject } from './assert';

export type ClassObject = Record<string, boolean>;
export type ClassInput = string | undefined | ClassObject;

/** 解析对象 class */
export function stringifyClass(...opt: ClassInput[]): string {
  /** 解析 class 对象 */
  function parseClassObject(classObject: ClassObject) {
    return Object.keys(classObject).filter((key) => classObject[key]);
  }

  const className: string[] = [];

  for (let i = 0; i < opt.length; i++) {
    const item = opt[i];

    if (isObject(item)) {
      className.push(...parseClassObject(item));
    }
    else if (isString(item)) {
      className.push(item);
    }
  }

  return className
    .join(' ')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join(' ');
}

/**
 * 生成随机字符串
 * @param {number} [len=16] 字符串长度
 * @returns {string}
 */
export function randomString(len = 16) {
  const start = 48, end = 126;
  const exclude = '\\/[]?{};,<>:|`';

  let codes = '';
  while (codes.length < len) {
    const code = String.fromCharCode(Math.random() * (end - start) + start);

    if (!exclude.includes(code)) {
      codes += code;
    }
  }

  return codes;
}

/**
 * Hyphenate a camelCase string.
 * @param {string} str
 */
export function hyphenate(str: string) {
  return str.replace(/\B([A-Z])/g, '-$1').toLowerCase();
}

/**
 * base64 编码转换为 Blob
 * @param {string} base64 base64 源码
 * @return {Blob} 转换后的 blob 数据
 */
export function toBlob(base64: string) {
  const label = 'base64,';
  const source = base64.slice(base64.indexOf(label) + label.length);
  const binary = window.atob(source);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes.buffer]);
}

/** ArrayBuffer 转换为 base64 */
export function bufferToBase64(arrayBuffer: ArrayBuffer) {
  let base64    = '';

  const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes = new Uint8Array(arrayBuffer);
  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;

  let a: number, b: number, c: number, d: number;
  let chunk: number;

  // Main loop deals with bytes in chunks of 3
  for (let i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048)   >> 12; // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032)     >>  6; // 4032     = (2^6 - 1) << 6
    d = chunk & 63;               // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder === 1) {
    chunk = bytes[mainLength];

    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3)   << 4; // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '==';
  }
  else if (byteRemainder === 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008)  >>  4; // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15)    <<  2; // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '=';
  }

  return base64;
}

/** base64 转换为 ArrayBuffer */
export function base64ToBuffer(dataURI: string) {
  const BASE64_MARKER = ';base64,';
  const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  const base64 = dataURI.substring(base64Index);
  const raw = window.atob(base64);
  const rawLength = raw.length;
  const array = new Uint8Array(new ArrayBuffer(rawLength));

  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }

  return array;
}

/** 中横杠转驼峰 */
export function toCamelCase(str: string) {
  return str.replace(/-([a-zA-Z])/g, (_, $1: string) => $1.toUpperCase());
}
