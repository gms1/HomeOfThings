import * as child_process from 'node:child_process';
import { Readable, Stream, Writable } from 'node:stream';

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
  input?: Readable; // read from 'input' and write to stdin
  output?: Writable; // read from stdout and write to 'output'
  error?: Writable; // read from stderr and write to 'error'
  context?: SpawnContext;
}

export interface SpawnOptions extends Omit<child_process.SpawnOptions, 'argv0'>, AdditionalSpawnOptions {}

export interface ExecOptions extends Omit<SpawnOptions, 'detached' | 'timeout'> {}
