import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { Module } from '@nestjs/common';
import { LoggerModuleOptions, LOGGER_MODULE_OPTIONS_TOKEN } from './model';
import { LoggerService } from './logger.service';

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule extends createConfigurableDynamicRootModule<LoggerModule, LoggerModuleOptions>(LOGGER_MODULE_OPTIONS_TOKEN) {
  static readonly CONFIGURED = LoggerModule.externallyConfigured(LoggerModule, 0);

  static createLoggerService(options: LoggerModuleOptions): LoggerService {
    return new LoggerService(options);
  }
}
