jest.mock('winston', () => ({
  format: {
    printf: jest.fn(),
    padLevels: jest.fn(),
    colorize: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    combine: jest.fn(),
  },

  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    transports: [],
    add: jest.fn(),
  }),

  transports: {
    Console: jest.fn().mockReturnValue({}),
    File: jest.fn().mockReturnValue({}),
  },
}));

import * as winston from 'winston';
import { LOGLEVEL } from '../model';
import { WinstonLogger } from './winston-logger';

describe('WinstonLogger with file logging and logLevels', () => {
  let winstonLogger: WinstonLogger;
  let mockCreateLogger: jest.SpyInstance<winston.Logger, [options?: winston.LoggerOptions]>;

  beforeAll(() => {
    mockCreateLogger = jest.spyOn(winston, 'createLogger');
    winstonLogger = new WinstonLogger({
      consoleLogLevel: LOGLEVEL.verbose,
      fileLogFileName: 'winston.logger.spec.log',
      fileLogLevel: LOGLEVEL.verbose,
    });
    expect(mockCreateLogger).toHaveBeenCalledTimes(1);
  });

  beforeEach(() => {
    mockCreateLogger.mockClear();
  });

  afterAll(() => {
    (WinstonLogger as any)._instance = undefined;
  });

  it('instantiated logger should be same as singleton logger', () => {
    expect(winstonLogger).toBe(WinstonLogger.instance);
  });

  it('should log error-message', () => {
    const givenMessage = 'test error message';
    winstonLogger.error(givenMessage);
    expect(winstonLogger.logger.error).toBeCalledWith(givenMessage);
  });

  it('should log warn-message', () => {
    const givenMessage = 'test warn message';
    winstonLogger.warn(givenMessage);
    expect(winstonLogger.logger.warn).toBeCalledWith(givenMessage);
  });

  it('should log info-message', () => {
    const givenMessage = 'test info message';
    winstonLogger.info(givenMessage);
    expect(winstonLogger.logger.info).toBeCalledWith(givenMessage);
  });

  it('should log debug-message', () => {
    const givenMessage = 'test debug message';
    winstonLogger.debug(givenMessage);
    expect(winstonLogger.logger.debug).toBeCalledWith(givenMessage);
  });

  it('should log verbose-message', () => {
    const givenMessage = 'test verbose message';
    winstonLogger.verbose(givenMessage);
    expect(winstonLogger.logger.verbose).toBeCalledWith(givenMessage);
  });

  it('should set console logLevel', () => {
    const givenLogLevel = LOGLEVEL.error;
    winstonLogger.setConsoleLogLevel(givenLogLevel);
    const newLogLevel = winstonLogger.setConsoleLogLevel(LOGLEVEL.warn);
    expect(newLogLevel).toBe(givenLogLevel);
  });

  it('should set file logLevel', () => {
    const givenLogLevel = LOGLEVEL.error;
    winstonLogger.setFileLogLevel(givenLogLevel);
    const newLogLevel = winstonLogger.setFileLogLevel(LOGLEVEL.warn);
    expect(newLogLevel).toBe(givenLogLevel);
  });

  it('should set console log silent', () => {
    const givenSilent = true;
    winstonLogger.setConsoleLogSilent(givenSilent);
    const newSilent = winstonLogger.setConsoleLogSilent(!givenSilent);
  });

  it('should set file log silent', () => {
    const givenSilent = true;
    winstonLogger.setFileLogSilent(givenSilent);
    const newSilent = winstonLogger.setFileLogSilent(!givenSilent);
  });
});

describe('WinstonLogger with file logging and logLevels', () => {
  let winstonLogger: WinstonLogger;
  let mockCreateLogger: jest.SpyInstance<winston.Logger, [options?: winston.LoggerOptions]>;

  beforeAll(() => {
    mockCreateLogger = jest.spyOn(winston, 'createLogger');
    winstonLogger = new WinstonLogger({
      fileLogFileName: 'winston.logger.spec.log',
    });
    expect(mockCreateLogger).toHaveBeenCalledTimes(1);
  });

  beforeEach(() => {
    mockCreateLogger.mockClear();
  });

  afterAll(() => {
    (WinstonLogger as any)._instance = undefined;
  });

  it('should log error-message', () => {
    const givenMessage = 'test error message';
    winstonLogger.error(givenMessage);
    expect(winstonLogger.logger.error).toBeCalledWith(givenMessage);
  });
});

describe('WinstonLogger without file logging', () => {
  let winstonLogger: WinstonLogger;
  let mockCreateLogger: jest.SpyInstance<winston.Logger, [options?: winston.LoggerOptions]>;

  beforeAll(() => {
    mockCreateLogger = jest.spyOn(winston, 'createLogger');
    winstonLogger = new WinstonLogger({
      consoleLogLevel: LOGLEVEL.verbose,
    });
    expect(mockCreateLogger).toHaveBeenCalledTimes(1);
  });

  beforeEach(() => {
    mockCreateLogger.mockClear();
  });

  afterAll(() => {
    (WinstonLogger as any)._instance = undefined;
  });

  it('should set file logLevel', () => {
    const givenLogLevel = LOGLEVEL.error;
    expect(winstonLogger.setFileLogLevel(givenLogLevel)).toBeUndefined();
    expect(winstonLogger.setFileLogLevel(LOGLEVEL.warn)).toBeUndefined();
  });

  it('should set file log silent', () => {
    const givenSilent = true;
    expect(winstonLogger.setFileLogSilent(givenSilent)).toBeUndefined();
    expect(winstonLogger.setFileLogSilent(!givenSilent)).toBeUndefined();
  });
});
