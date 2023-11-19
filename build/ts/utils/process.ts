import * as child_process from 'node:child_process';
import { error } from 'node:console';
import * as _dbg from 'debug';

const debug = _dbg('build:utils:process');

export function spawn(command: string, ...args: string[]): Promise<string> {
  let stdout: string = '';
  return new Promise((resolve, reject) => {
    const options: child_process.SpawnOptions = {};
    debug(`spawning: `, command, ...args);
    const childProcess = child_process.spawn(command, args, options);
    childProcess.once('exit', (code: number) => {
      const exitCode = code ?? -1;
      if (exitCode) {
        reject(new Error(`exited with ${exitCode}`));
      }
      resolve(stdout);
    });
    childProcess.once('error', (err: Error) => {
      reject(error);
    });
    childProcess.stdout.on('data', (data) => {
      const append = data.toString();
      debug(`output chunk: `, append);
      stdout += data.toString();
    });
  });
}
