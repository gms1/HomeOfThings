import * as nodeConsole from 'node:console';
import { promises as fsNode } from 'node:fs';
import * as path from 'node:path';

import * as fs from './index';
import * as logCommand from '../log/command';

// NOTE: most of this tests are integration tests, falling back to unit tests if the functionality cannot reliable be validated

const warn = nodeConsole.warn;

describe('fs', () => {
  let info: jest.SpyInstance<void, [message?: unknown, ...optionalParams: unknown[]], unknown>;
  let workspace: string;
  let tmpFolder: string;
  let testFolder: string;

  beforeAll(async () => {
    info = jest.spyOn(global.console, 'info').mockImplementation(() => {});

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

    info.mockReset();
  });

  beforeEach(() => {
    info.mockImplementation(warn);
    global.console.info('----------------------------------------');
    jest.clearAllMocks();
  });

  it('`exit` should call process.exit', () => {
    const givenExitCode = 42;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exitMock: any = () => {};
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(exitMock);

    fs.exit(givenExitCode);

    expect(exitSpy).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(givenExitCode);
    exitSpy.mockReset();
  });

  it('`realpath` should call node:fs:realpath', async () => {
    const givenPath = 'testpath';
    const realpathSpy = jest.spyOn(fsNode, 'realpath').mockImplementation(() => Promise.resolve(''));

    await fs.realpath(givenPath);
    expect(realpathSpy).toHaveBeenCalledTimes(1);
    expect(realpathSpy).toHaveBeenCalledWith(givenPath);
  });

  it('`chmod` should change the mode for a file', async () => {
    const givenFile = await fs.mktemp(path.resolve(testFolder, 'tmp_'));
    const givenMode = 0o777;

    if (fs.IS_WIN) {
      const chmodSpy = jest.spyOn(fsNode, 'chmod').mockImplementation(() => Promise.resolve());
      await fs.chmod(givenFile, givenMode);
      expect(chmodSpy).toHaveBeenCalledTimes(1);
      expect(chmodSpy).toHaveBeenCalledWith(givenFile, givenMode);
      chmodSpy.mockReset();
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
      const chmodSpy = jest.spyOn(fsNode, 'chmod').mockImplementation(() => Promise.resolve());
      await fs.chmod([givenDir], givenMode);
      expect(chmodSpy).toHaveBeenCalledTimes(1);
      expect(chmodSpy).toHaveBeenCalledWith(givenDir, givenMode);
      chmodSpy.mockReset();
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
      const chmodSpy = jest.spyOn(fs, '_chmodR').mockImplementation(() => Promise.resolve());
      await fs.chmod([givenDir], givenMode, { recursive: true });
      expect(chmodSpy).toHaveBeenCalledTimes(1);
      expect(chmodSpy).toHaveBeenCalledWith(givenDir, givenMode);
      chmodSpy.mockReset();
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

    const chownSpy = jest.spyOn(fsNode, 'chown').mockImplementation(() => Promise.resolve());
    await fs.chown([givenFile], givenOwner, givenGroup);
    expect(chownSpy).toHaveBeenCalledTimes(1);
    expect(chownSpy).toHaveBeenCalledWith(givenFile, givenOwner, givenGroup);
  });

  it('`chown` should call chownr if called recursively', async () => {
    const givenDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenOwner = 1000;
    const givenGroup = 1000;

    const chownSpy = jest.spyOn(fs, '_chownR').mockImplementation(() => Promise.resolve());
    await fs.chown(givenDir, givenOwner, givenGroup, { recursive: true });
    expect(chownSpy).toHaveBeenCalledTimes(1);
    expect(chownSpy).toHaveBeenCalledWith(givenDir, givenOwner, givenGroup);
  });

  it('`touch` should log nocreate option', async () => {
    const givenPath = 'testpath';
    const logCommandArgsSpy = jest.spyOn(logCommand, 'logCommandArgs').mockImplementation(() => {});
    const _touchSpy = jest.spyOn(fs, '_touch').mockImplementation(() => Promise.resolve());

    await fs.touch(givenPath, { nocreate: true });
    expect(_touchSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledWith('touch', '-c', givenPath);
  });

  it('`touch` should log atime option', async () => {
    const givenPath = 'testpath';
    const logCommandArgsSpy = jest.spyOn(logCommand, 'logCommandArgs').mockImplementation(() => {});
    const _touchSpy = jest.spyOn(fs, '_touch').mockImplementation(() => Promise.resolve());

    await fs.touch([givenPath], { atime: true });
    expect(_touchSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledWith('touch', '-a', givenPath);
  });

  it('`touch` should log mtime option', async () => {
    const givenPath = 'testpath';
    const logCommandArgsSpy = jest.spyOn(logCommand, 'logCommandArgs').mockImplementation(() => {});
    const _touchSpy = jest.spyOn(fs, '_touch').mockImplementation(() => Promise.resolve());

    await fs.touch(givenPath, { mtime: true });
    expect(_touchSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledWith('touch', '-m', givenPath);
  });

  it('`touch` should log ref option', async () => {
    const givenPath = 'testpath';
    const givenRef = 'testref';
    const logCommandArgsSpy = jest.spyOn(logCommand, 'logCommandArgs').mockImplementation(() => {});
    const _touchSpy = jest.spyOn(fs, '_touch').mockImplementation(() => Promise.resolve());

    await fs.touch(givenPath, { ref: givenRef });
    expect(_touchSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledWith('touch', '-r', givenRef, givenPath);
  });

  it('`touch` should log time option', async () => {
    const givenPath = 'testpath';
    const givenTime = new Date();
    const logCommandArgsSpy = jest.spyOn(logCommand, 'logCommandArgs').mockImplementation(() => {});
    const _touchSpy = jest.spyOn(fs, '_touch').mockImplementation(() => Promise.resolve());

    await fs.touch(givenPath, { time: givenTime });
    expect(_touchSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledTimes(1);
    expect(logCommandArgsSpy).toHaveBeenCalledWith('touch', '-t', givenTime.toString(), givenPath);
  });
});
