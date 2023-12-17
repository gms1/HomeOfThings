import { ProcessError } from './error';
import { getPrompt } from '../log';

describe('ProcessError', () => {
  it('for cause', () => {
    const givenCommand = 'givenCommand';
    const givenCauseError = new Error('caused by given cause');
    const givenProcessError = new ProcessError({ command: givenCommand }, givenCauseError);
    expect(givenProcessError.cause).toBe(givenCauseError);
    expect(givenProcessError.message).toBe(getPrompt() + givenCommand + `: caught exception: ${givenCauseError.message}`);
  });

  it('for exit code', () => {
    const givenCommand = 'givenCommand';
    const givenExitCode = 42;
    const givenProcessError = new ProcessError({ command: givenCommand, exitCode: givenExitCode });
    expect(givenProcessError.message).toBe(getPrompt() + givenCommand + `: exited with ${givenExitCode}`);
  });

  it('for unknown reason', () => {
    const givenCommand = 'givenCommand';
    const givenProcessError = new ProcessError({ command: givenCommand });
    expect(givenProcessError.message).toBe(getPrompt() + givenCommand + `: failed for unknown reason`);
  });
});
