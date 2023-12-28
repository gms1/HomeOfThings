import * as debugjs from 'debug';
import { glob as _glob, GlobOptionsWithFileTypesFalse } from 'glob';

const debug = debugjs.default('build:utils:glob');

// -----------------------------------------------------------------------------------------
export function glob(pattern: string, options?: GlobOptionsWithFileTypesFalse): Promise<string[]> {
  return _glob(pattern, options ?? {}).catch((err) => {
    debug(`searching for files using pattern '${pattern}' failed: ${err}`);
    return Promise.reject(err);
  });
}
