let mockReadFileResult: string | undefined | Error;
let mockWriteFileResult: undefined | Error;

const mockedReadFile = jest.fn().mockImplementation(() => (mockReadFileResult instanceof Error ? Promise.reject(mockReadFileResult) : Promise.resolve(mockReadFileResult)));
const mockedWiteFile = jest.fn().mockImplementation(() => (mockWriteFileResult instanceof Error ? Promise.reject(mockWriteFileResult) : Promise.resolve()));
const mockedMkdir = jest.fn().mockImplementation(() => Promise.resolve());

jest.mock('node:fs', () => ({
  promises: {
    readFile: mockedReadFile,
    writeFile: mockedWiteFile,
    mkdir: mockedMkdir,
  },
}));

import { writeFileIfChanged } from './write-file-if-changed';

describe('writeFileIfChanged', () => {
  beforeEach(() => {
    mockReadFileResult = undefined;
    mockWriteFileResult = undefined;
    jest.clearAllMocks();
  });

  it('should write content if changed', async () => {
    const givenPath = '/test/file';
    const givenOldContent = 'old content';
    const givenNewContent = 'new content';

    mockReadFileResult = givenOldContent;
    expect(await writeFileIfChanged(givenPath, givenNewContent)).toBe(true);
    expect(mockedReadFile).toHaveBeenCalledTimes(1);
    expect(mockedMkdir).toHaveBeenCalledTimes(0); // file already exist
    expect(mockedWiteFile).toHaveBeenCalledTimes(1);
  });

  it('should write content if not exist', async () => {
    const givenPath = '/test/file';
    const givenNewContent = 'new content';

    mockReadFileResult = new Error('file not found');
    expect(await writeFileIfChanged(givenPath, givenNewContent)).toBe(true);
    expect(mockedReadFile).toHaveBeenCalledTimes(1);
    expect(mockedMkdir).toHaveBeenCalledTimes(1);
    expect(mockedWiteFile).toHaveBeenCalledTimes(1);
  });

  it('should fail if writing file failed', async () => {
    const givenPath = '/test/file';
    const givenOldContent = 'old content';
    const givenNewContent = 'new content';

    mockReadFileResult = givenOldContent;
    mockWriteFileResult = new Error('failed to write');
    try {
      await writeFileIfChanged(givenPath, givenNewContent);
      fail('should have thrown');
    } catch (err) {
      expect(mockedReadFile).toHaveBeenCalledTimes(1);
      expect(mockedMkdir).toHaveBeenCalledTimes(0); // file already exist
      expect(mockedWiteFile).toHaveBeenCalledTimes(1);
    }
  });

  it('should not write content if not changed', async () => {
    const givenPath = '/test/file';
    const givenContent = 'same content';

    mockReadFileResult = givenContent;
    expect(await writeFileIfChanged(givenPath, givenContent)).toBe(false);
    expect(mockedReadFile).toHaveBeenCalledTimes(1);
    expect(mockedMkdir).toHaveBeenCalledTimes(0);
    expect(mockedWiteFile).toHaveBeenCalledTimes(0);
  });
});
