import {get} from "lodash";

/**
 * Substitutes parameters in the text by values from the provided object.
 * Each parameter should start from `$` (dollar) character
 *
 * ```ts
 * substitute("My name is $name", {name: "John"})
 * ```
 * @param text
 * @param params
 */
export const substitute = (text: string, params: {[name: string]: string}) =>
  text.replace(/\$([a-zA-Z0-9_]+)/g, (_, name) => get(params, name, ""));

/**
 * Compares two dot-delimited versions.
 */
export const compareVersions = (v1: string, v2: string): number => {
  const v1Parts = v1.toString().split(".").map(Number);
  const v2Parts = v2.toString().split(".").map(Number);

  const vLength = Math.max(v1Parts.length, v2Parts.length);

  for (let i = 0; i < vLength; i++) {
    const diff = (v1Parts[i] || 0) - (v2Parts[i] || 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
};
