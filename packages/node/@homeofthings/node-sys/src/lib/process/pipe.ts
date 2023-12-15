import { ExecParams } from './exec';
import { PIPE, SpawnContext } from './options';
import { spawnChildProcess, onChildProcessExit } from './spawn';
import { ECHO_ENABLED, logCommand, logWarn } from '../log/index';

export class Pipe {
  protected _items: ExecParams[] = [];

  public to(item: ExecParams): typeof this {
    return this.add(item);
  }

  public add(item: ExecParams): typeof this {
    this._items.push(item);
    return this;
  }

  public async run(): Promise<SpawnContext[]> {
    if (this._items.length === 0) {
      return [];
    }
    this.logCommands();
    await this.spawnAllChildProcesses();

    const childContexts: Promise<SpawnContext>[] = [];
    for (const item of this._items) {
      childContexts.push(onChildProcessExit(item.options));
    }

    return Promise.all(childContexts);
  }

  public async spawn(opts?: { unref: boolean }): Promise<Pipe> {
    if (this._items.length === 0) {
      return this;
    }
    this.logCommands(true);
    await this.spawnAllChildProcesses();
    if (opts.unref) {
      for (const item of this._items) {
        item.unref();
      }
    }
    return this;
  }

  public async wait(): Promise<SpawnContext[]> {
    const childContexts: Promise<SpawnContext>[] = [];
    for (const item of this._items) {
      childContexts.push(onChildProcessExit(item.options));
    }

    return Promise.all(childContexts);
  }

  // set wait for detached process to exit
  public ref(): Pipe {
    this.forEach((exec) => exec.options.context.process.ref());
    return this;
  }

  // set do not wait for detached process to exit
  public unref(): Pipe {
    this.forEach((exec) => exec.options.context.process.unref());
    return this;
  }

  protected async spawnAllChildProcesses(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastStdout: any = undefined;

    if (this._items.length > 1) {
      this._items[0]!.setStdio(1, PIPE);
    }

    let warnShellArgs = true;
    for (const idx in this._items) {
      const item = this._items[idx]!;
      if (idx !== '0') {
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

  protected logCommands(background = false) {
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
    logCommand(commands.join(' | ') + (background ? ' &' : ''));
  }

  private forEach(callbackfn: (value: ExecParams, index: number, array: ExecParams[]) => void): void {
    this._items.filter((exec) => exec.options.context?.process).forEach(callbackfn);
  }
}

export function pipe(params: ExecParams): Pipe {
  return new Pipe().add(params);
}
