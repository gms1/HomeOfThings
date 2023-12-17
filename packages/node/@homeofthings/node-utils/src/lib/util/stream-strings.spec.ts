/* eslint-disable @typescript-eslint/no-explicit-any */
import { WritableStrings } from './stream-strings';

class PromisifiedWritableStrings extends WritableStrings {
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
  it('should write strings into an array', async () => {
    const writableStrings = new PromisifiedWritableStrings();
    await writableStrings.promisifiedWrite('hello\nw');
    await writableStrings.promisifiedWrite('orld');
    await writableStrings.promisifiedEnd();

    expect(writableStrings.data).toEqual(['hello', 'world']);
  });
});
