import {isFunction} from "lodash";

export interface IDeferred<T> {
  promise: Promise<T>;

  resolve(value: T): void;

  reject(error?: any): void;
}

export interface IThenable {
  then(onResolve: (value: any) => any, onReject?: (reason: any) => any): IThenable;
}

export function delayPromise(timeout: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

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

export function when(value: any): IThenable {
  if (isThenable(value)) {
    return value;
  } else {
    return Promise.resolve(value);
  }
}

export function logError<T>(reason: any): Promise<T> {
  if (reason instanceof Error) {
    console.error(reason);
  }
  return Promise.reject(reason);
}