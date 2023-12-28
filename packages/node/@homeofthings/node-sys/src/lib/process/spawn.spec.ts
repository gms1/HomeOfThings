import { Readable } from 'node:stream';

import { WritableStrings } from '@homeofthings/node-utils';

import { ProcessError } from './error';
import { INHERIT } from './options';
import { spawnChildProcess } from './spawn';

describe('spawn', () => {
  it('calling `spawnChildProcess` without argument should fail', async () => {
    try {
      await spawnChildProcess({});
    } catch (err) {
      expect(err).toBeInstanceOf(ProcessError);
      return;
    }
    throw new Error('should have thrown');
  });

  it('calling `spawnChildProcess` having options.input, but no stdin pipe', async () => {
    try {
      const givenInput: string[] = ['hello'];
      await spawnChildProcess({ stdio: [INHERIT, INHERIT, INHERIT], input: Readable.from(givenInput) }, 'node', '-e', 'process.exit(42)');
    } catch (err) {
      expect(err).toBeInstanceOf(ProcessError);
      return;
    }
    throw new Error('should have thrown');
  });

  it('calling `spawnChildProcess` having options.output, but no stdout pipe', async () => {
    try {
      const givenOutput: string[] = [];
      const givenWritable = new WritableStrings({}, givenOutput);
      await spawnChildProcess({ stdio: [INHERIT, INHERIT, INHERIT], output: givenWritable }, 'node', '-e', 'process.exit(42)');
    } catch (err) {
      expect(err).toBeInstanceOf(ProcessError);
      return;
    }
    throw new Error('should have thrown');
  });

  it('calling `spawnChildProcess` having options.error, but no stdout pipe', async () => {
    try {
      const givenOutput: string[] = [];
      const givenWritable = new WritableStrings({}, givenOutput);
      await spawnChildProcess({ stdio: [INHERIT, INHERIT, INHERIT], error: givenWritable }, 'node', '-e', 'process.exit(42)');
    } catch (err) {
      expect(err).toBeInstanceOf(ProcessError);
      return;
    }
    throw new Error('should have thrown');
  });
});
