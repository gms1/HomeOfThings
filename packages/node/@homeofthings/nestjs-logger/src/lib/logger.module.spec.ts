/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';
import { Inject, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';

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

jest.unstable_mockModule('config', () => ({
  default: {
    util: {
      loadFileConfigs: jest.fn().mockReturnValue({}),
    },
  },
}));

const { LoggerModule } = await import('./logger.module');
const { LoggerService: LoggerServiceClass } = await import('./logger.service');
const { WinstonLogger } = await import('./winston/winston-logger');
import type { LoggerModuleOptions } from './model';
const { LogLevel } = await import('./model');

describe('LoggerModule', () => {
  @Module({
    imports: [LoggerModule.forChild()],
  })
  class ChildModule {
    static loggerService: typeof LoggerServiceClass;

    constructor(@Inject(LoggerServiceClass) loggerService: typeof LoggerServiceClass) {
      ChildModule.loggerService = loggerService;
    }
  }

  const givenOptions: LoggerModuleOptions = {
    consoleLogLevel: LogLevel.Verbose,
  };

  beforeEach(() => {
    ChildModule.loggerService = undefined as any;
  });
  afterEach(() => {
    LoggerModule.isRegistered = false;
  });

  it('for sync options', async () => {
    const appModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot(LoggerModule, givenOptions), ChildModule],
    }).compile();

    // get appModule provided instance
    const loggerService = appModule.get(LoggerServiceClass);
    expect(loggerService).toBeInstanceOf(LoggerServiceClass);
    expect(loggerService.logger).toBeInstanceOf(WinstonLogger);

    // ChildModule should have same instance
    expect(ChildModule.loggerService).toBe(loggerService);
  });

  it('for async options', async () => {
    const appModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRootAsync(LoggerModule, {
          useFactory: () =>
            new Promise((resolve) => {
              setTimeout(resolve, 500, givenOptions);
            }),
        }),
        ChildModule,
      ],
    }).compile();

    // get appModule provided instance
    const loggerService = appModule.get(LoggerServiceClass);
    expect(loggerService).toBeInstanceOf(LoggerServiceClass);
    expect(loggerService.logger).toBeInstanceOf(WinstonLogger);

    // ChildModule should have same instance
    expect(ChildModule.loggerService).toBe(loggerService);
  });

  it('create', async () => {
    const createdLoggerService = LoggerModule.createLoggerService(givenOptions);
    expect(createdLoggerService).toBeInstanceOf(LoggerServiceClass);

    const appModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot(LoggerModule, {}), ChildModule], // given option are ignored
    }).compile();

    // get appModule provided instance
    const loggerService = appModule.get(LoggerServiceClass);
    expect(loggerService).toBeInstanceOf(LoggerServiceClass);
    expect(loggerService.logger).toBeInstanceOf(WinstonLogger);

    // ChildModule should have same instance
    expect(ChildModule.loggerService).toBe(loggerService);

    // createdLoggerService should be different instance
    expect(loggerService).not.toBe(createdLoggerService);
    // but WinstonLogger is a singleton and therefore should be the same
    expect(loggerService.logger).toBe(createdLoggerService.logger);
  });
});
