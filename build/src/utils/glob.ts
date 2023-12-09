import * as util from 'node:util';

import * as debugjs from 'debug';
import * as _glob from 'glob';

const debug = debugjs.default('build:utils:glob');

const _globPromised = util.promisify(_glob.default);

// -----------------------------------------------------------------------------------------
export function glob(pattern: string, options?: _glob.IOptions): Promise<string[]> {
  return _globPromised(pattern, options).catch((err) => {
    debug(`searching for files using pattern '${pattern}' failed: ${err}`);
    return Promise.reject(err);
  });
}
