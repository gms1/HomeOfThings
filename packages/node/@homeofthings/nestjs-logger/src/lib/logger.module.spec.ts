import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { LoggerModuleOptions, LogLevel } from './model';
import { LoggerModule } from './logger.module';
import { LoggerService } from './logger.service';
import { WinstonLogger } from './winston/winston-logger';

describe('LoggerModule', () => {
  @Module({
    imports: [LoggerModule.forChild()],
  })
  class ChildModule {
    static loggerService: LoggerService;

    constructor(loggerService: LoggerService) {
      ChildModule.loggerService = loggerService;
    }
  }

  const givenOptions: LoggerModuleOptions = {
    consoleLogLevel: LogLevel.Verbose,
  };

  beforeEach(() => {
    ChildModule.loggerService = undefined;
  });
  afterEach(() => {
    LoggerModule.isRegistered = false;
  });

  it('for sync options', async () => {
    const appModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot(LoggerModule, givenOptions), ChildModule],
    }).compile();

    // get appModule provided instance
    const loggerService = appModule.get(LoggerService);
    expect(loggerService).toBeInstanceOf(LoggerService);
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
    const loggerService = appModule.get(LoggerService);
    expect(loggerService).toBeInstanceOf(LoggerService);
    expect(loggerService.logger).toBeInstanceOf(WinstonLogger);

    // ChildModule should have same instance
    expect(ChildModule.loggerService).toBe(loggerService);
  });

  it('create', async () => {
    const createdLoggerService = LoggerModule.createLoggerService(givenOptions);
    expect(createdLoggerService).toBeInstanceOf(LoggerService);

    const appModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot(LoggerModule, {}), ChildModule], // given option are ignored
    }).compile();

    // get appModule provided instance
    const loggerService = appModule.get(LoggerService);
    expect(loggerService).toBeInstanceOf(LoggerService);
    expect(loggerService.logger).toBeInstanceOf(WinstonLogger);

    // ChildModule should have same instance
    expect(ChildModule.loggerService).toBe(loggerService);

    // createdLoggerService should be different instance
    expect(loggerService).not.toBe(createdLoggerService);
    // but WinstonLogger is a singleton and therefore should be the same
    expect(loggerService.logger).toBe(createdLoggerService.logger);
  });
});
