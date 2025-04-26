import { WritableOptions } from 'stream';

import { WritableStrings } from './stream-strings';

class PromisifiedWritableStrings extends WritableStrings {
  constructor(options?: WritableOptions, data?: string[]) {
    super(options, data);
  }

  public promisifiedWrite(chunk: string, encoding: BufferEncoding = 'utf-8'): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.write(chunk, encoding, (error?: Error | null) => {
        if (error) {
          reject(error);
        } else {
          resolve(!this.writableNeedDrain);
        }
      });
    });
  }

  public promisifiedEnd(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.end((error?: Error | null) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}

describe('WritableStrings', () => {
  it('should write strings into an array provided by constructor', async () => {
    const data: string[] = [];

    const writableStrings = new PromisifiedWritableStrings(undefined, data);
    await writableStrings.promisifiedWrite('hello\nw');
    await writableStrings.promisifiedWrite('orld');
    await writableStrings.promisifiedEnd();

    expect(writableStrings.data).toEqual(['hello', 'world']);
    expect(writableStrings.data).toBe(data);
  });

  it('should write strings into an array provided by setter', async () => {
    const data: string[] = [];

    const writableStrings = new PromisifiedWritableStrings();
    writableStrings.data = data;
    await writableStrings.promisifiedWrite('hello\nw');
    await writableStrings.promisifiedWrite('orld');
    await writableStrings.promisifiedEnd();

    expect(writableStrings.data).toEqual(['hello', 'world']);
    expect(writableStrings.data).toBe(data);
  });
});
