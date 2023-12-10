/* eslint-disable @typescript-eslint/naming-convention */
import * as winston from 'winston';

import { WinstonLogger } from './winston-logger';
import { LogLevel } from '../model';

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

describe('WinstonLogger with file logging and logLevels', () => {
  let winstonLogger: WinstonLogger;
  let spyCreateLogger: jest.SpyInstance<winston.Logger, [options?: winston.LoggerOptions]>;

  beforeAll(() => {
    spyCreateLogger = jest.spyOn(winston, 'createLogger');
    winstonLogger = new WinstonLogger({
      consoleLogLevel: LogLevel.Verbose,
      fileLogFileName: 'winston.logger.spec.log',
      fileLogLevel: LogLevel.Verbose,
    });
    expect(spyCreateLogger).toHaveBeenCalledTimes(1);
  });

  beforeEach(() => {
    spyCreateLogger.mockClear();
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
    const givenLogLevel = LogLevel.Error;
    winstonLogger.setConsoleLogLevel(givenLogLevel);
    const newLogLevel = winstonLogger.setConsoleLogLevel(LogLevel.Warn);
    expect(newLogLevel).toBe(givenLogLevel);
  });

  it('should set file logLevel', () => {
    const givenLogLevel = LogLevel.Error;
    winstonLogger.setFileLogLevel(givenLogLevel);
    const newLogLevel = winstonLogger.setFileLogLevel(LogLevel.Warn);
    expect(newLogLevel).toBe(givenLogLevel);
  });

  it('should set console log silent', () => {
    const givenSilent = true;
    winstonLogger.setConsoleLogSilent(givenSilent);
    const newSilent = winstonLogger.setConsoleLogSilent(!givenSilent);
    expect(newSilent).toBe(givenSilent);
  });

  it('should set file log silent', () => {
    const givenSilent = true;
    winstonLogger.setFileLogSilent(givenSilent);
    const newSilent = winstonLogger.setFileLogSilent(!givenSilent);
    expect(newSilent).toBe(givenSilent);
  });
});

describe('WinstonLogger with file logging and logLevels', () => {
  let winstonLogger: WinstonLogger;
  let spyCreateLogger: jest.SpyInstance<winston.Logger, [options?: winston.LoggerOptions]>;

  beforeAll(() => {
    spyCreateLogger = jest.spyOn(winston, 'createLogger');
    winstonLogger = new WinstonLogger({
      fileLogFileName: 'winston.logger.spec.log',
    });
    expect(spyCreateLogger).toHaveBeenCalledTimes(1);
  });

  beforeEach(() => {
    spyCreateLogger.mockClear();
  });

  it('should log error-message', () => {
    const givenMessage = 'test error message';
    winstonLogger.error(givenMessage);
    expect(winstonLogger.logger.error).toBeCalledWith(givenMessage);
  });
});

describe('WinstonLogger without file logging', () => {
  let winstonLogger: WinstonLogger;
  let spyCreateLogger: jest.SpyInstance<winston.Logger, [options?: winston.LoggerOptions]>;

  beforeAll(() => {
    spyCreateLogger = jest.spyOn(winston, 'createLogger');
    winstonLogger = new WinstonLogger({
      consoleLogLevel: LogLevel.Verbose,
    });
    expect(spyCreateLogger).toHaveBeenCalledTimes(1);
  });

  beforeEach(() => {
    spyCreateLogger.mockClear();
  });

  it('should set file logLevel', () => {
    const givenLogLevel = LogLevel.Error;
    expect(winstonLogger.setFileLogLevel(givenLogLevel)).toBeUndefined();
    expect(winstonLogger.setFileLogLevel(LogLevel.Warn)).toBeUndefined();
  });

  it('should set file log silent', () => {
    const givenSilent = true;
    expect(winstonLogger.setFileLogSilent(givenSilent)).toBeUndefined();
    expect(winstonLogger.setFileLogSilent(!givenSilent)).toBeUndefined();
  });
});
