
export function delayPromise(timeout: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}
