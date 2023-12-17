import * as nodeConsole from 'node:console';

import { exec } from './exec';
import { pipe } from './pipe';

const warn = nodeConsole.warn;

describe('pipe', () => {
  let info: jest.SpyInstance<void, [message?: unknown, ...optionalParams: unknown[]], unknown>;

  beforeAll(async () => {
    info = jest.spyOn(global.console, 'info').mockImplementation(() => {});
  });

  afterAll(async () => {
    info.mockReset();
  });

  beforeEach(() => {
    info.mockImplementation(warn);
    global.console.info('----------------------------------------');
    jest.clearAllMocks();
  });

  describe('in foreground', () => {
    it('should work if setEcho is set', async () => {
      const message = 'hello world';
      const script1 = [`console.log('${message}')`];
      const script2 = `process.stdin.on("data", data => { console.log("[" + data.toString() + "]") })`;

      const out: string[] = [];
      const exitCode = await pipe(exec('node').setStdIn(script1))
        .to(exec('node', '-e', script2).setStdOut(out))
        .setEcho()
        .run();
      expect(exitCode).toBe(0);
      expect(out.join('')).toBe('[' + message + ']');
    });
    it('should work if setNoEcho is set', async () => {
      const message = 'hello world';
      const script1 = [`console.log('${message}')`];
      const script2 = `process.stdin.on("data", data => { console.log("[" + data.toString() + "]") })`;

      const out: string[] = [];
      const exitCode = await pipe(exec('node').setStdIn(script1))
        .to(exec('node', '-e', script2).setStdOut(out))
        .setNoEcho()
        .run();
      expect(exitCode).toBe(0);
      expect(out.join('')).toBe('[' + message + ']');
    });
  });

  describe('in background', () => {
    it('should work', async () => {
      const message = 'hello world';
      const script1 = [`console.log('${message}')`];
      const script2 = `process.stdin.on("data", data => { console.log("[" + data.toString() + "]") })`;

      const out: string[] = [];
      const p = await pipe(exec('node').setStdIn(script1))
        .to(exec('node', '-e', script2).setStdOut(out))
        .setNoEcho()
        .setEcho();
      await p.start();
      p.unref();

      p.ref();
      const exitCode = await p.wait();
      expect(exitCode).toBe(0);
      expect(out.join('')).toBe('[' + message + ']');
    });
  });
});
