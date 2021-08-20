import { Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigModuleOptions } from './model';
import { ConfigService } from './config.service';
import { ConfigModule } from './config.module';

jest.mock('config', () => ({}));

describe('ConfigModule', function() {
  @Module({
    imports: [ConfigModule.forChild()],
  })
  class ChildModule {
    static configService: ConfigService;

    constructor(loggerService: ConfigService) {
      ChildModule.configService = loggerService;
    }
  }

  const givenOptions: ConfigModuleOptions = {};

  beforeEach(() => {
    ChildModule.configService = undefined;
  });

  it('for root sync', async function() {
    const appModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(ConfigModule, givenOptions), ChildModule],
    }).compile();

    // get appModule provided instance
    const configService = appModule.get(ConfigService);
    expect(configService).toBeInstanceOf(ConfigService);

    // ChildModule should have same instance
    expect(ChildModule.configService).toBe(configService);
  });

  it('for root async ', async function() {
    const appModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRootAsync(ConfigModule, {
          useFactory: () =>
            new Promise((resolve, _reject) => {
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

  it('create', async function() {
    const configService = ConfigModule.createConfigService(givenOptions);
    expect(configService).toBeInstanceOf(ConfigService);
  });
});
