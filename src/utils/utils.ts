import striptags from "striptags";
import { isNumber } from "util";

// Pulled source from https://github.com/stevenvachon/normalize-html-whitespace#readme
const pattern = /[\f\n\r\t\v ]{2,}/g;
const replacement = " ";
import { replace, trim } from "lodash";

// https://stackoverflow.com/a/36429733
const removeNbsp = (text: string) =>
  replace(text, new RegExp("&nbsp;", "g"), " ");
const removeWhitespace = (text: string) => replace(text, pattern, replacement);

/**
 * Using a few different techniques, removes html, misc. formatting elements, and trailing whitespace form the input.
 * @param text text that may contain html or formatting characters.
 * @returns a new string with those html and formatting elements removed.
 */
export const cleanText = (text: string) => {
  return trim(removeWhitespace(removeNbsp(striptags(text))));
};

/**
 * Filter to remove undefined while mapping.
 * https://github.com/Microsoft/TypeScript/issues/20707#issuecomment-351874491
 *
 * Usage:
 * feedThreadIds
 *   .get<string[]>(feedId, [])
 *   .map(id => state.feedState.feedThreadCache.get(id))
 *   .filter(notUndefined);
 */
export function notUndefined<T>(variable: T | undefined | null): variable is T {
  return variable !== undefined;
}

/**
 * Filter to remove falsy value
 */
export function isTruthy<T>(variable: T | undefined | null): variable is T {
  if (variable) {
    return true;
  } else {
    return false;
  }
}

export const toNumber = (value: any, fallback: number): number => {
  try {
    if (isNumber(value)) {
      return value;
    } else {
      return parseInt("" + value, 10);
    }
  } catch (error) {
    return fallback;
  }
};
