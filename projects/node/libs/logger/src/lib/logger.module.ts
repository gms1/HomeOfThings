import { DynamicModule, Global, Module } from '@nestjs/common';
import { LOGGER_SERVICE_TOKEN, LOGGER_MODULE_OPTIONS_TOKEN, LoggerModuleOptionsAsync, LoggerModuleOptions } from './model';

import { LoggerService } from './logger.service';

@Global()
@Module({})
export class LoggerModule {
  public static forRoot(options: LoggerModuleOptions): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LOGGER_MODULE_OPTIONS_TOKEN,
          useValue: options,
        },
        LoggerService,
        {
          provide: LOGGER_SERVICE_TOKEN,
          useFactory: (loggerService: LoggerService): LoggerService => loggerService,
          inject: [LoggerService],
        },
      ],
      exports: [LoggerService],
    };
  }

  public static forRootAsync(optionsAsync: LoggerModuleOptionsAsync): DynamicModule {
    return {
      module: LoggerModule,
      imports: optionsAsync.imports,
      providers: [
        {
          provide: LOGGER_MODULE_OPTIONS_TOKEN,
          useFactory: optionsAsync.useFactory,
          inject: optionsAsync.inject,
        },
        LoggerService,
        {
          provide: LOGGER_SERVICE_TOKEN,
          useFactory: (loggerService: LoggerService): LoggerService => loggerService,
          inject: [LoggerService],
        },
      ],
      exports: [LoggerService],
    };
  }

  public static createLoggerService(options: LoggerModuleOptions): LoggerService {
    return new LoggerService(options);
  }
}
