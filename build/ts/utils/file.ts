import * as fs from './fs';
import parseJson = require('parse-json');
import { SearchReplace, stringSearchAndReplace } from './string';

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
  return readTextFile(filePath).then((buffer) => parseJson(buffer));
}

// -----------------------------------------------------------------------------------------
export function writeJson(filePath: string, json: any, indent = DEFAULT_INDENT): Promise<void> {
  return writeTextFile(filePath, JSON.stringify(json, undefined, indent));
}

// -----------------------------------------------------------------------------------------
export async function fileSearchAndReplace(filePath: string, opts: SearchReplace | SearchReplace[]): Promise<boolean> {
  let oldBuffer: string;
  let newBuffer: string;
  oldBuffer = await readTextFile(filePath);
  const hasBom = oldBuffer.charCodeAt(0) === BOM_CODE;
  if (hasBom) {
    oldBuffer = oldBuffer.substring(1);
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
