import {get} from "lodash";

export const substitute = (text: string, params: {[name: string]: string}) =>
  text.replace(/\$([a-zA-Z0-9_]+)/g, (_, name) => get(params, name, ""));
