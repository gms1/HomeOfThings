import { Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigModuleOptions, CONFIG_SERVICE_TOKEN } from './model';
import { ConfigService } from './config.service';
import { ConfigModule } from './config.module';

jest.mock('config', () => ({}));

describe('ConfigModule', function() {
  const givenOptions: ConfigModuleOptions = {};

  it('for sync options', async function() {
    const appModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(givenOptions)],
    }).compile();

    const configService = appModule.get(ConfigService);
    expect(configService).toBeInstanceOf(ConfigService);

    expect(appModule.get(CONFIG_SERVICE_TOKEN)).toBe(configService);
  });

  it('for async options', async function() {
    @Injectable()
    class ConfigModuleOptionsProvider {
      getConfigModuleOptions(): Promise<ConfigModuleOptions> {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, 0, givenOptions);
        });
      }
    }

    @Module({
      providers: [ConfigModuleOptionsProvider],
      exports: [ConfigModuleOptionsProvider],
    })
    class ConfigOptionsModule {}

    const appModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRootAsync({
          imports: [ConfigOptionsModule],
          useFactory: (cfg: ConfigModuleOptionsProvider) => cfg.getConfigModuleOptions(),
          inject: [ConfigModuleOptionsProvider],
        }),
      ],
    }).compile();

    const configService = appModule.get(ConfigService);
    expect(configService).toBeInstanceOf(ConfigService);

    expect(appModule.get(CONFIG_SERVICE_TOKEN)).toBe(configService);
  });

  it('create', async function() {
    const configService = ConfigModule.createConfigService(givenOptions);
    expect(configService).toBeInstanceOf(ConfigService);
  });
});
