import { createDynamicRootModule } from '@homeofthings/nestjs-utils';
import { Module } from '@nestjs/common';

import { ConfigService } from './config.service';
import { ConfigModuleOptions, CONFIG_MODULE_OPTIONS_TOKEN } from './model';

@Module({})
export class ConfigModule extends createDynamicRootModule<ConfigModule, ConfigModuleOptions>(CONFIG_MODULE_OPTIONS_TOKEN, {
  global: true,
  providers: [ConfigService],
  exports: [ConfigService],
}) {
  static createConfigService(options: ConfigModuleOptions): ConfigService {
    return new ConfigService(options);
  }
}
