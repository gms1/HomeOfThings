/* eslint-disable @typescript-eslint/no-explicit-any */

const mockReadFileResult: [err: Error | null, data: string] = [null, null];
const mockWriteFileResult: [err: Error | null] = [null];

const mockedReadFile = jest.fn().mockImplementation((path: string, options: any, cb: (err: Error | null, data: string) => void) => cb(...mockReadFileResult));
const mockedWiteFile = jest.fn().mockImplementation((path: string, data: string, options: any, cb: (err: Error | null) => void) => cb(...mockWriteFileResult));
const mockedSync = jest.fn();

jest.mock('fs', () => ({
  readFile: mockedReadFile,
  writeFile: mockedWiteFile,
}));
jest.mock('mkdirp', () => ({
  sync: mockedSync,
}));

import { writeFileIfChanged } from './write-file-if-changed';

describe('writeFileIfChanged', () => {
  beforeEach(() => {
    mockedReadFile.mockClear();
    mockedWiteFile.mockClear();
    mockedSync.mockClear();
    mockReadFileResult[0] = null;
    mockReadFileResult[1] = null;
    mockWriteFileResult[0] = null;
  });

  it('should write content if changed', async () => {
    const givenPath = '/test/file';
    const givenOldContent = 'old content';
    const givenNewContent = 'new content';

    mockReadFileResult[1] = givenOldContent;
    expect(await writeFileIfChanged(givenPath, givenNewContent)).toBe(true);
    expect(mockedReadFile).toHaveBeenCalledTimes(1);
    expect(mockedSync).toHaveBeenCalledTimes(1);
    expect(mockedWiteFile).toHaveBeenCalledTimes(1);
  });

  it('should write content if not exist', async () => {
    const givenPath = '/test/file';
    const givenNewContent = 'new content';

    mockReadFileResult[0] = new Error('file not found');
    expect(await writeFileIfChanged(givenPath, givenNewContent)).toBe(true);
    expect(mockedReadFile).toHaveBeenCalledTimes(1);
    expect(mockedSync).toHaveBeenCalledTimes(1);
    expect(mockedWiteFile).toHaveBeenCalledTimes(1);
  });

  it('should fail if writing file failed', async () => {
    const givenPath = '/test/file';
    const givenOldContent = 'old content';
    const givenNewContent = 'new content';

    mockReadFileResult[1] = givenOldContent;
    mockWriteFileResult[0] = new Error('failed to write');
    try {
      await writeFileIfChanged(givenPath, givenNewContent);
      fail('should have thrown');
    } catch (err) {
      expect(mockedReadFile).toHaveBeenCalledTimes(1);
      expect(mockedSync).toHaveBeenCalledTimes(1);
      expect(mockedWiteFile).toHaveBeenCalledTimes(1);
    }
  });

  it('should not write content if not changed', async () => {
    const givenPath = '/test/file';
    const givenContent = 'same content';

    mockReadFileResult[1] = givenContent;
    expect(await writeFileIfChanged(givenPath, givenContent)).toBe(false);
    expect(mockedReadFile).toHaveBeenCalledTimes(1);
    expect(mockedSync).toHaveBeenCalledTimes(0);
    expect(mockedWiteFile).toHaveBeenCalledTimes(0);
  });
});
