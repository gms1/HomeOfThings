import * as fs from 'node:fs';
import * as _dbg from 'debug';

const debug = _dbg('build:utils:fs');

// -----------------------------------------------------------------------------------------
export function readFile(filePath: fs.PathLike, options: BufferEncoding): Promise<string | Buffer> {
  return fs.promises.readFile(filePath, options).catch((err) => {
    debug(`reading '${filePath}' failed: ${err}`);
    return Promise.reject(err);
  });
}

// -----------------------------------------------------------------------------------------
export function writeFile(filePath: fs.PathLike, data: string | NodeJS.ArrayBufferView, options?: fs.WriteFileOptions): Promise<void> {
  const tmpFilePath = filePath + '.tmp';
  return fs.promises
    .writeFile(tmpFilePath, data)
    .catch((err) => {
      debug(`writing '${tmpFilePath}' failed: ${err}`);
      return Promise.reject(err);
    })
    .then(() => renameFile(tmpFilePath, filePath));
}

// -----------------------------------------------------------------------------------------
export function renameFile(oldFilePath: fs.PathLike, newFilePath: fs.PathLike): Promise<void> {
  return fs.promises.rename(oldFilePath, newFilePath).catch((err) => {
    debug(`renaming '${oldFilePath}' to '${newFilePath}' failed: : ${err}`);
    return Promise.reject(err);
  });
}

// -----------------------------------------------------------------------------------------
export function statFile(filePath: fs.PathLike, ignoreNotExist = false): Promise<fs.Stats | undefined> {
  return fs.promises.stat(filePath).catch((err) => {
    if (ignoreNotExist && err.code === 'ENOENT') {
      return undefined;
    }
    debug(`stat '${filePath}' failed: : ${err}`);
    return Promise.reject(err);
  });
}

// -----------------------------------------------------------------------------------------
export function unlink(filePath: fs.PathLike, ignoreNotExist = false): Promise<void> {
  return fs.promises.unlink(filePath).catch((err) => {
    if (ignoreNotExist && err.code === 'ENOENT') {
      return Promise.resolve();
    }
    debug(`unlink '${filePath}' failed: : ${err}`);
    return Promise.reject(err);
  });
}
