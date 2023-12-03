import { Writable } from 'node:stream';
import { PromiseFactories, sequentialize } from './sequentialize';

export function writeStringToStream(writable: Writable, data: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    writable.write(data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function endStream(writable: Writable): Promise<void> {
  return new Promise<void>((resolve) => {
    writable.end(() => resolve());
  });
}

export function writeToStram(writable: Writable, content: Iterable<string>): Promise<void> {
  if (!(writable instanceof Writable)) {
    return Promise.reject(new Error(`no writable`));
  }

  const promiseFactories: PromiseFactories<void> = [];
  for (const data of content) {
    promiseFactories.push(() => writeStringToStream(writable, data));
  }
  promiseFactories.push(() => endStream(writable));
  return sequentialize(promiseFactories).then();
}
