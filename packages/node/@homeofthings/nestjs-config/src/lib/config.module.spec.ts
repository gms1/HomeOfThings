/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { ConfigModule } from './config.module';
import { ConfigService } from './config.service';
import { ConfigModuleOptions } from './model';

jest.mock('config', () => ({}));

describe('ConfigModule', () => {
  @Module({
    imports: [ConfigModule.forChild()],
  })
  class ChildModule {
    static configService: ConfigService;

    constructor(configService: ConfigService) {
      ChildModule.configService = configService;
    }
  }

  const givenOptions: ConfigModuleOptions = {};

  afterEach(() => {
    ConfigModule.isRegistered = false;
    (ConfigService as any)._instance = undefined;
    ChildModule.configService = undefined;
  });

  it('for root sync', async () => {
    const appModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(ConfigModule, givenOptions), ChildModule],
    }).compile();

    // get appModule provided instance
    const configService = appModule.get(ConfigService);
    expect(configService).toBeInstanceOf(ConfigService);

    // ChildModule should have same instance
    expect(ChildModule.configService).toBe(configService);
  });

  it('for root async ', async () => {
    const appModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRootAsync(ConfigModule, {
          useFactory: () =>
            new Promise((resolve) => {
              setTimeout(resolve, 500, givenOptions);
            }),
        }),
        ChildModule,
      ],
    }).compile();

    // get appModule provided instance
    const configService = appModule.get(ConfigService);
    expect(configService).toBeInstanceOf(ConfigService);

    // ChildModule should have same instance
    expect(ChildModule.configService).toBe(configService);
  });

  it('create', async () => {
    const configService = ConfigModule.createConfigService(givenOptions);
    expect(configService).toBeInstanceOf(ConfigService);

    await Test.createTestingModule({
      imports: [ConfigModule.forRoot(ConfigModule, givenOptions), ChildModule],
    }).compile();

    // ChildModule should have same instance
    expect(ChildModule.configService).toBe(configService);
  });
});
