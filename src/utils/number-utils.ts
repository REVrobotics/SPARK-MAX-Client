import {memoize} from "lodash";

export const n10 = memoize((p) => Math.pow(10, p));
export const roundDecimal = (n: number, fractionalDigits: number) => {
  const factor = n10(fractionalDigits);
  return Math.round(n * factor) / factor;
};
