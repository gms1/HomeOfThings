import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { DynamicModule, Module } from '@nestjs/common';
import { LoggerModuleOptions, LOGGER_MODULE_OPTIONS_TOKEN } from './model';
import { LoggerService } from './logger.service';

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule extends createConfigurableDynamicRootModule<LoggerModule, LoggerModuleOptions>(LOGGER_MODULE_OPTIONS_TOKEN) {
  static forChild(wait = 0): Promise<DynamicModule> {
    return LoggerModule.externallyConfigured(LoggerModule, wait);
  }

  static createLoggerService(options: LoggerModuleOptions): LoggerService {
    return new LoggerService(options);
  }
}
