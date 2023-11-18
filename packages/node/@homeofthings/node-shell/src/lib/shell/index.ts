import * as pathNode from 'node:path';
import * as processNode from 'node:process';
import { Mode, promises as fsNode } from 'node:fs';
import { exec, sh } from '../process/params';
import { logCommandArgs, logCommand } from '../log/index';
import { quoteShellArgs } from '../util/quote';

let OLDPWD: string = _pwd();
const DIRSTACK: string[] = [OLDPWD];

function _cd(directory: string): void {
  if (directory === '-') {
    directory = OLDPWD;
  }
  const oldpwd = _pwd();
  processNode.chdir(directory);
  OLDPWD = oldpwd;
}

function _pwd(): string {
  return processNode.cwd();
}

function _dirs(): string[] {
  return [_pwd(), ...DIRSTACK];
}

export function basename(path: string, suffix?: string): string {
  return pathNode.basename(path, suffix);
}

export function dirname(path: string): string {
  return pathNode.dirname(path);
}

export function cd(directory: string): void {
  logCommandArgs('cd', directory);
  _cd(directory);
}

export function pwd(): string {
  logCommand('pwd');
  return _pwd();
}

export function pushd(directory: string): string[] {
  logCommandArgs('pushd', directory);
  _cd(directory);
  DIRSTACK.unshift(_pwd());
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
  processNode.exit(code);
}

export function ln(target: string, path: string): Promise<void> {
  logCommandArgs('ln', '-s', target, path);
  return fsNode.symlink(target, path);
}

export function chmodPath(path: string, mode: Mode): Promise<void> {
  logCommandArgs('chmod', typeof mode === 'number' ? mode.toString() : mode, path);
  return fsNode.chmod(path, mode);
}

export function chownPath(path: string, uid: number, gid: number) {
  logCommandArgs('chown', `${uid}:${gid}`, path);
  return fsNode.chown(path, uid, gid);
}

// ==========================================================================================
// exec/sh wrappers:
//
// NOTE:
// shell is needed if shell expansion is required (e.g for pathname expansion (globbing) of '*', '?', '[...]' wildcards)
// but in general we should avoid using the shell by making it optional
//
// TODO: mktemp | mktemp -d | mktemp -d -p (NOTE: node has 'mkdtemp' but no 'mktemp')
// TODO: realpath
// TODO: unlink
// TODO: stat
// TODO: mv
// TODO: rmdir

function run(shell: boolean, ...args: string[]): Promise<void> {
  return shell
    ? sh(quoteShellArgs(...args))
        .run()
        .then()
    : exec(...args)
        .run()
        .then();
}

async function runWithStdout(shell: boolean, ...args: string[]): Promise<string[]> {
  const output: string[] = [];
  await (shell ? sh(quoteShellArgs(...args)) : exec(...args)).setStdOut(output).run();
  return output;
}

export function chmod(options: { recursive?: boolean; shell?: boolean } | undefined, mode: Mode, ...path: string[]): Promise<void> {
  const args: string[] = ['chmod'];
  if (options?.recursive) {
    args.push('-R');
  }
  args.push(typeof mode === 'number' ? mode.toString() : mode);
  args.push(...path);

  return run(options?.shell, ...args);
}

export function chown(options: { recursive?: boolean; shell?: boolean } | undefined, uid: number, gid: number, ...path: string[]): Promise<void> {
  const args: string[] = ['chown'];
  if (options?.recursive) {
    args.push('-R');
  }
  args.push(`${uid}:${gid}`);
  args.push(...path);

  return run(options?.shell, ...args);
}

export function mkdir(options: { parents?: boolean } | undefined, ...path: string[]): Promise<void> {
  const args: string[] = ['mkdir'];
  if (options?.parents) {
    args.push('-p');
  }
  args.push(...path);
  return run(false, ...args);
}

export function rm(options: { recursive?: boolean; force?: boolean } | undefined, ...path: string[]): Promise<void> {
  const args: string[] = ['rm'];
  if (options?.recursive) {
    args.push('-r');
  }
  if (options?.force) {
    args.push('-f');
  }
  args.push(...path);
  return run(false, ...args);
}

export function touch(...path: string[]): Promise<void> {
  return run(false, 'touch', ...path);
}

export function which(options: { all?: boolean } | undefined, ...path: string[]): Promise<string[]> {
  const args: string[] = ['which'];
  if (options?.all) {
    args.push('-a');
  }
  args.push(...path);

  return runWithStdout(false, ...args);
}
