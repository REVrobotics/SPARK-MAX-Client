import {memoize} from "lodash";

export const n10 = memoize((p) => Math.pow(10, p));
/**
 * Round to spefic number of digits in fractional part of number
 */
export const roundDecimal = (n: number, fractionalDigits: number) => {
  const factor = n10(fractionalDigits);
  return Math.round(n * factor) / factor;
};
