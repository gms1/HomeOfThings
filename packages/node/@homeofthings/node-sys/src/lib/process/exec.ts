import { Readable } from 'stream';

import { ExitCodeError } from './error';
import { ExecOptions, IGNORE, INHERIT, IOType, PIPE, SpawnContext, SpawnOptions } from './options';
import { onChildProcessExit, spawnChildProcess } from './spawn';
import { getCommand, logCommand, logWarn } from '../log/index';
import { WritableStrings } from '../util';
import { isIterable } from '../util/types/is';

export class ExecParams {
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

  public async spawn(opts?: { unref: boolean }): Promise<ExecParams> {
    const { options, args } = this;
    delete options.context;

    this.logBackgroundCommand();

    (options as SpawnOptions).detached = true;
    await spawnChildProcess(options, ...args);
    if (opts?.unref) {
      this.unref();
    }
    return this;
  }

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

  public async run(): Promise<SpawnContext> {
    const { options, args } = this;
    delete options.context;

    this.logCommand();
    if (options.shell && args.length > 1) {
      logWarn('`sh -c` should be called with just one argument');
    }
    try {
      await spawnChildProcess(options, ...args);
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

  // set wait for detached process to exit
  public ref(): ExecParams {
    if (this.options.context?.process) {
      this.options.context?.process.ref();
    }
    return this;
  }

  // set do not wait for detached process to exit
  public unref(): ExecParams {
    if (this.options.context?.process) {
      this.options.context?.process.unref();
    }
    return this;
  }

  public setIgnoreExitCode(): ExecParams {
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

  public setQuiet(value?: boolean): typeof this {
    this._options.quiet = value == undefined ? true : value;
    if (this._options.quiet) {
      this._options.noEcho = true;
      this.setStdio(1, IGNORE);
      this.setStdio(2, IGNORE);
    }
    return this;
  }

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

  public getCommand(): string {
    return getCommand(this.options.shell, this.args);
  }

  protected logCommand(): void {
    if (this.options?.noEcho) {
      return;
    }
    logCommand(this.getCommand());
  }

  protected logBackgroundCommand(): void {
    if (this.options?.noEcho) {
      return;
    }
    logCommand(this.getCommand() + ' &');
  }
}

export function exec(...args: string[]): ExecParams {
  return new ExecParams(...args);
}

export function sh(arg: string): ExecParams {
  return new ExecParams(arg).setShell();
}
