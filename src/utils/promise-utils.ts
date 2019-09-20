
export interface IDeferred<T> {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(error?: any): void;
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
