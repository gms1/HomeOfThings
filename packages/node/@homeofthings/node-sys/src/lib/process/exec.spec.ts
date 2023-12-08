import * as nodeConsole from 'node:console';

import { ProcessError } from './error';
import { exec, sh } from './exec';

const warn = nodeConsole.warn;

describe('exec', () => {
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
    info.mockClear();
  });

  describe('exec in forgroud', () => {
    it('should set stdout', async () => {
      const message = 'hello world';

      const out: string[] = [];
      const params = exec('node', '-e', `console.log('${message}')`).setStdOut(out);
      const context = await params.run();
      expect(context.exitCode).toBe(0);
      expect(out.length).toBe(1);
      expect(out[0]).toBe(message);
    });

    it('should set stderr', async () => {
      const message = 'hello world';

      const out: string[] = [];
      const params = exec('node', '-e', `console.error('${message}')`).setStdErr(out);
      const context = await params.run();
      expect(context.exitCode).toBe(0);
      expect(out.length).toBe(1);
      expect(out[0]).toBe(message);
    });

    it('should set stdin', async () => {
      const message = 'hello world';
      const script = [`console.log('${message}')`];

      const out: string[] = [];
      const params = exec('node').setStdIn(script).setStdOut(out);
      const context = await params.run();
      expect(context.exitCode).toBe(0);
      expect(out.length).toBe(1);
      expect(out[0]).toBe(message);
    });

    it('should not throw on non-zero exit code if using `setIgnoreExitCode()', async () => {
      const exitCode = 42;
      const params = exec('node', '-e', `process.exit(${exitCode})`).setIgnoreExitCode();
      const context = await params.run();
      expect(context.exitCode).toBe(exitCode);
    });

    it('should throw on non-zero exit code if not using `setIgnoreExitCode()`', async () => {
      const exitCode = 24;
      try {
        const params = exec('node', '-e', `process.exit(${exitCode})`);
        await params.run();
        fail('should have thrown');
      } catch (e) {
        if (!(e instanceof ProcessError)) {
          fail('should throw with ProcessError');
        }
        expect(e.context.exitCode).toBe(exitCode);
      }
    });
  });

  describe('exec in background', () => {
    it('should set stdout', async () => {
      const message = 'hello world';

      const out: string[] = [];
      const params = exec('node', '-e', `console.log('${message}')`).setStdOut(out);
      const process = await params.spawn();
      process.unref();

      process.ref();
      const context = await process.wait();

      expect(context.exitCode).toBe(0);
      expect(out.length).toBe(1);
      expect(out[0]).toBe(message);
    });

    it('should set stderr', async () => {
      const message = 'hello world';

      const out: string[] = [];
      const params = exec('node', '-e', `console.error('${message}')`).setStdErr(out);
      const process = await params.spawn({ unref: true });

      process.ref();
      const context = await process.wait();

      expect(context.exitCode).toBe(0);
      expect(out.length).toBe(1);
      expect(out[0]).toBe(message);
    });

    it('should set stdin', async () => {
      const message = 'hello world';
      const script = [`console.log('${message}')`];

      const out: string[] = [];
      const params = exec('node').setStdIn(script).setStdOut(out);
      const process = await params.spawn();
      process.unref();

      process.ref();
      const context = await process.wait();

      expect(context.exitCode).toBe(0);
      expect(out.length).toBe(1);
      expect(out[0]).toBe(message);
    });

    it('should not throw on non-zero exit code if using `setIgnoreExitCode()`', async () => {
      const exitCode = 24;
      const params = exec('node', '-e', `process.exit(${exitCode})`).setIgnoreExitCode();
      const process = await params.spawn({ unref: true });

      process.ref();
      const context = await process.wait();
      expect(context.exitCode).toBe(exitCode);
    });

    it('should throw on non-zero exit code if not using `setIgnoreExitCode()`', async () => {
      const exitCode = 24;
      try {
        const params = exec('node', '-e', `process.exit(${exitCode})`);
        await params.spawn();
        const process = await params.spawn();
        process.unref();

        process.ref();
        await process.wait();

        fail('should have thrown');
      } catch (e) {
        if (!(e instanceof ProcessError)) {
          fail('should throw with ProcessError');
        }
        expect(e.context.exitCode).toBe(exitCode);
      }
    });
  });

  describe('sh in foreground', () => {
    it('should set stdout', async () => {
      const message = 'hello world';

      const out: string[] = [];
      const params = sh(`node -e "console.log('${message}')"`).setStdOut(out);
      const context = await params.run();
      expect(context.exitCode).toBe(0);
      expect(out.length).toBe(1);
      expect(out[0]).toBe(message);
    });

    it('should set stderr', async () => {
      const message = 'hello world';

      const out: string[] = [];
      const params = sh(`node -e "console.error('${message}')"`).setStdErr(out);
      const context = await params.run();
      expect(context.exitCode).toBe(0);
      expect(out.length).toBe(1);
      expect(out[0]).toBe(message);
    });

    it('should set stdin', async () => {
      const message = 'hello world';
      const script = [`console.log('${message}')`];

      const out: string[] = [];
      const params = sh('node').setStdIn(script).setStdOut(out);
      const context = await params.run();
      expect(context.exitCode).toBe(0);
      expect(out.length).toBe(1);
      expect(out[0]).toBe(message);
    });

    it('should not throw on non-zero exit code if using `setIgnoreExitCode()', async () => {
      const exitCode = 42;
      const params = sh(`node -e "process.exit(${exitCode})"`).setIgnoreExitCode();
      const context = await params.run();
      expect(context.exitCode).toBe(exitCode);
    });

    it('should throw on non-zero exit code if not using `setIgnoreExitCode()`', async () => {
      const exitCode = 24;
      try {
        const params = sh(`node -e "process.exit(${exitCode})"`);
        await params.run();
        fail('should have thrown');
      } catch (e) {
        if (!(e instanceof ProcessError)) {
          fail('should throw with ProcessError');
        }
        expect(e.context.exitCode).toBe(exitCode);
      }
    });
  });

  describe('sh in background', () => {
    it('should set stdout', async () => {
      const message = 'hello world';

      const out: string[] = [];
      const params = sh(`node -e "console.log('${message}')"`).setStdOut(out);
      const process = await params.spawn();
      process.unref();

      process.ref();
      const context = await process.wait();

      expect(context.exitCode).toBe(0);
      expect(out.length).toBe(1);
      expect(out[0]).toBe(message);
    });

    it('should set stderr', async () => {
      const message = 'hello world';

      const out: string[] = [];
      const params = sh(`node -e "console.error('${message}')"`).setStdErr(out);
      const process = await params.spawn();
      process.unref();

      process.ref();
      const context = await process.wait();

      expect(context.exitCode).toBe(0);
      expect(out.length).toBe(1);
      expect(out[0]).toBe(message);
    });

    it('should set stdin', async () => {
      const message = 'hello world';
      const script = [`console.log('${message}')`];

      const out: string[] = [];
      const params = sh('node').setStdIn(script).setStdOut(out);
      const process = await params.spawn();
      process.unref();

      process.ref();
      const context = await process.wait();

      expect(context.exitCode).toBe(0);
      expect(out.length).toBe(1);
      expect(out[0]).toBe(message);
    });

    it('should not throw on non-zero exit code if using `setIgnoreExitCode()`', async () => {
      const exitCode = 24;
      const params = sh(`node -e "process.exit(${exitCode})"`).setIgnoreExitCode();
      const process = await params.spawn();
      process.unref();

      process.ref();
      const context = await process.wait();

      expect(context.exitCode).toBe(exitCode);
    });

    it('should throw on non-zero exit code if not using `setIgnoreExitCode()`', async () => {
      const exitCode = 24;
      try {
        const params = sh(`node -e "process.exit(${exitCode})"`);
        const process = await params.spawn();
        process.unref();

        process.ref();
        await process.wait();

        fail('should have thrown');
      } catch (e) {
        if (!(e instanceof ProcessError)) {
          fail('should throw with ProcessError');
        }
        expect(e.context.exitCode).toBe(exitCode);
      }
    });
  });
});
