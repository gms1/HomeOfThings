import * as path from 'path';
import * as fs from './utils/fs';
import parseJson = require('parse-json');

export var appname: string;
const INDENT = 2;

// -----------------------------------------------------------------------------------------
export function setApplication(filename: string) {
  appname = path.basename(filename);
}

// -----------------------------------------------------------------------------------------
export function log(message: string, ...params) {
  console.log(`${appname}: ${message} `, ...params);
}

// -----------------------------------------------------------------------------------------
export function warn(message: string, ...params) {
  console.warn(`${appname}: WARNING: ${message} `, ...params);
}

// -----------------------------------------------------------------------------------------
export function error(message: string, ...params) {
  console.error(`${appname}: ERROR: ${message} `, ...params);
}

// -----------------------------------------------------------------------------------------
export function die(message: string, ...params) {
  error(message, ...params);
  process.exit(1);
}

// -----------------------------------------------------------------------------------------
export async function readTextFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
  try {
    return await fs.readTextFilePromised(filePath, encoding);
  } catch (err) {
    error(`reading '${filePath}' failed: ${err}`);
    throw err;
  }
}

// -----------------------------------------------------------------------------------------
export async function writeTextFile(filePath: string, data: string): Promise<void> {
  try {
    const tmpFilePath = filePath + '.tmp';
    await fs.writeTextFilePromised(tmpFilePath, data);
    await fs.renameFilePromised(tmpFilePath, filePath);
  } catch (err) {
    error(`failed to write '${filePath}': ${err}`);
    throw err;
  }
}

// -----------------------------------------------------------------------------------------
export async function readJson(filePath: string): Promise<any> {
  let oldBuffer = await readTextFile(filePath);
  try {
    return parseJson(oldBuffer);
  } catch (err) {
    error(`failed to parse '${filePath}': ${err}`);
    throw err;
  }
}

// -----------------------------------------------------------------------------------------
export async function writeJson(filePath: string, json: any): Promise<void> {
  let newBuffer = JSON.stringify(json, undefined, INDENT);
  await writeTextFile(filePath, newBuffer);
}
