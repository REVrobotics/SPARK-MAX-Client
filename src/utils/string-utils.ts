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
