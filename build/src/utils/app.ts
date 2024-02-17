import * as fs from 'node:fs';
import * as path from 'node:path';

import { pwd } from '@homeofthings/node-sys';
import { logError, logInfo, logVerbose, logWarn } from '@homeofthings/node-utils';
import * as debugjs from 'debug';

const _BASE_DIR = path.resolve(__dirname, '..', '..', '..', '..');
const debug = debugjs.default('build:utils:file');

export let APPNAME = '<app>';

export enum LogLevel {
  'VERBOSE',
  'INFO',
  'WARN',
  'ERROR',
  'FATAL',
}

export let ERRORS = 0;
export let WARNINGS = 0;

export type LoggingFunction = (message: string, ...params: unknown[]) => void;

export const LOGGING_FUNCTIONS: { [key in LogLevel]: LoggingFunction } = {
  [LogLevel.VERBOSE]: verbose,
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
export function verbose(message: string, ...params: unknown[]) {
  logVerbose(`${APPNAME}: ${message} `, ...params);
}

// -----------------------------------------------------------------------------------------
export function log(message: string, ...params: unknown[]) {
  logInfo(`${APPNAME}: ${message} `, ...params);
}

// -----------------------------------------------------------------------------------------
export function warn(message: string, ...params: unknown[]) {
  logWarn(`${APPNAME}: WARNING: ${message} `, ...params);
  WARNINGS++;
}

// -----------------------------------------------------------------------------------------
export function error(message: string, ...params: unknown[]) {
  logError(`${APPNAME}: ERROR: ${message} `, ...params);
  ERRORS++;
}

// -----------------------------------------------------------------------------------------
export function die(message: string, ...params: unknown[]) {
  logError(`${APPNAME}: FATAL: ${message} `, ...params);
  process.exit(-1);
}

// -----------------------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function invariant(condition: any, level: LogLevel, message: string): boolean {
  if (!condition) {
    LOGGING_FUNCTIONS[level](message);
    return false;
  }
  return true;
}
