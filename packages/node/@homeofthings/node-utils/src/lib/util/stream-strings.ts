/* eslint-disable @typescript-eslint/no-explicit-any */
import { WritableOptions } from 'node:stream';
import { Writable } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';

export class WritableStrings extends Writable {
  _decoder?: StringDecoder;
  _buffer = '';
  _data: string[];

  constructor(options?: WritableOptions, data?: string[]) {
    super(options);
    this._data = data ? data : [];
    this._data.length = 0;
  }

  get data(): string[] {
    return this._data;
  }

  set data(data: string[]) {
    this._data = data;
  }

  override _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    if (!this._decoder) {
      // NOTE: got a 'buffer' encoding from spawned process stdout, although this is not a valid 'BufferEncoding' and is not supported by 'StringDecoder'
      this._decoder = new StringDecoder((encoding as any) === 'buffer' ? undefined : encoding);
    }
    this.append(this._decoder.write(chunk));
    callback();
  }

  override _final(callback: (error?: Error | null) => void): void {
    if (this._decoder) {
      this.append(this._decoder.end(), true);
    }
    callback();
  }

  private append(chunk: string, flush = false): void {
    this._buffer += chunk;
    if (this._buffer.length) {
      const lines = this._buffer.split(/\r?\n\r?/);
      if (flush) {
        this._buffer = '';
        this._data.push(...lines);
      } else if (lines.length > 1) {
        this._buffer = lines.pop() as string;
        this._data.push(...lines);
      }
    }
  }
}
