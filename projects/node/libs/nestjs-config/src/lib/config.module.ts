import { Module } from '@nestjs/common';
import { ConfigModuleOptions, CONFIG_MODULE_OPTIONS_TOKEN } from './model';
import { ConfigService } from './config.service';
import { createDynamicRootModule } from '@homeofthings/nestjs-utils';

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule extends createDynamicRootModule<ConfigModule, ConfigModuleOptions>(CONFIG_MODULE_OPTIONS_TOKEN) {
  static createConfigService(options: ConfigModuleOptions): ConfigService {
    return new ConfigService(options);
  }
}
