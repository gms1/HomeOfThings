import * as debugjs from 'debug';

import { SpawnContext } from './options';
import { getPrompt } from '../log';

const debug = debugjs.default('sys:process:error');

export class ProcessError extends Error {
  constructor(
    public context: SpawnContext,
    cause?: Error,
  ) {
    super(
      getPrompt() +
        context.command +
        ' : ' +
        (cause ? ` caught exception: ${cause?.message}` : typeof context.exitCode === 'number' ? `exited with ${context.exitCode}` : 'failed for unknown reason'),
    );
    if (cause) {
      this.cause = cause;
      debug(this.message, cause);
    } else {
      debug(this.message);
    }
  }
}

export class ExitCodeError extends ProcessError {
  constructor(context: SpawnContext) {
    super(context);
  }
}
