import * as debugjs from 'debug';
import { PROMPT } from '../log/index';
import { SpawnContext } from './options';

const debug = debugjs.default('shell:process:error');

export class ProcessError extends Error {
  constructor(public context: SpawnContext, cause?: Error) {
    super(
      PROMPT +
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
