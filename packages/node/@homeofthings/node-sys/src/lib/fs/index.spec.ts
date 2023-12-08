import * as nodeConsole from 'node:console';
import { promises as fsNode } from 'node:fs';
import * as path from 'node:path';

import * as fs from './index';

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
    info.mockClear();
  });

  it('`basename` should return the last path part', async () => {
    const givenFileName = 'givenFileName';
    expect(fs.basename(path.resolve(tmpFolder, givenFileName))).toBe(givenFileName);
  });

  it('`dirname` should return all except the last path part', async () => {
    const givenDirName = tmpFolder;
    expect(fs.dirname(path.resolve(givenDirName, 'myFileName'))).toBe(givenDirName);
  });

  it('`cd` should change the directory', async () => {
    const givenFolder = testFolder;
    fs.cd(givenFolder);
    expect(fs.pwd()).toBe(givenFolder);
    fs.cd('-');
    expect(fs.pwd()).toBe(workspace);
  });

  it('`pushd` and `popd` should change the directory and `dirs` should report the directory stack', async () => {
    const givenFolder1 = tmpFolder;
    const givenFolder2 = testFolder;

    const pushdDirs1 = fs.pushd(givenFolder1);

    expect(fs.pwd()).toBe(givenFolder1);
    expect(pushdDirs1[0]).toBe(givenFolder1);
    expect(pushdDirs1[1]).toBe(workspace);
    expect(fs.dirs()).toEqual(pushdDirs1);

    const pushdDirs2 = fs.pushd(givenFolder2);

    expect(fs.pwd()).toBe(givenFolder2);
    expect(pushdDirs2[0]).toBe(givenFolder2);
    expect(pushdDirs2[1]).toBe(givenFolder1);
    expect(pushdDirs2[2]).toBe(workspace);
    expect(fs.dirs()).toEqual(pushdDirs2);

    fs.cd('..');
    expect(fs.dirs()[0]).toBe(fs.pwd());

    const popdDirs2 = fs.popd();

    expect(fs.pwd()).toBe(givenFolder1);
    expect(popdDirs2[0]).toBe(givenFolder1);
    expect(popdDirs2[1]).toBe(workspace);
    expect(fs.dirs()).toEqual(popdDirs2);

    const popdDirs1 = fs.popd();
    expect(fs.pwd()).toBe(workspace);
    expect(popdDirs1[0]).toBe(workspace);
    expect(fs.dirs()).toEqual(popdDirs1);

    // NOTE: dir stack is empty
    const moreDirs = fs.popd();
    expect(fs.pwd()).toBe(workspace);
    expect(moreDirs[0]).toBe(workspace);
    expect(fs.dirs()).toEqual(moreDirs);
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

  it('`mktemp` should create a temporary dir', async () => {
    const tmpdir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });

    const basename = fs.basename(tmpdir);
    expect(basename.length).toBeGreaterThanOrEqual(10);

    const stat = await fs.stat(tmpdir);
    expect(stat.isDirectory()).toBe(true);
  });

  it('`mktemp` should create a temporary file', async () => {
    const tmpfile = await fs.mktemp(path.resolve(testFolder, 'tmp_'));

    const basename = fs.basename(tmpfile);
    expect(basename.length).toBeGreaterThanOrEqual(10);

    const stat = await fs.stat(tmpfile);
    expect(stat.isFile()).toBe(true);
  });

  it('`ln` should create a symlink for a file', async () => {
    const givenFile = await fs.mktemp(path.resolve(testFolder, 'tmp_'));
    const givenLink = path.resolve(testFolder, 'fileLink');

    expect(await fs.exists(givenLink)).toBe(false);

    await fs.ln(givenFile, givenLink);

    expect(await fs.exists(givenLink)).toBe(true);
  });

  it('`ln` should create a symlink for a directory', async () => {
    const givenDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenLink = path.resolve(testFolder, 'dirLink');

    expect(await fs.exists(givenLink)).toBe(false);

    await fs.ln(givenDir, givenLink);

    expect(await fs.exists(givenLink)).toBe(true);
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
      await fs.chmod(givenDir, givenMode);
      expect(chmodSpy).toHaveBeenCalledTimes(1);
      expect(chmodSpy).toHaveBeenCalledWith(givenDir, givenMode);
      chmodSpy.mockReset();
      return;
    }

    expect(await fs.mode(givenDir)).toBe(0o700);

    await fs.chmod(givenDir, givenMode);

    expect(await fs.mode(givenDir)).toBe(givenMode);
  });

  it('`chmod` should change the mode for a directory recursively', async () => {
    const givenDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenFile = await fs.mktemp(path.resolve(givenDir, 'tmp_'));
    const givenMode = 0o764;
    const givenModeString = '-rwxrw-r--';

    if (fs.IS_WIN) {
      const chmodSpy = jest.spyOn(fs, '_chmodR').mockImplementation(() => Promise.resolve());
      await fs.chmod(givenDir, givenMode, { recursive: true });
      expect(chmodSpy).toHaveBeenCalledTimes(1);
      expect(chmodSpy).toHaveBeenCalledWith(givenDir, givenMode);
      chmodSpy.mockReset();
      return;
    }

    expect(await fs.mode(givenFile)).toBe(0o600);

    await fs.chmod(givenDir, givenMode, { recursive: true });

    expect(await fs.mode(givenFile)).toBe(givenMode);
    expect((await fs.statsMmode(givenFile)).toString()).toBe(givenModeString);
  });

  it('`chown` should call node:fs:chown if called non-recursively', async () => {
    const givenFile = await fs.mktemp(path.resolve(testFolder, 'tmp_'));
    const givenOwner = 1000;
    const givenGroup = 1000;

    const chownSpy = jest.spyOn(fsNode, 'chown').mockImplementation(() => Promise.resolve());
    await fs.chown(givenFile, givenOwner, givenGroup);
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

  it('`mkdir` should create a directory non-recursively', async () => {
    const givenRootDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenDir = path.resolve(givenRootDir, 'testdir');

    expect(await fs.exists(givenDir)).toBe(false);
    await fs.mkdir(givenDir);
    expect(await fs.exists(givenDir)).toBe(true);
    expect((await fs.stat(givenDir)).isDirectory()).toBe(true);
  });

  it('`mkdir` should create a directory recursively', async () => {
    const givenRootDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenDir = path.resolve(givenRootDir, 'testparentdir', 'testdir');

    expect(await fs.exists(givenDir)).toBe(false);
    await fs.mkdir(givenDir, { recursive: true });
    expect(await fs.exists(givenDir)).toBe(true);
    expect((await fs.stat(givenDir)).isDirectory()).toBe(true);
  });

  it('`mkdir` should create a directory with mode', async () => {
    const givenRootDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenDir = path.resolve(givenRootDir, 'testdir');
    const givenMode = 0o755;

    expect(await fs.exists(givenDir)).toBe(false);
    await fs.mkdir(givenDir, { mode: givenMode });
    expect(await fs.exists(givenDir)).toBe(true);
    expect((await fs.stat(givenDir)).isDirectory()).toBe(true);

    if (fs.IS_WIN) {
      return;
    }
    expect((await fs.statsMmode(givenDir)).toOctal()).toBe(givenMode.toString(8).padStart(4, '0'));
  });

  it('`realpath` should call node:fs:realpath', async () => {
    const givenPath = 'testpath';
    const realpathSpy = jest.spyOn(fsNode, 'realpath').mockImplementation(() => Promise.resolve(''));

    await fs.realpath(givenPath);
    expect(realpathSpy).toHaveBeenCalledTimes(1);
    expect(realpathSpy).toHaveBeenCalledWith(givenPath);
  });

  it('`rm` should remove a file', async () => {
    const givenDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenFile = await fs.mktemp(path.resolve(givenDir, 'tmp_'));

    expect(await fs.exists(givenFile)).toBe(true);
    await fs.rm(givenFile);
    expect(await fs.exists(givenFile)).toBe(false);
  });

  it('`rm` should fail to remove a non-empty directory non-recursively', async () => {
    const givenDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenFile = await fs.mktemp(path.resolve(givenDir, 'tmp_'));

    expect(await fs.exists(givenFile)).toBe(true);
    expect(await fs.exists(givenDir)).toBe(true);
    try {
      await fs.rm(givenDir);
      fail('should have thrown');
    } catch (e) {
      /*ignore*/
    }
    expect(await fs.exists(givenDir)).toBe(true);
    expect(await fs.exists(givenFile)).toBe(true);
  });

  it('`rm` should remove a directory recursively', async () => {
    const givenDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenFile = await fs.mktemp(path.resolve(givenDir, 'tmp_'));

    expect(await fs.exists(givenFile)).toBe(true);
    expect(await fs.exists(givenDir)).toBe(true);

    await fs.rm(givenDir, { recursive: true });

    expect(await fs.exists(givenFile)).toBe(false);
    expect(await fs.exists(givenDir)).toBe(false);
  });

  it('`rmdir` should remove an empty directory', async () => {
    const givenDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });

    expect(await fs.exists(givenDir)).toBe(true);
    await fs.rmdir(givenDir);
    expect(await fs.exists(givenDir)).toBe(false);
  });

  it('`rmdir` should fail to remove a non-empty directory', async () => {
    const givenDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenFile = await fs.mktemp(path.resolve(givenDir, 'tmp_'));

    expect(await fs.exists(givenDir)).toBe(true);
    try {
      await fs.rmdir(givenDir);
      fail('should have thrown');
    } catch (e) {
      /*ignore*/
    }
    expect(await fs.exists(givenFile)).toBe(true);
    expect(await fs.exists(givenDir)).toBe(true);
  });

  it('`unlink` should remove a file', async () => {
    const givenFile = await fs.mktemp(path.resolve(testFolder, 'tmp_'));

    expect(await fs.exists(givenFile)).toBe(true);
    await fs.unlink(givenFile);
    expect(await fs.exists(givenFile)).toBe(false);
  });

  it('`touch` should touch a file', async () => {
    const givenDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenFile = path.resolve(givenDir, 'testfile');

    expect(await fs.exists(givenFile)).toBe(false);
    await fs.touch(givenFile);
    expect(await fs.exists(givenFile)).toBe(true);
  });

  it('`which` should find a program', async () => {
    const givenProgram = 'node';

    const found = await fs.which(givenProgram);
    expect(found.length).toBe(1);

    const foundDirname = fs.dirname(found[0]);
    const foundBasename = fs.basename(found[0]);

    expect(foundBasename).toBe(givenProgram);
    expect(foundDirname.length).toBeGreaterThan(1);
  });

  it('`which` should find all occurrence of a program', async () => {
    const givenProgram = 'node';

    const found = await fs.which(givenProgram, { all: true });
    expect(found.length).toBeGreaterThanOrEqual(1);

    const foundDirname = fs.dirname(found[0]);
    const foundBasename = fs.basename(found[0]);

    expect(foundBasename).toBe(givenProgram);
    expect(foundDirname.length).toBeGreaterThan(1);
  });

  it('`which` should return empty string array if nothing found', async () => {
    const givenProgram = ':/';

    const found = await fs.which(givenProgram);
    expect(found.length).toBe(0);
  });

  it('`mv` should rename/move a file', async () => {
    const givenDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenSourceFile = await fs.mktemp(path.resolve(givenDir, 'tmp_'));
    const givenTargetFile = path.resolve(givenDir, 'testfile');

    expect(await fs.exists(givenSourceFile)).toBe(true);
    expect(await fs.exists(givenTargetFile)).toBe(false);

    await fs.mv(givenSourceFile, givenTargetFile);

    expect(await fs.exists(givenSourceFile)).toBe(false);
    expect(await fs.exists(givenTargetFile)).toBe(true);
  });

  it('`rename` should rename/move a file', async () => {
    const givenDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenSourceFile = await fs.mktemp(path.resolve(givenDir, 'tmp_'));
    const givenTargetFile = path.resolve(givenDir, 'testfile');

    expect(await fs.exists(givenSourceFile)).toBe(true);
    expect(await fs.exists(givenTargetFile)).toBe(false);

    await fs.rename(givenSourceFile, givenTargetFile);

    expect(await fs.exists(givenSourceFile)).toBe(false);
    expect(await fs.exists(givenTargetFile)).toBe(true);
  });

  it('`copyFile` should copy a file', async () => {
    const givenDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenSourceFile = path.resolve(workspace, 'package.json');
    const givenTargetFile = path.resolve(givenDir, 'package.json');

    expect(await fs.exists(givenSourceFile)).toBe(true);
    expect(await fs.exists(givenTargetFile)).toBe(false);

    await fs.copyFile(givenSourceFile, givenTargetFile);

    expect(await fs.exists(givenTargetFile)).toBe(true);

    const sourceContent = await fsNode.readFile(givenSourceFile);
    const targetContent = await fsNode.readFile(givenTargetFile);
    expect(sourceContent).toEqual(targetContent);
  });

  it('`cp` should copy a file', async () => {
    const givenDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenSourceFile = path.resolve(workspace, 'package.json');
    const givenTargetFile = path.resolve(givenDir, 'package.json');

    expect(await fs.exists(givenSourceFile)).toBe(true);
    expect(await fs.exists(givenTargetFile)).toBe(false);

    await fs.cp(givenSourceFile, givenTargetFile);

    expect(await fs.exists(givenTargetFile)).toBe(true);

    const sourceContent = await fsNode.readFile(givenSourceFile);
    const targetContent = await fsNode.readFile(givenTargetFile);
    expect(sourceContent).toEqual(targetContent);
  });

  it('`cp` should copy a directory recursively', async () => {
    const givenRootDir = await fs.mktemp(path.resolve(testFolder, 'tmp_'), { directory: true });
    const givenSourceDir = await fs.mktemp(path.resolve(givenRootDir, 'tmp_'), { directory: true });
    const givenTargetDir = path.resolve(givenRootDir, 'testdir');
    const givenFilename = 'testfile';
    const givenSourceFile = path.resolve(givenSourceDir, givenFilename);
    const givenTargetFile = path.resolve(givenTargetDir, givenFilename);

    const packageJsonFile = path.resolve(workspace, 'package.json');
    await fs.cp(packageJsonFile, givenSourceFile, { preserveTimestamps: true });

    expect(await fs.exists(givenTargetFile)).toBe(false);

    await fs.cp(givenSourceDir, givenTargetDir, { recursive: true, dereference: true, preserveTimestamps: true });

    expect(await fs.exists(givenTargetFile)).toBe(true);
    const sourceContent = await fsNode.readFile(packageJsonFile);
    const targetContent = await fsNode.readFile(givenTargetFile);
    expect(sourceContent).toEqual(targetContent);

    const sourceTime = (await fs.stat(packageJsonFile)).mtime;
    const targetTime = (await fs.stat(givenTargetFile)).mtime;
    expect(sourceTime).toEqual(targetTime);
  });
});
