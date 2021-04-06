import { Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { LoggerModuleOptions, LOGGER_SERVICE_TOKEN, LOGLEVEL } from './model';
import { LoggerModule } from './logger.module';
import { LoggerService } from './logger.service';

describe('LoggerModule', function () {
  const givenOptions: LoggerModuleOptions = {
    consoleLogLevel: LOGLEVEL.verbose,
  };

  it('for sync options', async function () {
    const appModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot(givenOptions)],
    }).compile();

    const loggerService = appModule.get(LoggerService);
    expect(loggerService).toBeInstanceOf(LoggerService);

    expect(appModule.get(LOGGER_SERVICE_TOKEN)).toBe(loggerService);
  });

  it('for async options', async function () {
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
        LoggerModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (cfg: ConfigService) => cfg.getLoggerModuleOptions(),
          inject: [ConfigService],
        }),
      ],
    }).compile();

    const loggerService = appModule.get(LoggerService);
    expect(loggerService).toBeInstanceOf(LoggerService);

    expect(appModule.get(LOGGER_SERVICE_TOKEN)).toBe(loggerService);
  });

  it('create', async function () {
    const loggerService = LoggerModule.createLoggerService(givenOptions);
    expect(loggerService).toBeInstanceOf(LoggerService);

    const appModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot({})], // given option should be ignored
    }).compile();

    const resolvedLoggerService = appModule.get(LOGGER_SERVICE_TOKEN);
    expect(resolvedLoggerService).not.toBe(loggerService); // even if LoggerService instance is different
    expect(resolvedLoggerService.logger).toBe(loggerService.logger); // WinstonLogger is a singleton and therefore should be the same
  });
});
