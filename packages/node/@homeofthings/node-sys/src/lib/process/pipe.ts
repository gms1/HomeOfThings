import { Readable } from 'node:stream';

import { Exec } from './exec';
import { PIPE } from './options';
import { getCommand } from './spawn';
import { logCommand } from '../log';

export class Pipe {
  private _items: Exec[] = [];
  private noEcho = false;

  /*
   * to: pipe the output of the previous command into another one
   *     this is a synonym for `add`
   */
  public to(item: Exec): typeof this {
    return this.add(item);
  }

  /*
   * add: add a new command to this pipe
   */
  public add(item: Exec): typeof this {
    this._items.push(item);
    return this;
  }

  /*
   * run: spawn all child processes of this pipe and wait until they have exited
   */
  public async run(): Promise<number> {
    await this.spawn(false);
    return this.wait();
  }

  /*
   * start: start the child processes of this pipe in background (detached)
   */
  public async start(): Promise<Pipe> {
    return this.spawn(true);
  }

  /*
   * wait: wait for all child processes of this pipe to exit
   */
  public async wait(): Promise<number> {
    const childContexts: Promise<number>[] = [];
    for (const item of this._items) {
      childContexts.push(item.wait());
    }

    const exitCodes = await Promise.all(childContexts);
    return exitCodes[exitCodes.length - 1];
  }

  protected async spawn(detached: boolean): Promise<Pipe> {
    this.logCommand(detached);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastStdout: any = undefined;

    if (this._items.length > 1) {
      this._items[0]!.setStdio(1, PIPE);
    }

    const lastIndex = this._items.length - 1;
    for (const [idx, item] of this._items.entries()) {
      if (idx) {
        if (!(lastStdout instanceof Readable)) {
          throw Error(`not a Readable for stdin of item ${idx}`);
        }
        item.setStdio(0, lastStdout);
      }
      if (idx != lastIndex) {
        item.setStdio(1, PIPE);
      }
      item.options.noEcho = true;
      await item.spawn(detached);
      lastStdout = item.options.context!.process!.stdout;
    }

    return this;
  }

  // set wait for detached process to exit
  public ref(): Pipe {
    this.forEach((exec) => exec.options.context!.process!.ref());
    return this;
  }

  // set do not wait for detached process to exit
  public unref(): Pipe {
    this.forEach((exec) => exec.options.context!.process!.unref());
    return this;
  }

  // set echo to on
  public setEcho(): typeof this {
    this.noEcho = false;
    return this;
  }

  // set echo to off
  public setNoEcho(): typeof this {
    this.noEcho = true;
    return this;
  }

  protected logCommand(detached = false) {
    if (this.noEcho) {
      return;
    }
    const commands: string[] = [];
    for (const execParams of this._items) {
      commands.push(getCommand(execParams.options.shell, execParams.args));
    }
    logCommand(commands.join(' | ') + (detached ? ' &' : ''));
  }

  private forEach(callbackfn: (value: Exec, index: number, array: Exec[]) => void): void {
    this._items.filter((exec) => exec.options.context?.process).forEach(callbackfn);
  }
}

export function pipe(params: Exec): Pipe {
  return new Pipe().add(params);
}
