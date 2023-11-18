import { getCommand, logCommand, logWarn } from '../log/index';
import { isIterable } from '../util/types/is';
import { ExitCodeError } from './error';
import { CommonOptions, ExecOptions, IGNORE, INHERIT, IOType, NohupOptions, PIPE, SpawnContext, SpawnOptions } from './options';
import { runChildProcess, spawnChildProcess, writeInputToChildProcess } from './spawn';

export abstract class CommonParams<OptionType extends CommonOptions> {
  protected _options: OptionType = {} as OptionType;
  protected _args: string[];

  constructor(private defaultOutput: IOType, ...args: string[]) {
    this._args = args;
    this._stdioToArray();
  }

  public get options(): OptionType {
    return this._options;
  }

  public get args(): string[] {
    return this._args;
  }

  protected get _stdio(): IOType[] {
    return this._options.stdio as IOType[];
  }

  public abstract run(): Promise<SpawnContext>;

  public set<K extends keyof OptionType>(key: K, value: OptionType[K]): typeof this {
    switch (key) {
      case 'quiet':
        this.setQuiet(value as boolean | undefined);
        break;
      case 'stdio':
        this._options[key] = value;
        this._stdioToArray();
        if (this._options.quiet) {
          this.setQuiet(true);
        }
        break;
      default:
        this._options[key] = value;
        break;
    }
    return this;
  }

  public setStdio(index: number, io: IOType): typeof this {
    this._stdio[index] = io;
    if (index === 0) {
      delete this._options.input;
    }
    return this;
  }

  public setStdIn(str0: string | Iterable<string>, ...rest: string[]) {
    if (isIterable(str0) && !rest.length) {
      this._options.input = str0;
    } else {
      const args = typeof str0 === 'string' ? [str0] : [...str0];
      args.push(...rest);
      this._options.input = args;
    }
    this._stdio[0] = PIPE;
    return this;
  }

  public setStdOut(out: string[]) {
    this._options.output = out;
    this._options.output.length = 0;
    this._stdio[1] = PIPE;
    return this;
  }

  public setStdErr(out: string[]) {
    this._options.error = out;
    this._options.error.length = 0;
    this._stdio[2] = PIPE;
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

export class ExecParams extends CommonParams<ExecOptions> {
  constructor(...args: string[]) {
    super(INHERIT, ...args);
  }

  public setIgnoreExitCode(): ExecParams {
    this._options.ignoreExitCode = true;
    return this;
  }

  public async run(): Promise<SpawnContext> {
    const { options, args } = this;

    this.logCommand();
    if (options.shell && args.length > 1) {
      logWarn('`sh -c` should be called with just one argument');
    }
    try {
      return await runChildProcess(options, ...args);
    } catch (err) {
      if (options?.ignoreExitCode) {
        if (err instanceof ExitCodeError && typeof options.context?.exitCode === 'number') {
          return options.context!;
        }
      }
      return Promise.reject(err);
    }
  }

  // NOTE: force tsc to consider 'ExecParams' and 'NohupParams' as different
  // without it, tsc didn't detect this as error: `nohupPipe(exec(...))`;
  public get isExecParams(): boolean {
    return true;
  }
}

export function exec(...args: string[]): ExecParams {
  return new ExecParams(...args);
}

export function sh(arg: string): ExecParams {
  return new ExecParams(arg).setShell();
}

export class NohupParams extends CommonParams<NohupOptions> {
  constructor(...args: string[]) {
    super(IGNORE, ...args);
  }

  public async run(): Promise<SpawnContext> {
    const { options, args } = this;

    this.logBackgroundCommand();

    (options as SpawnOptions).detached = true;
    await spawnChildProcess(options, ...args);
    await writeInputToChildProcess(options);
    const childProcess = options.context!.process!;
    childProcess.unref();
    return options.context!;
  }

  // NOTE: force tsc to consider 'NohupParams' and 'ExecParams' as different
  // without it, tsc didn't detect this as error: `nohupPipe(exec(...))`;
  public get isNohupParams(): boolean {
    return true;
  }
}

export function nohupExec(...args: string[]): NohupParams {
  return new NohupParams(...args);
}

export function nohupSh(arg: string): NohupParams {
  return new NohupParams(arg).setShell();
}
