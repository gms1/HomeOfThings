import * as fs from 'node:fs';
import * as path from 'node:path';

import { pwd } from '@homeofthings/node-sys';
import * as debugjs from 'debug';

const _BASE_DIR = path.resolve(__dirname, '..', '..', '..', '..');
const debug = debugjs.default('build:utils:file');

export let APPNAME: string = '<app>';

export enum LogLevel {
  'INFO',
  'WARN',
  'ERROR',
  'FATAL',
}

export let ERRORS = 0;
export let WARNINGS = 0;

type LoggingFunction = (message: string, ...params) => void;

const LOGGING: { [key in LogLevel]: LoggingFunction } = {
  [LogLevel.INFO]: log,
  [LogLevel.WARN]: warn,
  [LogLevel.ERROR]: error,
  [LogLevel.FATAL]: die,
};

// -----------------------------------------------------------------------------------------
export function setApplication(filename: string) {
  APPNAME = path.basename(filename);
}

// -----------------------------------------------------------------------------------------
export function getWorkspaceDir(): string {
  const workDir = pwd();
  const workspaceDir = path.relative(workDir, _BASE_DIR);

  const nxJsonPath = path.resolve(workspaceDir, 'nx.json');
  if (!fs.existsSync(nxJsonPath)) {
    throw new Error(`failed to resolve workspace directory ('${workspaceDir}' seems to be wrong)`);
  }

  debug('workspace directory: ', workspaceDir);
  return workspaceDir;
}

// -----------------------------------------------------------------------------------------
export function log(message: string, ...params) {
  console.log(`${APPNAME}: ${message} `, ...params);
}

// -----------------------------------------------------------------------------------------
export function warn(message: string, ...params) {
  console.warn(`${APPNAME}: WARNING: ${message} `, ...params);
  WARNINGS++;
}

// -----------------------------------------------------------------------------------------
export function error(message: string, ...params) {
  console.error(`${APPNAME}: ERROR: ${message} `, ...params);
  ERRORS++;
}

// -----------------------------------------------------------------------------------------
export function die(message: string, ...params) {
  error(message, ...params);
  process.exit(-1);
}

// -----------------------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function invariant(condition: any, level: LogLevel, message: string) {
  if (!condition) {
    LOGGING[level](message);
  }
}