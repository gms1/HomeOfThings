import { LoggerService } from './logger.service';
import { LOGLEVEL } from './model';
import { WinstonLogger } from './winston/winston-logger';

describe('LoggerService', () => {
  let loggerService: LoggerService;

  const givenContext = 'test context';

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
    (LoggerService as any)._instance = logger; // set the singleton

    loggerService = new LoggerService({});
    loggerService.context = givenContext;
  });

  it('should log log-message', () => {
    const givenMessage = 'test log message';
    loggerService.log(givenMessage);
    expect(loggerService.logger.info).toHaveBeenCalledWith(givenMessage, { context: givenContext });
  });

  it('should log error-message without trace', () => {
    const givenMessage = 'test error message';
    loggerService.error(givenMessage);
    expect(loggerService.logger.error).toHaveBeenCalledWith(givenMessage, { context: givenContext });
  });

  it('should log error-message with trace', () => {
    const givenMessage = 'test error message';
    const givenTrace = new Error().stack;
    loggerService.error(givenMessage, givenTrace);
    expect(loggerService.logger.error).toHaveBeenCalledWith(givenMessage, { context: givenContext, stack: givenTrace });
  });

  it('should log warn-message', () => {
    const givenMessage = 'test warn message';
    loggerService.warn(givenMessage);
    expect(loggerService.logger.warn).toHaveBeenCalledWith(givenMessage, { context: givenContext });
  });

  it('should log debug-message', () => {
    const givenMessage = 'test debug message';
    loggerService.debug(givenMessage);
    expect(loggerService.logger.debug).toHaveBeenCalledWith(givenMessage, { context: givenContext });
  });

  it('should log verbose-message', () => {
    const givenMessage = 'test verbose message';
    loggerService.verbose(givenMessage);
    expect(loggerService.logger.verbose).toHaveBeenCalledWith(givenMessage, { context: givenContext });
  });

  it('should log message without context', () => {
    const givenMessage = 'test verbose message';
    loggerService.setContext(undefined);
    loggerService.verbose(givenMessage);
    expect(loggerService.logger.verbose).toHaveBeenCalledWith(givenMessage, { context: undefined });
  });

  it('should set console logLevel', () => {
    const givenLogLevel = LOGLEVEL.error;
    loggerService.setConsoleLogLevel(givenLogLevel);
    expect(loggerService.logger.setConsoleLogLevel).toHaveBeenCalledWith(givenLogLevel);
  });

  it('should set file logLevel', () => {
    const givenLogLevel = LOGLEVEL.error;
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
