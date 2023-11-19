import * as path from 'node:path';

const _BASE_DIR = path.resolve(__dirname, '..', '..', '..');

export var APPNAME: string = '<app>';

export enum LogLevel {
  'INFO',
  'WARN',
  'ERROR',
  'FATAL',
}

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
  const workDir = process.cwd();
  const workspaceDir = path.relative(workDir, _BASE_DIR);
  return workspaceDir;
}

// -----------------------------------------------------------------------------------------
export function log(message: string, ...params) {
  console.log(`${APPNAME}: ${message} `, ...params);
}

// -----------------------------------------------------------------------------------------
export function warn(message: string, ...params) {
  console.warn(`${APPNAME}: WARNING: ${message} `, ...params);
}

// -----------------------------------------------------------------------------------------
export function error(message: string, ...params) {
  console.error(`${APPNAME}: ERROR: ${message} `, ...params);
}

// -----------------------------------------------------------------------------------------
export function die(message: string, ...params) {
  error(message, ...params);
  process.exit(-1);
}

// -----------------------------------------------------------------------------------------
export function invariant(condition: any, level: LogLevel, message: string) {
  if (!condition) {
    LOGGING[level](message);
  }
}
