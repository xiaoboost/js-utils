/** Part partial */
declare type PartPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** To overwrite a read-only interface as writable */
declare type Writeable<T extends object> = { -readonly [P in keyof T]: T[P] };

/** Overwrite some property types in an interface */
declare type Overwrite<T extends object, K extends object> = Omit<T, Extract<keyof T, keyof K>> & K;

/** return the array type */
declare type GetArray<T> = T extends (any | Array<infer R>) ? R[] : never;

/** return the array type */
declare type GetArrayItem<T> = T extends Array<infer R> ? R : never;

/** get Promise type */
declare type GetPromise<T> = T extends Promise<infer U> ? Promise<U> : never;

/** get Promise item */
declare type GetPromiseType<T> = T extends Promise<infer U> ? U : never;

/** get string type */
declare type GetString<T> = T extends string ? T : never;

/** typf of any function */
declare type AnyFunction = (...args: any[]) => any;
