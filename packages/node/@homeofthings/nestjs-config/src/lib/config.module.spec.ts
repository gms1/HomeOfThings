/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';
import { Inject, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import type { ConfigModuleOptions } from './model';

const mockLoadFileConfigs = jest.fn();

jest.unstable_mockModule('config', () => ({
  default: {
    util: {
      loadFileConfigs: mockLoadFileConfigs,
    },
  },
}));

const { ConfigModule } = await import('./config.module');
const { ConfigService: ConfigServiceClass } = await import('./config.service');

describe('ConfigModule', () => {
  @Module({
    imports: [ConfigModule.forChild()],
  })
  class ChildModule {
    static configService: typeof ConfigServiceClass;

    constructor(@Inject(ConfigServiceClass) configService: typeof ConfigServiceClass) {
      ChildModule.configService = configService;
    }
  }

  const givenOptions: ConfigModuleOptions = {};

  afterEach(() => {
    ConfigModule.isRegistered = false;
    (ConfigServiceClass as any)._instance = undefined;
    ChildModule.configService = undefined;
  });

  it('for root sync', async () => {
    mockLoadFileConfigs.mockReturnValue({});
    const appModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(ConfigModule, givenOptions), ChildModule],
    }).compile();

    // get appModule provided instance
    const configService = appModule.get(ConfigServiceClass);
    expect(configService).toBeInstanceOf(ConfigServiceClass);

    // ChildModule should have same instance
    expect(ChildModule.configService).toBe(configService);
  });

  it('for root async ', async () => {
    mockLoadFileConfigs.mockReturnValue({});
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
    const configService = appModule.get(ConfigServiceClass);
    expect(configService).toBeInstanceOf(ConfigServiceClass);

    // ChildModule should have same instance
    expect(ChildModule.configService).toBe(configService);
  });

  it('create', async () => {
    mockLoadFileConfigs.mockReturnValue({});
    const configService = ConfigModule.createConfigService(givenOptions);
    expect(configService).toBeInstanceOf(ConfigServiceClass);

    await Test.createTestingModule({
      imports: [ConfigModule.forRoot(ConfigModule, givenOptions), ChildModule],
    }).compile();

    // ChildModule should have same instance
    expect(ChildModule.configService).toBe(configService);
  });
});
