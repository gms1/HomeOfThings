import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { Module } from '@nestjs/common';
import { ConfigModuleOptions, CONFIG_MODULE_OPTIONS_TOKEN } from './model';
import { ConfigService } from './config.service';

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule extends createConfigurableDynamicRootModule<ConfigModule, ConfigModuleOptions>(CONFIG_MODULE_OPTIONS_TOKEN) {
  static readonly CONFIGURED = ConfigModule.externallyConfigured(ConfigModule, 0);

  static createConfigService(options: ConfigModuleOptions): ConfigService {
    return new ConfigService(options);
  }
}
