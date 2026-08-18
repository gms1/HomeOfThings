/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';

jest.unstable_mockModule('winston', () => ({
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

jest.unstable_mockModule('config/lib/util.js', () => ({
  Util: { getPath: jest.fn(), toObject: jest.fn() },
  Load: { fromEnvironment: jest.fn() },
}));

const winston = (await import('winston')) as any;
const { WinstonLogger } = await import('./winston-logger');
const { LogLevel } = await import('../model');

describe('WinstonLogger with file logging and logLevels', () => {
  let winstonLogger: InstanceType<typeof WinstonLogger>;

  beforeAll(() => {
    winstonLogger = new WinstonLogger({
      consoleLogLevel: LogLevel.Verbose,
      fileLogFileName: 'winston.logger.spec.log',
      fileLogLevel: LogLevel.Verbose,
    });
    expect(winston.createLogger).toHaveBeenCalledTimes(1);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log error-message', () => {
    const givenMessage = 'test error message';
    winstonLogger.error(givenMessage);
    expect(winstonLogger.logger.error).toHaveBeenCalledWith(givenMessage);
  });

  it('should log warn-message', () => {
    const givenMessage = 'test warn message';
    winstonLogger.warn(givenMessage);
    expect(winstonLogger.logger.warn).toHaveBeenCalledWith(givenMessage);
  });

  it('should log info-message', () => {
    const givenMessage = 'test info message';
    winstonLogger.info(givenMessage);
    expect(winstonLogger.logger.info).toHaveBeenCalledWith(givenMessage);
  });

  it('should log debug-message', () => {
    const givenMessage = 'test debug message';
    winstonLogger.debug(givenMessage);
    expect(winstonLogger.logger.debug).toHaveBeenCalledWith(givenMessage);
  });

  it('should log verbose-message', () => {
    const givenMessage = 'test verbose message';
    winstonLogger.verbose(givenMessage);
    expect(winstonLogger.logger.verbose).toHaveBeenCalledWith(givenMessage);
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
  let winstonLogger: InstanceType<typeof WinstonLogger>;

  beforeAll(() => {
    winstonLogger = new WinstonLogger({
      fileLogFileName: 'winston.logger.spec.log',
    });
    expect(winston.createLogger).toHaveBeenCalledTimes(1);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log error-message', () => {
    const givenMessage = 'test error message';
    winstonLogger.error(givenMessage);
    expect(winstonLogger.logger.error).toHaveBeenCalledWith(givenMessage);
  });
});

describe('WinstonLogger without file logging', () => {
  let winstonLogger: InstanceType<typeof WinstonLogger>;

  beforeAll(() => {
    winstonLogger = new WinstonLogger({
      consoleLogLevel: LogLevel.Verbose,
    });
    expect(winston.createLogger).toHaveBeenCalledTimes(1);
  });

  beforeEach(() => {
    jest.clearAllMocks();
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
