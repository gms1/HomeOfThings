import { readTextFilePromised, writeTextFilePromised, renameFilePromised, BOM_CODE } from './fs';

// -----------------------------------------------------------------------------------------
export interface SearchReplace {
  search: string | RegExp;
  replace: string;
}

// -----------------------------------------------------------------------------------------
export function stringSearchAndReplace(input: string, opts: SearchReplace | SearchReplace[]): string {
  if (Array.isArray(opts)) {
    return opts.reduce((prev, opt) => {
      return stringSearchAndReplace(prev, opt);
    }, input);
  } else {
    return input.split(opts.search).join(opts.replace);
  }
}

// -----------------------------------------------------------------------------------------
export async function fileSearchAndReplace(filePath: string, opts: SearchReplace | SearchReplace[]): Promise<boolean> {
  let oldBuffer: string;
  let newBuffer: string;
  oldBuffer = await readTextFilePromised(filePath, { encoding: 'utf8' });
  const hasBom = oldBuffer.charCodeAt(0) === BOM_CODE;
  if (hasBom) {
    oldBuffer = oldBuffer.substr(1);
  }
  newBuffer = stringSearchAndReplace(oldBuffer, opts);
  if (hasBom) {
    newBuffer = String.fromCharCode(BOM_CODE) + newBuffer;
  }
  if (oldBuffer === newBuffer) {
    return false;
  }
  const tmpFilePath = filePath + '.tmp';
  await writeTextFilePromised(tmpFilePath, newBuffer);
  await renameFilePromised(tmpFilePath, filePath);
  return true;
}
