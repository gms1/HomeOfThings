import { LoggerService } from './logger.service';
import { LogLevel } from './model';
import { WinstonLogger } from './winston/winston-logger';

describe('LoggerService', () => {
  let loggerService: LoggerService;

  const givenServiceContext = 'test service context';

  beforeAll(() => {
    const givenOptions = {};
    const logger = new WinstonLogger(givenOptions); // provide the singleton
    logger.info = jest.fn();
    logger.error = jest.fn();
    logger.warn = jest.fn();
    logger.debug = jest.fn();
    logger.verbose = jest.fn();
    logger.setConsoleLogLevel = jest.fn();
    logger.setFileLogLevel = jest.fn();
    logger.setConsoleLogSilent = jest.fn();
    logger.setFileLogSilent = jest.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (LoggerService as any)._instance = logger; // set the singleton

    loggerService = new LoggerService({});
    loggerService.context = givenServiceContext;
  });

  it('should log log-message without message context', () => {
    const givenMessage = 'test log message';
    loggerService.log(givenMessage);
    expect(loggerService.logger.info).toHaveBeenCalledWith(givenMessage, {
      context: givenServiceContext,
    });
  });

  it('should log log-message with message context', () => {
    const givenMessage = 'test log message';
    const givenMessageContext = 'test message context';
    loggerService.log(givenMessage, givenMessageContext);
    expect(loggerService.logger.info).toHaveBeenCalledWith(givenMessage, {
      context: givenMessageContext,
    });
  });

  it('should log error-message without trace and without message context', () => {
    const givenMessage = 'test error message';
    loggerService.error(givenMessage);
    expect(loggerService.logger.error).toHaveBeenCalledWith(givenMessage, {
      context: givenServiceContext,
    });
  });

  it('should log error-message without trace and with message context', () => {
    const givenMessage = 'test error message';
    const givenMessageContext = 'test message context';
    loggerService.error(givenMessage, undefined, givenMessageContext);
    expect(loggerService.logger.error).toHaveBeenCalledWith(givenMessage, {
      context: givenMessageContext,
    });
  });

  it('should log error-message with trace and without message context', () => {
    const givenMessage = 'test error message';
    const givenTrace = new Error().stack;
    loggerService.error(givenMessage, givenTrace);
    expect(loggerService.logger.error).toHaveBeenCalledWith(givenMessage, {
      context: givenServiceContext,
      stack: givenTrace,
    });
  });

  it('should log error-message with trace and with message context', () => {
    const givenMessage = 'test error message';
    const givenTrace = new Error().stack;
    const givenMessageContext = 'test message context';
    loggerService.error(givenMessage, givenTrace, givenMessageContext);
    expect(loggerService.logger.error).toHaveBeenCalledWith(givenMessage, {
      context: givenMessageContext,
      stack: givenTrace,
    });
  });

  it('should log warn-message without message context', () => {
    const givenMessage = 'test warn message';
    loggerService.warn(givenMessage);
    expect(loggerService.logger.warn).toHaveBeenCalledWith(givenMessage, {
      context: givenServiceContext,
    });
  });

  it('should log warn-message with message context', () => {
    const givenMessage = 'test warn message';
    const givenMessageContext = 'test message context';
    loggerService.warn(givenMessage, givenMessageContext);
    expect(loggerService.logger.warn).toHaveBeenCalledWith(givenMessage, {
      context: givenMessageContext,
    });
  });

  it('should log debug-message without message context', () => {
    const givenMessage = 'test debug message';
    loggerService.debug(givenMessage);
    expect(loggerService.logger.debug).toHaveBeenCalledWith(givenMessage, {
      context: givenServiceContext,
    });
  });

  it('should log debug-message with message context', () => {
    const givenMessage = 'test debug message';
    const givenMessageContext = 'test message context';
    loggerService.debug(givenMessage, givenMessageContext);
    expect(loggerService.logger.debug).toHaveBeenCalledWith(givenMessage, {
      context: givenMessageContext,
    });
  });

  it('should log verbose-message without message context', () => {
    const givenMessage = 'test verbose message';
    loggerService.verbose(givenMessage);
    expect(loggerService.logger.verbose).toHaveBeenCalledWith(givenMessage, {
      context: givenServiceContext,
    });
  });

  it('should log verbose-message with message context', () => {
    const givenMessage = 'test verbose message';
    const givenMessageContext = 'test message context';
    loggerService.verbose(givenMessage, givenMessageContext);
    expect(loggerService.logger.verbose).toHaveBeenCalledWith(givenMessage, {
      context: givenMessageContext,
    });
  });

  it('should log message without service context and without message context', () => {
    const givenMessage = 'test verbose message';
    loggerService.setContext(undefined);
    loggerService.verbose(givenMessage);
    expect(loggerService.logger.verbose).toHaveBeenCalledWith(givenMessage, {
      context: undefined,
    });
  });

  it('should set console logLevel', () => {
    const givenLogLevel = LogLevel.Error;
    loggerService.setConsoleLogLevel(givenLogLevel);
    expect(loggerService.logger.setConsoleLogLevel).toHaveBeenCalledWith(givenLogLevel);
  });

  it('should set file logLevel', () => {
    const givenLogLevel = LogLevel.Error;
    loggerService.setFileLogLevel(givenLogLevel);
    expect(loggerService.logger.setFileLogLevel).toHaveBeenCalledWith(givenLogLevel);
  });

  it('should set console log silent', () => {
    const givenLogSilent = true;
    loggerService.setConsoleLogSilent(givenLogSilent);
    expect(loggerService.logger.setConsoleLogSilent).toHaveBeenCalledWith(givenLogSilent);
  });

  it('should set file log silent', () => {
    const givenLogSilent = true;
    loggerService.setFileLogSilent(givenLogSilent);
    expect(loggerService.logger.setFileLogSilent).toHaveBeenCalledWith(givenLogSilent);
  });

  it('should set context', () => {
    const givenNewContext = 'new context';
    loggerService.setContext(givenNewContext);
    expect(loggerService.context).toBe(givenNewContext);
  });
});
