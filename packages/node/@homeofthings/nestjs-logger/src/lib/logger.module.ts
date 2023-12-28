import { createDynamicRootModule } from '@homeofthings/nestjs-utils';
import { Module } from '@nestjs/common';

import { LoggerService } from './logger.service';
import { LOGGER_MODULE_OPTIONS_TOKEN, LoggerModuleOptions } from './model';

@Module({})
export class LoggerModule extends createDynamicRootModule<LoggerModule, LoggerModuleOptions>(LOGGER_MODULE_OPTIONS_TOKEN, {
  global: true,
  providers: [LoggerService],
  exports: [LoggerService],
}) {
  static createLoggerService(options: LoggerModuleOptions): LoggerService {
    return new LoggerService(options);
  }
}
