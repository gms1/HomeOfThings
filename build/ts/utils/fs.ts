import * as fs from 'fs';
import * as util from 'util';
import * as _dbg from 'debug';

const debug = _dbg('build:utils:fs');

export const BOM_CODE = 0xfeff;
export const DEFAULT_INDENT = 2;

const _readFilePromised = util.promisify(fs.readFile);
const _writeFilePromised = util.promisify(fs.writeFile);
const _renamePromised = util.promisify(fs.rename);
const _statPromised = util.promisify(fs.stat);
const _unlinkPromised = util.promisify(fs.unlink);

// -----------------------------------------------------------------------------------------
export function readTextFilePromised(path: fs.PathLike | number, options: BufferEncoding): Promise<string> {
  return _readFilePromised(path, options).catch((err) => {
    debug(`reading '${path}' failed: ${err}`);
    return Promise.reject(err);
  });
}

// -----------------------------------------------------------------------------------------
export function writeTextFilePromised(path: fs.PathLike | number, data: string): Promise<void> {
  return _writeFilePromised(path, data).catch((err) => {
    debug(`writing '${path}' failed: ${err}`);
    return Promise.reject(err);
  });
}

// -----------------------------------------------------------------------------------------
export function renameFilePromised(oldPath: fs.PathLike, newPath: fs.PathLike): Promise<void> {
  return _renamePromised(oldPath, newPath).catch((err) => {
    debug(`renaming '${oldPath}' to '${newPath}' failed: : ${err}`);
    return Promise.reject(err);
  });
}

// -----------------------------------------------------------------------------------------
export function statFilePromised(path: fs.PathLike): Promise<fs.Stats | undefined> {
  return _statPromised(path).catch((err) => undefined);
}

// -----------------------------------------------------------------------------------------
export function unlinkPromised(path: fs.PathLike): Promise<fs.Stats | undefined> {
  return _unlinkPromised(path).catch((err) => undefined);
}
