// -----------------------------------------------------------------------------------------

// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace

export interface SearchReplace {
  search: string | RegExp;

  // pattern:
  // $$      ... inserts $
  // $&      ... inserts the matched substring
  // $`      ... inserts the portion of the string that precedes the matched substring.
  // $'      ... inserts the portion of the string that follows the matched substring.
  // $n      ... inserts the nth parenthesized submatch string
  // $<Name> ... inserts capturing group
  replace: string | ((substring: string, ...args: any[]) => string);
}

// -----------------------------------------------------------------------------------------
export function stringSearchAndReplace(input: string, opts: SearchReplace | SearchReplace[]): string {
  if (Array.isArray(opts)) {
    return opts.reduce((prev, opt) => {
      return stringSearchAndReplace(prev, opt);
    }, input);
  } else {
    return input.replace(opts.search, opts.replace as any);
  }
}
