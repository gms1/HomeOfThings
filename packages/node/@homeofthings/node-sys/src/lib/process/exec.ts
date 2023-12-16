import { Readable } from 'stream';

import { ExitCodeError } from './error';
import { ExecOptions, IGNORE, INHERIT, IOType, PIPE, SpawnContext, SpawnOptions } from './options';
import { getCommand, onChildProcessExit, spawnChildProcess } from './spawn';
import { logCommand, logWarn } from '../log';
import { WritableStrings } from '../util';
import { isIterable } from '../util/types/is';

export class Exec {
  protected _options: ExecOptions = {};
  protected _args: string[];
  private defaultOutput: IOType = INHERIT;

  constructor(...args: string[]) {
    this._args = args;
    this._stdioToArray();
  }

  public get options(): ExecOptions {
    return this._options;
  }

  public get args(): string[] {
    return this._args;
  }

  protected get _stdio(): IOType[] {
    return this._options.stdio as IOType[];
  }

  /*
   * start: start the child process in background (detached)
   */
  public async start(): Promise<Exec> {
    await this.spawn(true);
    return this;
  }

  /*
   * wait: wait for child process to exit
   */
  public async wait(): Promise<SpawnContext> {
    const { options } = this;
    try {
      return await onChildProcessExit(options);
    } catch (err) {
      if (options?.ignoreExitCode) {
        if (err instanceof ExitCodeError && typeof options.context?.exitCode === 'number') {
          return options.context!;
        }
      }
      return Promise.reject(err);
    }
  }

  /*
   * run: spawn a child process and wait until it has exited
   */
  public async run(): Promise<SpawnContext> {
    await this.spawn(false);
    return await this.wait();
  }

  // on end of current process, wait for detached process to exit
  public ref(): Exec {
    if (this.options.context?.process) {
      this.options.context?.process.ref();
    }
    return this;
  }

  // on end of current process, do not wait for detached process to exit
  public unref(): Exec {
    if (this.options.context?.process) {
      this.options.context?.process.unref();
    }
    return this;
  }

  // do not throw if child process exited with non-zero exit code
  public setIgnoreExitCode(): Exec {
    this._options.ignoreExitCode = true;
    return this;
  }

  public setStdIn(input: Iterable<string> | typeof IGNORE | typeof INHERIT) {
    if (isIterable<string>(input)) {
      this._options.input = Readable.from(input);
      this._stdio[0] = PIPE;
      return this;
    }
    return this.setStdio(0, input);
  }

  public setStdOut(out: string[] | typeof IGNORE | typeof INHERIT) {
    if (Array.isArray(out)) {
      this._options.output = new WritableStrings(undefined, out);
      this._stdio[1] = PIPE;
      return this;
    }
    return this.setStdio(1, out);
  }

  public setStdErr(out: string[] | typeof IGNORE | typeof INHERIT) {
    if (Array.isArray(out)) {
      this._options.error = new WritableStrings(undefined, out);
      this._stdio[2] = PIPE;
      return this;
    }
    return this.setStdio(2, out);
  }

  public setStdio(index: number, io: IOType): typeof this {
    this._stdio[index] = io;
    switch (index) {
      case 0:
        delete this.options.input;
        break;
      case 1:
        delete this.options.output;
        break;
      case 2:
        delete this.options.error;
        break;
    }
    return this;
  }

  // do not echo and ignore all output of the child process
  public setQuiet(value?: boolean): typeof this {
    this._options.quiet = value == undefined ? true : value;
    if (this._options.quiet) {
      this._options.noEcho = true;
      this.setStdio(1, IGNORE);
      this.setStdio(2, IGNORE);
    }
    return this;
  }

  // set echo to on
  public setEcho(): typeof this {
    this._options.noEcho = false;
    return this;
  }

  // set echo to off
  public setNoEcho(): typeof this {
    this._options.noEcho = true;
    return this;
  }

  public setShell(shell?: string): typeof this {
    this._options.shell = shell ? shell : true;
    return this;
  }

  protected _stdioToArray(): void {
    if (!Array.isArray(this._options.stdio)) {
      if (typeof this._options.stdio === 'string') {
        this._options.stdio = [this._options.stdio, this._options.stdio, this._options.stdio];
      } else {
        this._options.stdio = [INHERIT, this.defaultOutput, this.defaultOutput];
      }
    }
  }

  public async spawn(detached: boolean, warnShellArgs = true) {
    const { options, args } = this;
    delete options.context;

    (options as SpawnOptions).detached = detached;
    this.logCommand(detached);
    if (warnShellArgs && options.shell && args.length > 1) {
      logWarn('`sh -c` should be called with just one argument');
    }
    await spawnChildProcess(options, ...args);
  }

  protected logCommand(detached: boolean): void {
    if (this.options?.noEcho) {
      return;
    }
    const command = getCommand(this.options.shell, this.args);
    logCommand(detached ? command + ' &' : command);
  }
}

export function exec(...args: string[]): Exec {
  return new Exec(...args);
}

export function sh(arg: string): Exec {
  return new Exec(arg).setShell();
}
