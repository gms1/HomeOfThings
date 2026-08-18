/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';
import { Inject, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import type { ConfigModuleOptions } from './model';

const mockGetPath = jest.fn();
const mockToObject = jest.fn((obj: any) => obj);
const mockScan = jest.fn();
const mockFromEnvironment = jest.fn();

jest.unstable_mockModule('config/lib/util.js', () => ({
  Util: {
    getPath: mockGetPath,
    toObject: mockToObject,
  },
  Load: {
    fromEnvironment: mockFromEnvironment,
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
    mockFromEnvironment.mockReturnValue({ scan: mockScan, config: {} });
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
    mockFromEnvironment.mockReturnValue({ scan: mockScan, config: {} });
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
    mockFromEnvironment.mockReturnValue({ scan: mockScan, config: {} });
    const configService = ConfigModule.createConfigService(givenOptions);
    expect(configService).toBeInstanceOf(ConfigServiceClass);

    await Test.createTestingModule({
      imports: [ConfigModule.forRoot(ConfigModule, givenOptions), ChildModule],
    }).compile();

    // ChildModule should have same instance
    expect(ChildModule.configService).toBe(configService);
  });
});
