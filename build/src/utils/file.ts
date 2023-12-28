/* eslint-disable @typescript-eslint/no-explicit-any */

import { promises as fsNode, WriteFileOptions } from 'node:fs';

import { rename } from '@homeofthings/node-sys';
import * as debugjs from 'debug';
import parseJson = require('parse-json');

import { SearchReplace, stringSearchAndReplace } from './string';

export const BOM_CODE = 0xfeff;
const DEFAULT_INDENT = 2;

const debug = debugjs.default('build:utils:file');

// -----------------------------------------------------------------------------------------
export function readTextFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
  return fsNode.readFile(filePath, encoding) as Promise<string>;
}

// -----------------------------------------------------------------------------------------
export function writeTextFile(filePath: string, data: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
  return fsNode.writeFile(filePath, data, encoding);
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

// -----------------------------------------------------------------------------------------
export function readFile(filePath: string, options: BufferEncoding): Promise<string | Buffer> {
  return fsNode.readFile(filePath, options).catch((err) => {
    debug(`reading '${filePath}' failed: ${err}`);
    return Promise.reject(err);
  });
}

// -----------------------------------------------------------------------------------------
export function writeFile(filePath: string, data: string | NodeJS.ArrayBufferView, options?: WriteFileOptions): Promise<void> {
  const tmpFilePath = filePath + '.tmp';
  return fsNode
    .writeFile(tmpFilePath, data, options)
    .catch((err) => {
      debug(`writing '${tmpFilePath}' failed: ${err}`);
      return Promise.reject(err);
    })
    .then(() => rename(tmpFilePath, filePath));
}
