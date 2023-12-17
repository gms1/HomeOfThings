import { getLogger, logError, logInfo, logVerbose, logWarn, setLogger } from './log';
import { Logger } from './logger';

const defaultLogger = getLogger();

class TextLogger implements Logger {
  args?: unknown[];
  type?: 'verbose' | 'info' | 'warn' | 'error';

  verbose(message: string, ...more: unknown[]): void {
    this.type = 'verbose';
    this.args = [message, ...more];
    defaultLogger.verbose(message, ...more);
  }

  info(message: string, ...more: unknown[]): void {
    this.type = 'info';
    this.args = [message, ...more];
    defaultLogger.info(message, ...more);
  }

  warn(message: string, ...more: unknown[]): void {
    this.type = 'warn';
    this.args = [message, ...more];
    defaultLogger.warn(message, ...more);
  }

  error(message: string, ...more: unknown[]): void {
    this.type = 'error';
    this.args = [message, ...more];
    defaultLogger.error(message, ...more);
  }
}

describe('log', () => {
  let logger: TextLogger;

  beforeEach(() => {
    logger = new TextLogger();
    setLogger(logger);
  });

  it('should log verbose message', () => {
    const givenMessage = 'my verbose message';
    const givenData = [42];
    logVerbose(givenMessage, ...givenData);
    expect(logger.args).toEqual([givenMessage, ...givenData]);
    expect(logger.type).toBe('verbose');
  });

  it('should log info message', () => {
    const givenMessage = 'my info message';
    const givenData = [42];
    logInfo(givenMessage, ...givenData);
    expect(logger.args).toEqual([givenMessage, ...givenData]);
    expect(logger.type).toBe('info');
  });

  it('should log warn message', () => {
    const givenMessage = 'my warn message';
    const givenData = [42];
    logWarn(givenMessage, ...givenData);
    expect(logger.args).toEqual([givenMessage, ...givenData]);
    expect(logger.type).toBe('warn');
  });

  it('should log error message', () => {
    const givenMessage = 'my error message';
    const givenData = [42];
    logError(givenMessage, ...givenData);
    expect(logger.args).toEqual([givenMessage, ...givenData]);
    expect(logger.type).toBe('error');
  });
});
