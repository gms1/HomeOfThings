import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigModuleOptions, ConfigModuleOptionsAsync, CONFIG_MODULE_OPTIONS_TOKEN, CONFIG_SERVICE_TOKEN } from './model';

@Global()
@Module({})
export class ConfigModule {
  public static forRoot(options: ConfigModuleOptions): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: CONFIG_MODULE_OPTIONS_TOKEN,
          useValue: options,
        },
        ConfigService,
        {
          provide: CONFIG_SERVICE_TOKEN,
          useFactory: (configService: ConfigService): ConfigService => configService,
          inject: [ConfigService],
        },
      ],
      exports: [ConfigService],
    };
  }

  public static forRootAsync(optionsAsync: ConfigModuleOptionsAsync): DynamicModule {
    return {
      module: ConfigModule,
      imports: optionsAsync.imports,
      providers: [
        {
          provide: CONFIG_MODULE_OPTIONS_TOKEN,
          useFactory: optionsAsync.useFactory,
          inject: optionsAsync.inject,
        },
        ConfigService,
        {
          provide: CONFIG_SERVICE_TOKEN,
          useFactory: (configService: ConfigService): ConfigService => configService,
          inject: [ConfigService],
        },
      ],
      exports: [ConfigService],
    };
  }

  public static createConfigService(options: ConfigModuleOptions): ConfigService {
    return new ConfigService(options);
  }
}
