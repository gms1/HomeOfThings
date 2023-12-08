import * as child_process from 'node:child_process';
import { Stream } from 'node:stream';

export const INHERIT = 'inherit';
export const IGNORE = 'ignore';
export const PIPE = 'pipe';
export type IOType = child_process.IOType | 'ipc' | Stream | number | null | undefined;

export interface SpawnContext {
  // following properties will be set from inside `spawnChildProcess`:
  id?: number; // the unique spawn id
  command?: string; // the spawn command
  process?: child_process.ChildProcess; // the child process
  // set after child process exited:
  exitCode?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface AdditionalSpawnOptions {
  noEcho?: boolean; // disable echoing the command to stdout
  quiet?: boolean; // disable stdout and stderr
  ignoreExitCode?: boolean; // resolve with exit code instead of rejecting it
  input?: Iterable<string>; // write those strings to 'stdin' after process has been spawend successfully
  output?: string[];
  error?: string[];
  context?: SpawnContext;
}

export interface SpawnOptions extends Omit<child_process.SpawnOptions, 'argv0'>, AdditionalSpawnOptions {}

export interface ExecOptions extends Omit<SpawnOptions, 'detached' | 'timeout'> {}
