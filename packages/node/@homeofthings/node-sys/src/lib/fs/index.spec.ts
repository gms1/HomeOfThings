import * as nodeConsole from 'node:console';
import * as nodeFs from 'node:fs';
import * as path from 'node:path';

import { jest } from '@jest/globals';

// NOTE: most of this tests are integration tests, falling back to unit tests if the functionality cannot reliable be validated

const warn = nodeConsole.warn;

// Mock node:process to prevent process.exit from killing the test runner.
// Source imports `import * as nodeProcess from 'node:process'` and uses
// cwd(), env, exit(), etc. We mock only `exit` and pass through everything else.
jest.unstable_mockModule('node:process', () => {
  const actual = jest.requireActual('node:process') as any;

  const { default: _default, ...rest } = actual;
  return { ...rest, exit: jest.fn() };
});

// Mock chownr — delegate to real by default, override in specific tests
jest.unstable_mockModule('chownr', () => {
  const actual = jest.requireActual('chownr') as any;
  return {
    default: jest.fn((...args: any[]) => actual.default(...args)),
  };
});

// Mock chmodr — delegate to real by default, override in specific tests
jest.unstable_mockModule('chmodr', () => {
  const actual = jest.requireActual('chmodr') as any;
  return {
    chmodr: jest.fn((...args: any[]) => actual.chmodr(...args)),
  };
});

// Mock touch so we can verify touch calls
jest.unstable_mockModule('touch', () => ({
  default: jest.fn((..._args: any[]) => Promise.resolve()),
}));

// Mock ../log/command so we can verify log calls
jest.unstable_mockModule('../log/command', () => ({
  logCommand: jest.fn(),
  logCommandArgs: jest.fn(),
  logCommandResult: jest.fn((...args: any[]) => args[args.length - 1]),
}));

const fs = await import('./index');

describe('fs', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let info: any;
  let workspace: string;
  let tmpFolder: string;
  let testFolder: string;

  // Spies on node:fs.promises methods — using jest.spyOn on the mutable promises
  // object works because the source module's fsNode binding points to the same object.
  let realpathSpy: jest.SpiedFunction<typeof nodeFs.promises.realpath>;
  let chmodSpy: jest.SpiedFunction<typeof nodeFs.promises.chmod>;
  let chownSpy: jest.SpiedFunction<typeof nodeFs.promises.chown>;

  beforeAll(async () => {
    info = jest.spyOn(global.console, 'info').mockImplementation(() => {});

    // Set up spies on fs.promises methods (delegating to real implementation by default)
    realpathSpy = jest.spyOn(nodeFs.promises, 'realpath');
    chmodSpy = jest.spyOn(nodeFs.promises, 'chmod');
    chownSpy = jest.spyOn(nodeFs.promises, 'chown');

    workspace = fs.pwd();
    tmpFolder = path.resolve(workspace, 'tmp');
    await fs.mkdir(tmpFolder, { recursive: true });
    testFolder = await fs.mktemp(path.resolve(tmpFolder, 'node-utils_fs.spec_'), { directory: true });
  });

  afterAll(async () => {
    info.mockImplementation(() => {});

    if (testFolder) {
      await fs.rm(testFolder, { force: true, recursive: true });
    }

    realpathSpy.mockRestore();
    chmodSpy.mockRestore();
    chownSpy.mockRestore();
    info.mockReset();
  });

  beforeEach(() => {
    info.mockImplementation(warn);
    global.console.info('----------------------------------------');
    jest.clearAllMocks();
  });

  it('`exit` should call process.exit', async () => {
    const givenExitCode = 42;
    const nodeProcess = await import('node:process');
    const exitSpy = nodeProcess.exit as any as jest.Mock;

    fs.exit(givenExitCode);

    expect(exitSpy).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(givenExitCode);
  });

  it('`realpath` should call node:fs:realpath', async () => {
    const givenPath = 'testpath';

    // Mock realpath to return a value since 'testpath' doesn't exist
    realpathSpy.mockImplementationOnce((() => Promise.resolve('/resolved/testpath')) as any);

    await fs.realpath(givenPath);
    expect(realpathSpy).toHaveBeenCalledTimes(1);
    expect(realpathSpy).toHaveBeenCalledWith(givenPath);
  });

  it('`chmod` should change the mode for a file', async () => {
    const givenFile = await fs.mktemp(path.resolve(testFolder, 'tmp_'));
    const givenMode = 0o777;

    if (fs.IS_WIN) {
      chmodSpy.mockImplementation(() => Promise.resolve());
      await fs.chmod(givenFile, givenMode);
      expect(chmodSpy).toHaveBeenCalledTimes(1);
      expect(chmodSpy).toHaveBeenCalledWith(givenFile, givenMode);
      chmodSpy.mockRestore();
      return;
    }

    expect(await fs.mode(givenFile)).toBe(0o600);

    await fs.chmod(givenFile, givenMode);

    expect(await fs.mode(givenFile)).toBe(givenMode);
    expect((await fs.statsMmode(givenFile)).toOctal()).toBe(givenMode.toString(8).padStart(4, '0'));
  });

  it('`chmod` should change the mode for a directory', async () => {
    const givenDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenMode = 0o777;

    if (fs.IS_WIN) {
      chmodSpy.mockImplementation(() => Promise.resolve());
      await fs.chmod([givenDir], givenMode);
      expect(chmodSpy).toHaveBeenCalledTimes(1);
      expect(chmodSpy).toHaveBeenCalledWith(givenDir, givenMode);
      chmodSpy.mockRestore();
      return;
    }

    expect(await fs.mode(givenDir)).toBe(0o700);

    await fs.chmod([givenDir], givenMode);

    expect(await fs.mode(givenDir)).toBe(givenMode);
  });

  it('`chmod` should change the mode for a directory recursively', async () => {
    const givenDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenFile = await fs.mktemp(path.resolve(givenDir, 'tmp_'));
    const givenMode = 0o764;
    const givenModeString = '-rwxrw-r--';

    if (fs.IS_WIN) {
      const chmodrModule = await import('chmodr');
      const chmodrSpy = chmodrModule.chmodr as any as jest.Mock;
      chmodrSpy.mockImplementation((_path: any, _mode: any, callback: any) => callback(null));
      await fs.chmod([givenDir], givenMode, { recursive: true });
      expect(chmodrSpy).toHaveBeenCalledTimes(1);
      expect(chmodrSpy).toHaveBeenCalledWith(givenDir, givenMode, expect.any(Function));
      chmodrSpy.mockRestore();
      return;
    }

    expect(await fs.mode(givenFile)).toBe(0o600);

    await fs.chmod([givenDir], givenMode, { recursive: true });

    expect(await fs.mode(givenFile)).toBe(givenMode);
    expect((await fs.statsMmode(givenFile)).toString()).toBe(givenModeString);
  });

  it('`chown` should call node:fs:chown if called non-recursively', async () => {
    const givenFile = await fs.mktemp(path.resolve(testFolder, 'tmp_'));
    const givenOwner = 1000;
    const givenGroup = 1000;

    chownSpy.mockImplementation(() => Promise.resolve());
    await fs.chown([givenFile], givenOwner, givenGroup);
    expect(chownSpy).toHaveBeenCalledTimes(1);
    expect(chownSpy).toHaveBeenCalledWith(givenFile, givenOwner, givenGroup);
    chownSpy.mockRestore();
  });

  it('`chown` should call chownr if called recursively', async () => {
    const givenDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenOwner = 1000;
    const givenGroup = 1000;

    const chownrModule = await import('chownr');
    const chownrSpy = chownrModule.default as any as jest.Mock;
    // chownr uses callback-style: chownr(path, uid, gid, callback)
    // our _chownR = promisify(chownr), so it calls chownr.default with (path, uid, gid, callback)
    // we need the mock to call the callback to resolve the promise
    chownrSpy.mockImplementation((...args: any[]) => {
      const callback = args[args.length - 1];
      callback(null);
    });
    await fs.chown(givenDir, givenOwner, givenGroup, { recursive: true });
    expect(chownrSpy).toHaveBeenCalledTimes(1);
    // _chownR = promisify(chownr) passes (path, uid, gid) as positional args
    expect(chownrSpy).toHaveBeenCalledWith(givenDir, givenOwner, givenGroup, expect.any(Function));
    chownrSpy.mockRestore();
  });

  it('`touch` should log nocreate option', async () => {
    const givenPath = 'testpath';
    const logCommandModule = await import('../log/command');
    const logCommandArgsSpy = logCommandModule.logCommandArgs as any as jest.Mock;
    const touchModule = await import('touch');
    const touchSpy = touchModule.default as any as jest.Mock;

    await fs.touch(givenPath, { nocreate: true });
    expect(touchSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledWith('touch', '-c', givenPath);
  });

  it('`touch` should log atime option', async () => {
    const givenPath = 'testpath';
    const logCommandModule = await import('../log/command');
    const logCommandArgsSpy = logCommandModule.logCommandArgs as any as jest.Mock;
    const touchModule = await import('touch');
    const touchSpy = touchModule.default as any as jest.Mock;

    await fs.touch([givenPath], { atime: true });
    expect(touchSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledWith('touch', '-a', givenPath);
  });

  it('`touch` should log mtime option', async () => {
    const givenPath = 'testpath';
    const logCommandModule = await import('../log/command');
    const logCommandArgsSpy = logCommandModule.logCommandArgs as any as jest.Mock;
    const touchModule = await import('touch');
    const touchSpy = touchModule.default as any as jest.Mock;

    await fs.touch(givenPath, { mtime: true });
    expect(touchSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledWith('touch', '-m', givenPath);
  });

  it('`touch` should log ref option', async () => {
    const givenPath = 'testpath';
    const givenRef = 'testref';
    const logCommandModule = await import('../log/command');
    const logCommandArgsSpy = logCommandModule.logCommandArgs as any as jest.Mock;
    const touchModule = await import('touch');
    const touchSpy = touchModule.default as any as jest.Mock;

    await fs.touch(givenPath, { ref: givenRef });
    expect(touchSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledWith('touch', '-r', givenRef, givenPath);
  });

  it('`touch` should log time option', async () => {
    const givenPath = 'testpath';
    const givenTime = new Date();
    const logCommandModule = await import('../log/command');
    const logCommandArgsSpy = logCommandModule.logCommandArgs as any as jest.Mock;
    const touchModule = await import('touch');
    const touchSpy = touchModule.default as any as jest.Mock;

    await fs.touch(givenPath, { time: givenTime });
    expect(touchSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledWith('touch', '-t', givenTime.toString(), givenPath);
  });
});
