import { CopyOptions as NodeCopyOptions, Mode, promises as fsNode, Stats } from 'node:fs';
import * as nodePath from 'node:path';
import * as nodeProcess from 'node:process';
import { promisify } from 'node:util';

import * as externalChmodr from 'chmodr';
import * as externalChownr from 'chownr';
import * as externMkTemp from 'mktemp';
import externalMv from 'mv';
import { Mode as StatsMode } from 'stat-mode';
import externalTouch from 'touch';
import externalWhich from 'which';

import { logCommand, logCommandArgs, logCommandResult } from '../log/command';

// NOTE:
// shell would be needed for getting shell expansion (e.g for pathname expansion (globbing) of '*', '?', '[...]' wildcards)
// but in general we should avoid using the shell, or calling programs which are most likely not installed on all systems

export { StatsMode };
export interface TouchOptions extends Pick<externalTouch.Options, 'time' | 'atime' | 'mtime' | 'nocreate' | 'ref'> {
  atime?: boolean;
  mtime?: boolean;
}
export type CopyOptions = Pick<NodeCopyOptions, 'dereference' | 'preserveTimestamps' | 'recursive'>;

// to call the external function directly
export const _chmodR = promisify(externalChmodr.default);
export const _chownR = promisify(externalChownr.default);
export const _mkTemp = promisify(externMkTemp.createFile);
export const _touch = externalTouch;
export const _mv = promisify(externalMv);
export const _which = externalWhich;

export const IS_WIN = process.platform === 'win32';

let OLDPWD: string = _pwd();
const DIRSTACK: string[] = [];

function _cd(directory: string): void {
  if (directory === '-') {
    directory = OLDPWD;
  }
  const oldpwd = _pwd();
  nodeProcess.chdir(directory);
  OLDPWD = oldpwd;
}

function _pwd(): string {
  return nodeProcess.cwd();
}

function _dirs(): string[] {
  return [_pwd(), ...DIRSTACK];
}

export function basename(path: string, suffix?: string): string {
  return nodePath.basename(path, suffix);
}

export function dirname(path: string): string {
  return nodePath.dirname(path);
}

export function cd(directory: string): void {
  logCommandArgs('cd', directory);
  _cd(directory);
}

export function pwd(): string {
  logCommand('pwd');
  const res = _pwd();
  return logCommandResult(res);
}

export function pushd(directory: string): string[] {
  logCommandArgs('pushd', directory);
  DIRSTACK.unshift(_pwd());
  _cd(directory);
  return _dirs();
}

export function popd(): string[] {
  logCommand('popd');
  const directory = DIRSTACK.shift();
  if (!directory) {
    return _dirs();
  }
  _cd(directory);
  return _dirs();
}

export function dirs(): string[] {
  logCommand('dirs');
  return _dirs();
}

export function exit(code: number): void {
  logCommandArgs('exit', code.toString());
  nodeProcess.exit(code);
}

export function realpath(path: string): Promise<string> {
  logCommandArgs('realpath', path);
  return fsNode.realpath(path).then((output) => logCommandResult(output));
}

export function stat(path: string): Promise<Stats> {
  logCommandArgs('stat', path);
  return fsNode.stat(path);
}

export function mode(path: string): Promise<number> {
  return stat(path).then((stats) => (stats.mode ?? 0) & 0o7777);
}

export function statsMmode(path: string): Promise<StatsMode> {
  return stat(path).then((stats) => new StatsMode(stats));
}

export function exists(path: string): Promise<boolean> {
  return fsNode
    .stat(path)
    .then(() => true)
    .catch(() => false);
}

export function which(name: string, options?: { all: boolean }): Promise<string[]> {
  let res: Promise<string[]>;

  if (options?.all) {
    logCommandArgs('which', '-a', name);
    res = _which(name, { nothrow: true, all: true });
  } else {
    logCommandArgs('which', name);
    res = _which(name, { nothrow: true }).then((path) => (path ? [path] : []));
  }
  return res.then((output) => logCommandResult(output));
}

export function copyFile(fromPath: string, toPath: string): Promise<void> {
  logCommandArgs('cp', fromPath, toPath);
  return fsNode.copyFile(fromPath, toPath);
}

export function unlink(path: string): Promise<void> {
  logCommandArgs('unlink', path);
  return fsNode.unlink(path);
}

export function ln(source: string, destination: string): Promise<void> {
  logCommandArgs('ln', '-s', source, destination);
  return fsNode.symlink(source, destination, 'junction'); // NOTE: 'junction' is only used on windows platform
}

export function mktemp(prefix: string, options?: { directory: boolean }): Promise<string> {
  let res: Promise<string>;

  if (options?.directory) {
    logCommandArgs('mktemp', '-d', prefix);
    res = fsNode.mkdtemp(prefix);
  } else {
    logCommandArgs('mktemp', prefix);
    res = _mkTemp(prefix + 'XXXXXXX') as Promise<string>;
  }
  return res.then((output) => logCommandResult(output));
}

export async function chmod(path: string | string[] | Promise<string[]>, mode: Mode, options?: { recursive: boolean }): Promise<void> {
  const paths = await (typeof path === 'string' ? [path] : path);
  if (options?.recursive) {
    logCommandArgs('chmod', '-r', mode.toString(), ...paths);
    return Promise.all(paths.map((p) => _chmodR(p, mode))).then(() => {});
  } else {
    logCommandArgs('chmod', mode.toString(), ...paths);
    return Promise.all(paths.map((p) => fsNode.chmod(p, mode))).then(() => {});
  }
}

export async function chown(path: string | string[] | Promise<string[]>, uid: number, gid: number, options?: { recursive: boolean }): Promise<void> {
  const paths = await (typeof path === 'string' ? [path] : path);
  if (options?.recursive) {
    logCommandArgs('chown', '-r', `${uid}:${gid}`, ...paths);
    return Promise.all(paths.map((p) => _chownR(p, uid, gid))).then(() => {});
  } else {
    logCommandArgs('chown', `${uid}:${gid}`, ...paths);
    return Promise.all(paths.map((p) => fsNode.chown(p, uid, gid))).then(() => {});
  }
}

export async function mkdir(path: string | string[] | Promise<string[]>, options?: { mode?: Mode; recursive?: boolean }): Promise<void> {
  const paths = await (typeof path === 'string' ? [path] : path);
  const log: string[] = ['mkdir'];
  if (options?.mode) {
    log.push('-m', options.mode.toString());
  }
  if (options?.recursive) {
    log.push('-p');
  }
  logCommandArgs(...log, ...paths);
  return Promise.all(paths.map((p) => fsNode.mkdir(p, options))).then(() => {});
}

export async function rm(path: string | string[] | Promise<string[]>, options?: { force?: boolean; recursive?: boolean }): Promise<void> {
  const paths = await (typeof path === 'string' ? [path] : path);
  const log: string[] = ['rm'];
  if (options?.recursive || options?.force) {
    let opts = '-';
    if (options.recursive) {
      opts += 'r';
    }
    if (options.force) {
      opts += 'f';
    }
    log.push(opts);
  }
  logCommandArgs(...log, ...paths);
  return Promise.all(paths.map((p) => fsNode.rm(p, options))).then(() => {});
}

export async function rmdir(path: string | string[] | Promise<string[]>): Promise<void> {
  const paths = await (typeof path === 'string' ? [path] : path);
  logCommandArgs('rmdir', ...paths);
  return Promise.all(paths.map((p) => fsNode.rmdir(p))).then(() => {});
}

export async function touch(path: string | string[] | Promise<string[]>, options?: TouchOptions): Promise<void> {
  const paths = await (typeof path === 'string' ? [path] : path);
  const log: string[] = ['touch'];
  if (options) {
    if (options.atime || options.mtime || options.nocreate) {
      let opts = '-';
      if (options.nocreate) {
        opts += 'c';
      }
      if (options.atime) {
        opts += 'a';
      }
      if (options.mtime) {
        opts += 'm';
      }
      log.push(opts);
    }
    if (options.time) {
      log.push('-t', options.time.toString());
    }
    if (options.ref) {
      log.push('-r', options.ref);
    }
  }
  logCommandArgs(...log, ...paths);
  return Promise.all(paths.map((p) => _touch(p, options))).then(() => {});
}

export async function cp(fromPath: string | string[] | Promise<string[]>, toPath: string, options?: CopyOptions): Promise<void> {
  const paths = await (typeof fromPath === 'string' ? [fromPath] : fromPath);
  let opts = '';
  if (options) {
    if (options.dereference) {
      opts += 'd';
    }
    if (options.preserveTimestamps) {
      opts += 'p'; // NOTE: cp -p also preserves mode and ownership
    }
    if (options.recursive) {
      opts += 'R';
    }
    if (opts === 'dpR') {
      opts = 'a';
    }
  }
  if (opts) {
    logCommandArgs('cp', '-' + opts, ...paths, toPath);
  } else {
    logCommandArgs('cp', ...paths, toPath);
  }
  return Promise.all(paths.map((p) => fsNode.cp(p, toPath, { ...options, force: true }))).then(() => {});
}

export async function mv(fromPath: string | string[] | Promise<string[]>, toPath: string): Promise<void> {
  const paths = await (typeof fromPath === 'string' ? [fromPath] : fromPath);
  logCommandArgs('mv', ...paths, toPath);
  return Promise.all(paths.map((p) => _mv(p, toPath))).then(() => {});
}

// NOTE: similar to 'mv', but works only on the same filesystem
export async function rename(fromPath: string | string[] | Promise<string[]>, toPath: string): Promise<void> {
  const paths = await (typeof fromPath === 'string' ? [fromPath] : fromPath);
  logCommandArgs('rename', ...paths, toPath);
  return Promise.all(paths.map((p) => fsNode.rename(p, toPath))).then(() => {});
}
