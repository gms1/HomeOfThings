import * as glob from 'glob';
import * as util from 'util';
import * as _dbg from 'debug';

const debug = _dbg('build:utils:glob');

const _globPromised = util.promisify(glob);

// -----------------------------------------------------------------------------------------
export function globPromised(pattern: string, options?: glob.IOptions): Promise<string[]> {
  return _globPromised(pattern, options).catch((err) => {
    debug(`searching for files using pattern '${pattern}' failed: ${err}`);
    return Promise.reject(err);
  });
}
