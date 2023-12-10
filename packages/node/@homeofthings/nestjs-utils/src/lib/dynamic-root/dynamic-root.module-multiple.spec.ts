/* eslint-disable @typescript-eslint/no-explicit-any */
import { DynamicModule, FactoryProvider, Global, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { createDynamicRootModule, DynamicRootModuleProperties } from './dynamic-root.module';
import { Dictionary, GenericDictionary } from '../model/common-types';
import { AsyncModuleOptions } from '../model/module.options';

describe('multiple DynamicRootModules', () => {
  let appModule: TestingModule;

  beforeEach(async () => {
    MyManager.reset();
  });
  afterEach(async () => {
    if (appModule) {
      await appModule.close();
    }
    (appModule as any) = undefined;
  });

  it('should provide multiple features', async () => {
    const givenDefaultValue = 'defaultValue';
    const givenName1 = 'name1';
    const givenName1Value = 'name1Value';
    appModule = await Test.createTestingModule({
      imports: [
        MyDynamicRootModule.registerAsync({
          name: givenName1,
          useFactory: () =>
            new Promise((resolve) => {
              setTimeout(resolve, 300, { value: givenName1Value });
            }),
        }),
        MyDynamicRootModule.register({ value: givenDefaultValue }),
        MyDynamicRootModule.forFeature(givenName1),
        MyDynamicRootModule.forFeature(),
      ],
    }).compile();
    const defaultFeature = appModule.get(getMyFeatureInjectionToken());
    const name1Feature = appModule.get(getMyFeatureInjectionToken(givenName1));
    expect(defaultFeature).toBe('featureProvider[default]: {moduleProvider[default]: {value: defaultValue}, name: undefined}');
    expect(name1Feature).toBe('featureProvider[name1]: {moduleProvider[name1]: {value: name1Value}, name: name1}');
  });
});

const MY_MODULE_OPTIONS_TOKEN = 'MY_MULTIPLE_DYNAMIC_MODULE_OPTIONS_TOKEN';
const MY_DEFAULT_OPTIONS_NAME = 'default';

interface MyCommonOptions {
  value: string;
}

interface MySyncModuleOptions extends MyCommonOptions {
  name?: string;
}

interface MyAsyncModuleOptions extends AsyncModuleOptions<MyCommonOptions> {
  name?: string;
}

@Injectable()
class MyManager {
  private static _instance: MyManager;

  static namedOptions: GenericDictionary<MyCommonOptions> = {};
  static namedModuleProviders: Dictionary = {};

  moduleProviderFactory(optionsName: string | undefined, moduleOptions: MyCommonOptions): Promise<string> {
    const name = optionsName || MY_DEFAULT_OPTIONS_NAME;
    MyManager.namedOptions[name] = moduleOptions;
    return new Promise((resolve) => {
      setTimeout(resolve, 300, `moduleProvider[${name}]: {value: ${moduleOptions.value}}, name: ${optionsName}`);
    });
  }

  featureProviderFactory(featureName: string | undefined, namedModuleProvider: string): Promise<string> {
    const name = featureName || MY_DEFAULT_OPTIONS_NAME;
    MyManager.namedModuleProviders[name] = namedModuleProvider;
    return new Promise((resolve) => {
      setTimeout(resolve, 300, `featureProvider[${name}]: {${namedModuleProvider}}`);
    });
  }

  static reset() {
    MyManager.namedOptions = {};
    MyManager.namedModuleProviders = {};
    MyManager._instance = undefined;
  }

  static getInstance(): MyManager {
    if (!this._instance) {
      this.initialize();
    }
    return this._instance;
  }

  static initialize() {
    this._instance = new MyManager();
  }
}

function getMyNamedModuleInjectionToken(name = MY_DEFAULT_OPTIONS_NAME) {
  return `MY_NAMED_MODULE_TOKEN.${name}`;
}

function getDynamicModuleProperties(modulOptions: MySyncModuleOptions | MyAsyncModuleOptions): DynamicRootModuleProperties {
  const myNamedModuleInjectionToken = getMyNamedModuleInjectionToken(modulOptions.name);
  const myNamedModuleProvider: FactoryProvider<Promise<string>> = {
    provide: myNamedModuleInjectionToken,
    useFactory: (myService: MyManager, myNamedModuleOptions: MyCommonOptions) => myService.moduleProviderFactory(modulOptions.name, myNamedModuleOptions),
    inject: [MyManager, MY_MODULE_OPTIONS_TOKEN],
  };
  return {
    providers: [myNamedModuleProvider],
    exports: [myNamedModuleInjectionToken],
  };
}

@Global()
@Module({
  providers: [
    {
      provide: MyManager,
      // NOTE: forceing MyManager to be a singleton; otherwise DI may create multiple instances
      useValue: MyManager.getInstance(),
    },
  ],
  exports: [MyManager],
})
class MyCoreDynamicRootModule extends createDynamicRootModule<MyCoreDynamicRootModule, MySyncModuleOptions, MyAsyncModuleOptions>(
  MY_MODULE_OPTIONS_TOKEN,
  getDynamicModuleProperties,
) {}

function getMyFeatureInjectionToken(name = MY_DEFAULT_OPTIONS_NAME) {
  return `MY_NAMED_FEATURE_TOKEN.${name}`;
}

@Global()
@Module({})
class MyDynamicRootModule {
  static register(moduleOptions: MySyncModuleOptions): DynamicModule {
    return {
      module: MyDynamicRootModule,
      imports: [MyCoreDynamicRootModule.register(MyCoreDynamicRootModule, moduleOptions)],
    };
  }

  static registerAsync(asyncModuleOptions: MyAsyncModuleOptions): DynamicModule {
    return {
      module: MyDynamicRootModule,
      imports: [MyCoreDynamicRootModule.registerAsync(MyCoreDynamicRootModule, asyncModuleOptions)],
    };
  }

  static forFeature(name?: string): DynamicModule {
    const myNamedModuleInjectionToken = getMyNamedModuleInjectionToken(name);
    const myNamedFeatureInjectionToken = getMyFeatureInjectionToken(name);
    const myFeatureModuleProvider: FactoryProvider<Promise<string>> = {
      provide: myNamedFeatureInjectionToken,
      useFactory: (myService: MyManager, myNamedModuleProvider: string) => myService.featureProviderFactory(name, myNamedModuleProvider),
      inject: [MyManager, myNamedModuleInjectionToken],
    };
    return {
      module: MyDynamicRootModule,
      providers: [myFeatureModuleProvider],
      exports: [myNamedFeatureInjectionToken],
    };
  }
}
