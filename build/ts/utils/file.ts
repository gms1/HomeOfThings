import * as fs from './fs';
import parseJson = require('parse-json');

export const BOM_CODE = 0xfeff;
const DEFAULT_INDENT = 2;

// -----------------------------------------------------------------------------------------
export function readTextFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
  return fs.readFile(filePath, encoding) as Promise<string>;
}

// -----------------------------------------------------------------------------------------
export function writeTextFile(filePath: string, data: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
  return fs.writeFile(filePath, data, encoding);
}

// -----------------------------------------------------------------------------------------
export function readJson(filePath: string): Promise<any> {
  return readTextFile(filePath).catch((buffer) => parseJson(buffer));
}

// -----------------------------------------------------------------------------------------
export function writeJson(filePath: string, json: any, indent = DEFAULT_INDENT): Promise<void> {
  return writeTextFile(filePath, JSON.stringify(json, undefined, indent));
}

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

// -----------------------------------------------------------------------------------------
export async function fileSearchAndReplace(filePath: string, opts: SearchReplace | SearchReplace[]): Promise<boolean> {
  let oldBuffer: string;
  let newBuffer: string;
  oldBuffer = await readTextFile(filePath);
  const hasBom = oldBuffer.charCodeAt(0) === BOM_CODE;
  if (hasBom) {
    oldBuffer = oldBuffer.substr(1);
  }
  newBuffer = stringSearchAndReplace(oldBuffer, opts);
  if (hasBom) {
    newBuffer = String.fromCharCode(BOM_CODE) + newBuffer;
  }
  if (oldBuffer === newBuffer) {
    return false;
  }
  await writeTextFile(filePath, newBuffer);
  return true;
}
