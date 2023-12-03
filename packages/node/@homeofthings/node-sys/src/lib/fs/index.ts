import * as nodePath from 'node:path';
import * as nodeProcess from 'node:process';
import { CopyOptions as NodeCopyOptions, Mode, Stats, promises as fsNode } from 'node:fs';
import { promisify } from 'node:util';
import { logCommandArgs, logCommand, logCommandResult } from '../log/index';
import * as externalChmodr from 'chmodr';
import * as externalChownr from 'chownr';
import * as externMkTemp from 'mktemp';
import externalTouch from 'touch';
import externalWhich from 'which';
import externalMv from 'mv';
import { Mode as StatsMode } from 'stat-mode';

// NOTE:
// shell would be needed for getting shell expansion (e.g for pathname expansion (globbing) of '*', '?', '[...]' wildcards)
// but in general we should avoid using the shell, or calling programs which are most likely not installed on all systems

export { StatsMode };
export type TouchOptions = Pick<externalTouch.Options, 'time' | 'atime' | 'mtime' | 'nocreate' | 'ref'>;
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

export function mktemp(prefix: string, options?: { directory: boolean }): Promise<string> {
  let res: Promise<string>;

  if (options?.directory) {
    logCommandArgs('mktemp', '-d', prefix);
    res = fsNode.mkdtemp(prefix);
  } else {
    logCommandArgs('mktemp', prefix);
    res = _mkTemp(prefix + 'XXXXXXX');
  }
  return res.then((output) => logCommandResult(output));
}

export function ln(source: string, destination: string): Promise<void> {
  logCommandArgs('ln', '-s', source, destination);
  return fsNode.symlink(source, destination, 'junction'); // NOTE: 'junction' is only used on windows platform
}

export function chmod(path: string, mode: Mode, options?: { recursive: boolean }): Promise<void> {
  if (options?.recursive) {
    logCommandArgs('chmod', '-r', mode.toString(), path);
    return _chmodR(path, mode);
  } else {
    logCommandArgs('chmod', mode.toString(), path);
    return fsNode.chmod(path, mode);
  }
}

export function chown(path: string, uid: number, gid: number, options?: { recursive: boolean }): Promise<void> {
  if (options?.recursive) {
    logCommandArgs('chown', '-r', `${uid}:${gid}`, path);
    return _chownR(path, uid, gid);
  } else {
    logCommandArgs('chown', `${uid}:${gid}`, path);
    return fsNode.chown(path, uid, gid);
  }
}

export function mkdir(path: string, options?: { mode?: Mode; recursive?: boolean }): Promise<string> {
  const log: string[] = ['mkdir'];
  if (options?.mode) {
    log.push('-m', options.mode.toString());
  }
  if (options?.recursive) {
    log.push('-p');
  }
  logCommandArgs(...log, path);
  return fsNode.mkdir(path, options);
}

export function realpath(path: string): Promise<string> {
  logCommandArgs('realpath', path);
  return fsNode.realpath(path).then((output) => logCommandResult(output));
}

export function rm(path: string, options?: { force?: boolean; recursive?: boolean }): Promise<void> {
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
  logCommandArgs(...log, path);
  return fsNode.rm(path, options);
}

export function rmdir(path: string): Promise<void> {
  logCommandArgs('rmdir', path);
  return fsNode.rmdir(path);
}

export function unlink(path: string): Promise<void> {
  logCommandArgs('unlink', path);
  return fsNode.unlink(path);
}

export function touch(path: string, options?: TouchOptions): Promise<void> {
  // TODO: log options
  logCommandArgs('touch', path);
  return _touch(path, options);
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

export function mv(fromPath: string, toPath: string): Promise<void> {
  logCommandArgs('mv', fromPath, toPath);
  return _mv(fromPath, toPath);
}

// NOTE: similar to 'mv', but works only on the same filesystem
export function rename(fromPath: string, toPath: string): Promise<void> {
  logCommandArgs('rename', fromPath, toPath);
  return fsNode.rename(fromPath, toPath);
}

export function copyFile(fromPath: string, toPath: string): Promise<void> {
  logCommandArgs('cp', fromPath, toPath);
  return fsNode.copyFile(fromPath, toPath);
}

export function cp(fromPath: string, toPath: string, options?: CopyOptions): Promise<void> {
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
    logCommandArgs('cp', '-' + opts, fromPath, toPath);
  } else {
    logCommandArgs('cp', fromPath, toPath);
  }
  return fsNode.cp(fromPath, toPath, { ...options, force: true });
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