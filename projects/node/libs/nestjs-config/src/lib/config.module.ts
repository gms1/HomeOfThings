import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModuleOptions, CONFIG_MODULE_OPTIONS_TOKEN } from './model';
import { ConfigService } from './config.service';

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule extends createConfigurableDynamicRootModule<ConfigModule, ConfigModuleOptions>(CONFIG_MODULE_OPTIONS_TOKEN) {
  static forChild(wait = 0): Promise<DynamicModule> {
    return ConfigModule.externallyConfigured(ConfigModule, wait);
  }

  static createConfigService(options: ConfigModuleOptions): ConfigService {
    return new ConfigService(options);
  }
}
