import { ECHO_ENABLED, logCommand, logWarn } from '../log/index';
import { CommonOptions, ExecOptions, NohupOptions, PIPE, SpawnContext } from './options';
import { spawnChildProcess, onChildProcessExit, writeInputToChildProcess } from './spawn';
import { CommonParams, ExecParams, NohupParams } from './params';

export abstract class CommonPipe<ParamType extends CommonParams<OptionType>, OptionType extends CommonOptions> {
  protected _items: ParamType[] = [];

  public to(item: ParamType): typeof this {
    return this.add(item);
  }

  public add(item: ParamType): typeof this {
    this._items.push(item);
    return this;
  }

  protected async spawnAllChildProcesses(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastStdout: any = undefined;

    this._items[0]!.setStdio(1, PIPE);

    this.logCommands();

    let warnShellArgs = true;
    for (const idx in this._items) {
      const item = this._items[idx]!;
      if (idx) {
        item.setStdio(0, lastStdout);
      }
      if (warnShellArgs && item.options.shell && item.args.length > 1) {
        logWarn('`sh -c` should be called with just one argument');
        warnShellArgs = false;
      }
      await spawnChildProcess(item.options, ...item.args);
      lastStdout = item.options.context!.process!.stdout;
    }
  }

  public abstract run(): Promise<SpawnContext[]>;

  protected logCommands() {
    if (!ECHO_ENABLED) {
      return;
    }
    const commands: string[] = [];
    for (const execParams of this._items) {
      if (execParams.options?.noEcho) {
        return;
      }
      commands.push(execParams.getCommand());
    }
    logCommand(commands.join(' | '));
  }
}

export class Pipe extends CommonPipe<ExecParams, ExecOptions> {
  public async run(): Promise<SpawnContext[]> {
    if (this._items.length === 0) {
      return [];
    }
    await this.spawnAllChildProcesses();

    const childContexts: Promise<SpawnContext>[] = [];
    for (const item of this._items) {
      childContexts.push(onChildProcessExit(item.options));
    }

    return Promise.all(childContexts);
  }
}

export function pipe(params: ExecParams): Pipe {
  return new Pipe().add(params);
}

export class NohupPipe extends CommonPipe<NohupParams, NohupOptions> {
  public async run(): Promise<SpawnContext[]> {
    if (this._items.length === 0) {
      return [];
    }
    await this.spawnAllChildProcesses();

    const unrefChildProcess = (options: NohupOptions) => {
      return writeInputToChildProcess(options).then((context) => {
        context.process!.unref();
        return context;
      });
    };

    const childContexts: Promise<SpawnContext>[] = [];
    for (const item of this._items) {
      childContexts.push(unrefChildProcess(item.options));
    }

    return Promise.all(childContexts);
  }
}

export function nohupPipe(params: NohupParams): NohupPipe {
  return new NohupPipe().add(params);
}
