export type AnyObject<T = any> = Record<string, T>;
export type AnyFunction = (...args: any[]) => any;
export type EmptyObject = Record<string, never>;
export type PartPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Writeable<T extends AnyObject> = { -readonly [P in keyof T]: T[P] };
export type GetArrayItem<T> = T extends Array<infer R> ? R : never;
export type GetPromiseType<T> = T extends Promise<infer U> ? U : never;

export type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : T extends AnyFunction
    ? T
    : T extends AnyObject
      ? DeepReadonlyObject<T>
      : T;

export interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

export type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};
