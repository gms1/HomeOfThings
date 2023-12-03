import * as child_process from 'node:child_process';
import * as debugjs from 'debug';
import { ExitCodeError, ProcessError } from './error';
import { SpawnContext, SpawnOptions } from './options';
import { writeToStram } from '../util/stream';
import { getCommand } from '../log/index';
import { WritableStrings } from '../util/stream-strings';

const debug = debugjs.default('shell:process:spawn');
let spawnId = 0;

interface InternalSpawnContext extends SpawnContext {
  input?: Iterable<string> | undefined;
  inputError?: Error;
  inputProcessing?: boolean;
  output?: WritableStrings;
  error?: WritableStrings;
}

// NOTE: see:
//   https://nodejs.org/api/child_process.html#child_processspawncommand-args-options
//   shell:
//      by default no extra shell will be spawned
//      if a shell script is about to be executed, it must have a shebang and must be executable or the options.shell must be specified
//      if options.shell is specified or a shell is specified as argument, do not pass unsanitzed user input

export function spawnChildProcess(options: SpawnOptions, ...args: string[]): Promise<SpawnContext> {
  const id = ++spawnId;
  const context: InternalSpawnContext = (options.context = {
    id,
    command: getCommand(options.shell, args),
    input: options.input,
  });

  if (debug.enabled) {
    debug(`process [${id}]: spawn args: `, args);
    debug(`process [${id}]: spawnoptions: `, options);
  }
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
        options.output.length = 0;
        if (childProcess.stdout) {
          context.output = new WritableStrings();
          context.output.data = options.output;
          childProcess.stdout.on('data', (data) => {
            context.output!.write(data);
          });
        } else {
          reject(new ProcessError(context, new Error(`process spawned, but stdout is not available`)));
          return;
        }
      }
      if (options.error) {
        options.error.length = 0;
        if (childProcess.stderr) {
          context.error = new WritableStrings();
          context.error.data = options.error;
          childProcess.stderr.on('data', (data) => {
            context.error!.write(data);
          });
        } else {
          reject(new ProcessError(context, new Error(`process spawned, but stderr is not available`)));
          return;
        }
      }
      resolve(context);
    };
    childProcess.once('spawn', spawnListener);
    childProcess.once('error', errorListener);
  });
}

export function writeInputToChildProcess(options: SpawnOptions): Promise<SpawnContext> {
  const context = options.context as InternalSpawnContext;
  const id = context.id;
  const childProcess = context.process!;
  if (!context.input) {
    return Promise.resolve(context);
  }

  context.inputProcessing = true;
  debug(`process [${id}]: writing to stdin...`);
  return writeToStram(childProcess.stdin!, context.input)
    .then(() => {
      debug(`process [${id}]: data successfully written to stdin`);
      delete context.input;
      delete context.inputProcessing;
    })
    .catch((err) => {
      debug(`process [${id}]: failed to write to stdin: `, err);
      context.inputError = err;
      delete context.inputProcessing;
      return Promise.reject(err);
    })
    .then(() => context);
}

export function onChildProcessExit(options: SpawnOptions): Promise<SpawnContext> {
  return new Promise((resolve, reject) => {
    const context = options.context as InternalSpawnContext;
    const id = context.id;
    const childProcess = context.process!;
    const errorListener = (err: Error) => {
      reject(new ProcessError(context, err));
    };
    const exitListener = (code: number) => {
      const exitCode = code ?? -1;
      context.exitCode = exitCode;
      debug(`process [${id}]: exited with ${exitCode}`);
      if (context.output) {
        context.output.end();
      }
      if (context.error) {
        context.error.end();
      }
      if (context.inputError) {
        const err = new Error(`process exited with ${exitCode} but writing to stdin failed`);
        err.cause = context.inputError;
        reject(new ProcessError(context, err));
        return;
      }
      if (context.input) {
        if (context.inputProcessing) {
          reject(new ProcessError(context, new Error(`process exited with ${exitCode} without waiting for stdin`)));
        } else {
          reject(new ProcessError(context, new Error(`process exited with ${exitCode} but we havn't yet stated to write to stdin`)));
        }
        return;
      }
      if (exitCode !== 0) {
        reject(new ExitCodeError(context));
        return;
      }
      resolve(context);
    };
    childProcess.once('exit', exitListener);
    childProcess.once('error', errorListener);
    writeInputToChildProcess(options).catch(() => {
      /*ignore*/
    });
  });
}

export async function runChildProcess(options: SpawnOptions, ...args: string[]): Promise<SpawnContext> {
  await spawnChildProcess(options, ...args);
  return await onChildProcessExit(options);
}
