import * as fs from 'fs';
import * as util from 'util';
import * as _dbg from 'debug';

const debug = _dbg('build:utils:fs');

const _readFilePromised = util.promisify(fs.readFile);
const _writeFilePromised = util.promisify(fs.writeFile);
const _renamePromised = util.promisify(fs.rename);
const _statPromised = util.promisify(fs.stat);
const _unlinkPromised = util.promisify(fs.unlink);

// -----------------------------------------------------------------------------------------
export function readFile(filePath: fs.PathLike, options: BufferEncoding): Promise<string | Buffer> {
  return _readFilePromised(filePath, options).catch((err) => {
    debug(`reading '${filePath}' failed: ${err}`);
    return Promise.reject(err);
  });
}

// -----------------------------------------------------------------------------------------
export function writeFile(filePath: fs.PathLike, data: string | NodeJS.ArrayBufferView, options?: fs.WriteFileOptions): Promise<void> {
  const tmpFilePath = filePath + '.tmp';
  return _writeFilePromised(tmpFilePath, data)
    .catch((err) => {
      debug(`writing '${tmpFilePath}' failed: ${err}`);
      return Promise.reject(err);
    })
    .then(() => renameFile(tmpFilePath, filePath));
}

// -----------------------------------------------------------------------------------------
export function renameFile(oldFilePath: fs.PathLike, newFilePath: fs.PathLike): Promise<void> {
  return _renamePromised(oldFilePath, newFilePath).catch((err) => {
    debug(`renaming '${oldFilePath}' to '${newFilePath}' failed: : ${err}`);
    return Promise.reject(err);
  });
}

// -----------------------------------------------------------------------------------------
export function statFile(filePath: fs.PathLike, ignoreNotExist = false): Promise<fs.Stats | undefined> {
  return _statPromised(filePath).catch((err) => {
    if (ignoreNotExist && err.code === 'ENOENT') {
      return undefined;
    }
    debug(`stat '${filePath}' failed: : ${err}`);
    return Promise.reject(err);
  });
}

// -----------------------------------------------------------------------------------------
export function unlink(filePath: fs.PathLike, ignoreNotExist = false): Promise<void> {
  return _unlinkPromised(filePath).catch((err) => {
    if (ignoreNotExist && err.code === 'ENOENT') {
      return Promise.resolve();
    }
    debug(`unlink '${filePath}' failed: : ${err}`);
    return Promise.reject(err);
  });
}
