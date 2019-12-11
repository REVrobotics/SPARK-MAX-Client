// tslint:disable-next-line:no-reference
/// <reference path="./index.d.ts" />

import labels from "./labels";
import messages from "./messages";
import {substitute} from "../utils/string-utils";
import {coalesce} from "../utils/object-utils";

const translations: { [name: string]: string } = {
  ...labels,
  ...messages,
};

export function tt(id: string, params?: { [name: string]: any }): string {
  return coalesce(params ? substitute(translations[id], params) : translations[id], id);
}

export { DictionaryName, translateWord } from "./dictionaries";

// tslint:disable-next-line:no-string-literal
window["tt"] = tt;
