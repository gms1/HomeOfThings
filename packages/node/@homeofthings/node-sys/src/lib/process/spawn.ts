import * as child_process from 'node:child_process';

import { quoteArgs } from '@homeofthings/node-utils';
import * as debugjs from 'debug';

import { ExitCodeError, ProcessError } from './error';
import { SpawnContext, SpawnOptions } from './options';

const debug = debugjs.default('hot:node-sys:process:spawn');
let spawnId = 0;

// NOTE: see:
//   https://nodejs.org/api/child_process.html#child_processspawncommand-args-options
//   shell:
//      by default no extra shell will be spawned
//      if a shell script is about to be executed, it must have a shebang and must be executable or the options.shell must be specified
//      if options.shell is specified or a shell is specified as argument, do not pass unsanitzed user input

export function spawnChildProcess(options: SpawnOptions, ...args: string[]): Promise<SpawnContext> {
  const id = ++spawnId;
  const context: SpawnContext = (options.context = {
    id,
    command: getCommand(options.shell, args),
  });

  debug(`process [${id}]: spawn args: `, args);
  debug(`process [${id}]: spawnoptions: `, options);
  return new Promise((resolve, reject) => {
    const callArgs = [...args];
    const callProgram = callArgs.shift();
    if (!callProgram) {
      reject(new ProcessError(context, new Error(`spawn requires at least one argument`)));
      return;
    }

    debug(`process [${id}]: calling spawn...`);
    const childProcess = (context.process = child_process.spawn(callProgram, callArgs, options));
    const errorListener = (err: Error) => {
      reject(new ProcessError(context, err));
    };
    const spawnListener = () => {
      debug(`process [${id}]: spawned: pid: ${childProcess.pid}`);
      childProcess.removeListener('error', errorListener);
      if (options.output) {
        if (childProcess.stdout?.pipe) {
          childProcess.stdout.pipe(options.output);
        } else {
          reject(new ProcessError(context, new Error(`process spawned, but stdout is not available`)));
          return;
        }
      }
      if (options.error) {
        if (childProcess.stderr?.pipe) {
          childProcess.stderr.pipe(options.error);
        } else {
          reject(new ProcessError(context, new Error(`process spawned, but stderr is not available`)));
          return;
        }
      }
      if (options.input) {
        if (childProcess.stdin?.pipe) {
          options.input.pipe(childProcess.stdin);
        } else {
          reject(new ProcessError(context, new Error(`process spawned, but stdin is not available`)));
          return;
        }
      }
      resolve(context);
    };
    childProcess.once('spawn', spawnListener);
    childProcess.once('error', errorListener);
  });
}

export function onChildProcessExit(options: SpawnOptions): Promise<SpawnContext> {
  return new Promise((resolve, reject) => {
    const context = options.context as SpawnContext;
    const id = context.id;
    const childProcess = context.process!;
    const errorListener = (err: Error) => {
      reject(new ProcessError(context, err));
    };
    const exitListener = (code: number) => {
      const exitCode = code ?? -1;
      context.exitCode = exitCode;
      debug(`process [${id}]: exited with ${exitCode}`);
      if (exitCode !== 0) {
        reject(new ExitCodeError(context));
        return;
      }
      resolve(context);
    };
    childProcess.once('exit', exitListener);
    childProcess.once('error', errorListener);
  });
}

export function getCommand(shell: string | boolean | undefined, args: string[]): string {
  if (shell) {
    return typeof shell === 'string' ? quoteArgs(shell, '-c', ...args) : quoteArgs('sh', '-c', ...args);
  } else {
    return quoteArgs(...args);
  }
}
