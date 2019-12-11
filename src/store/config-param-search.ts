import {flatMap, fromPairs, groupBy, mapValues, max, sortBy, values} from "lodash";
import * as Fuse from "fuse.js";
import {ConfigParam, configParamValues, getConfigParamName, getConfigParamReadableName} from "../models/ConfigParam";

/**
 * This module implements searching of configuration parameters using fuse.js library.
 * fuse.js provides implementation of fuzzy search.
 */

export enum WordType {
  Code = "code",
  // CodeTokenized = "code-tokenized",
  Text = "text",
}

export interface IWord {
  id: ConfigParam,
  type: WordType,
  text: string,
}

export interface ISearchResultRecordItem {
  indices: number[][];
  score: number;
}

export interface ISearchResultRecord {
  id: ConfigParam;
  results: { [type: string]: ISearchResultRecordItem };
}

const configParamWords: IWord[] = flatMap(configParamValues, (value) => [
  {id: value, type: WordType.Code, text: getConfigParamName(value)},
  // {id: value, type: WordType.CodeTokenized, text: words(getConfigParamName(value).substring(1)).join(" ")},
  {id: value, type: WordType.Text, text: getConfigParamReadableName(value)},
]);

const engine = new Fuse(configParamWords, {
  shouldSort: false,
  findAllMatches: true,
  includeScore: true,
  includeMatches: true,
  threshold: 0.3,
  location: 0,
  distance: 500,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    "text"
  ],
});

/**
 * Search parameters using fuse.js library
 */
export const searchParams = (text: string): ISearchResultRecord[] => {
  const resultSet = engine.search(text);
  const groupedResultSet = groupBy(resultSet, (entry) => entry.item.id);
  const idToRecord = mapValues(groupedResultSet, (entries, id) => ({
    id: Number(id) as ConfigParam,
    results: fromPairs(entries.map((entry) => [
      entry.item.type,
      {
        // We add 1, because fuse.js returns index including last bound
        indices: entry.matches[0].indices.map(([start, end]: number[]) => [start, end + 1]),
        score: entry.score || 0,
      }])),
  }));
  return sortBy(values(idToRecord), sortOrderOfRecord);
};

export const sortOrderOfRecord = (record: ISearchResultRecord) => {
  const {
    results: {
      [WordType.Code]: byCode,
      // [WordType.CodeTokenized]: byTokenizedCode,
      [WordType.Text]: byText,
    },
  } = record;

  return 1 - max([
    byCode && byCode.score || 0,
    // byTokenizedCode && byTokenizedCode.score || 0,
    byText && byText.score || 0,
  ])!;
};
