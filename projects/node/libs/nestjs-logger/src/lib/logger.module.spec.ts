import { Inject, Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { LoggerModuleOptions, LOGLEVEL } from './model';
import { LoggerModule } from './logger.module';
import { LoggerService } from './logger.service';

describe('LoggerModule', function() {
  @Module({
    imports: [LoggerModule.CONFIGURED],
  })
  class ChildModule {
    static loggerService: LoggerService;

    constructor(loggerService: LoggerService) {
      ChildModule.loggerService = loggerService;
    }
  }

  const givenOptions: LoggerModuleOptions = {
    consoleLogLevel: LOGLEVEL.verbose,
  };

  beforeEach(() => {
    ChildModule.loggerService = undefined;
  });

  it('for sync options', async function() {
    const appModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot(LoggerModule, givenOptions), ChildModule],
    }).compile();

    const loggerService = appModule.get(LoggerService);
    expect(loggerService).toBeInstanceOf(LoggerService);

    expect(ChildModule.loggerService).toBe(loggerService);
  });

  it('for async options', async function() {
    @Injectable()
    class ConfigService {
      getLoggerModuleOptions(): Promise<LoggerModuleOptions> {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, 0, givenOptions);
        });
      }
    }

    @Module({
      providers: [ConfigService],
      exports: [ConfigService],
    })
    class ConfigModule {}

    const appModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRootAsync(LoggerModule, {
          imports: [ConfigModule, ChildModule],
          useFactory: (cfg: ConfigService) => cfg.getLoggerModuleOptions(),
          inject: [ConfigService],
        }),
      ],
    }).compile();

    const loggerService = appModule.get(LoggerService);
    expect(loggerService).toBeInstanceOf(LoggerService);

    expect(ChildModule.loggerService).toBe(loggerService);
  });

  it('create', async function() {
    const loggerService = LoggerModule.createLoggerService(givenOptions);
    expect(loggerService).toBeInstanceOf(LoggerService);

    const appModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot(LoggerModule, {}), ChildModule], // given option are ignored
    }).compile();

    const resolvedLoggerService = appModule.get(LoggerService);
    expect(resolvedLoggerService).not.toBe(loggerService); // even if LoggerService instance is different
    expect(resolvedLoggerService.logger).toBe(loggerService.logger); // WinstonLogger is a singleton and therefore should be the same

    expect(ChildModule.loggerService).toBe(resolvedLoggerService);
  });
});
