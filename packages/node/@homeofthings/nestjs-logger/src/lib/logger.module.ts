import { Module } from '@nestjs/common';
import { LoggerModuleOptions, LOGGER_MODULE_OPTIONS_TOKEN } from './model';
import { LoggerService } from './logger.service';
import { createDynamicRootModule } from '@homeofthings/nestjs-utils';

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
