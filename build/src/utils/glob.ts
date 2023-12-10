import * as debugjs from 'debug';
import { GlobOptionsWithFileTypesFalse, glob as _glob } from 'glob';

const debug = debugjs.default('build:utils:glob');

// -----------------------------------------------------------------------------------------
export function glob(pattern: string, options?: GlobOptionsWithFileTypesFalse): Promise<string[]> {
  return _glob(pattern, options).catch((err) => {
    debug(`searching for files using pattern '${pattern}' failed: ${err}`);
    return Promise.reject(err);
  });
}
