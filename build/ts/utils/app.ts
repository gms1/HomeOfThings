import * as path from 'path';

export var appname: string;

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
