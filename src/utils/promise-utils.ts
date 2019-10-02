import {isFunction} from "lodash";

/**
 * {@link IDeferred} is an unwrapped {@link Promise}. It is just a helper to implement {@link Promise}.
 */
export interface IDeferred<T> {
  promise: Promise<T>;

  resolve(value: T): void;

  reject(error?: any): void;
}

export interface IThenable {
  then(onResolve: (value: any) => any, onReject?: (reason: any) => any): IThenable;
}

/**
 * Return a {@link Promise} which is resolved after given timeout.
 */
export function delayPromise(timeout: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

/**
 * Creates {@link IDeferred}.
 */
export function deferred<T>(): IDeferred<T> {
  let doResolve: any;
  let doReject: any;

  const promise = new Promise<T>((resolve, reject) => {
    doResolve = resolve;
    doReject = reject;
  });

  return {
    promise,
    resolve: doResolve,
    reject: doReject,
  };
}

export function isThenable(value: any): value is IThenable {
  return value && isFunction(value.then);
}

/**
 * This methods always returns {@link IThenable} object ({@link Promise}).
 * If provided value is {@link IThenable}, this method does nothing and returns this value.
 * Otherwise value is wrapped into a {@link Promise}.
 * @param value
 */
export function when(value: any): IThenable {
  if (isThenable(value)) {
    return value;
  } else {
    return Promise.resolve(value);
  }
}

/**
 * It is convenient to use this method as catch callback in promise chains.
 * It just prints {@link Error}s in the console.
 *
 * ```ts
 *   promise
 *     .then(...)
 *     .then(...)
 *     .catch(logError)
 *     .catch((...);
 * ```
 */
export function logError<T>(reason: any): Promise<T> {
  if (reason instanceof Error) {
    console.error(reason);
  }
  return Promise.reject(reason);
}
