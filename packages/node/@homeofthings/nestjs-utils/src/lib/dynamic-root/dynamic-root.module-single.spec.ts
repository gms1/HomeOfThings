import { Global, Inject, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createDynamicRootModule } from './dynamic-root.module';

describe('single DynamicRootModule', () => {
  let appModule: TestingModule;

  beforeEach(() => MyService.reset());
  afterEach(async () => {
    if (appModule) {
      await appModule.close();
    }
  });

  describe('non global', () => {
    it('synchronously', async () => {
      const givenDynamicRootModule = MyNonGlobalSyncDynamicRootModule;
      @Module({
        imports: [givenDynamicRootModule.forChild()],
      })
      class ChildModule1 {
        static myService: MyService;

        constructor(sqlite3Service: MyService) {
          ChildModule1.myService = sqlite3Service;
        }
      }

      @Module({
        imports: [givenDynamicRootModule.forChild()],
      })
      class ChildModule2 {
        static myService: MyService;

        constructor(sqlite3Service: MyService) {
          ChildModule2.myService = sqlite3Service;
        }
      }

      const givenChildModule = ChildModule2;
      const givenOptions: MyModuleOptions = { value: 'non-global-sync' };
      appModule = await Test.createTestingModule({
        imports: [ChildModule1, givenDynamicRootModule.forRoot(givenDynamicRootModule, givenOptions), givenChildModule],
      }).compile();

      const myService = appModule.get(MyService);
      expect(MyService.instances.length).toBe(1);
      expect(MyService.instances[0]).toBe(myService);
      expect(MyService.instances[0]).toBe(givenChildModule.myService);
    });

    it('asynchronously', async () => {
      const givenDynamicRootModule = MyNonGlobalAsyncDynamicRootModule;
      @Module({
        imports: [givenDynamicRootModule.forChild()],
      })
      class ChildModule1 {
        static myService: MyService;

        constructor(sqlite3Service: MyService) {
          ChildModule1.myService = sqlite3Service;
        }
      }

      @Module({
        imports: [givenDynamicRootModule.forChild()],
      })
      class ChildModule2 {
        static myService: MyService;

        constructor(sqlite3Service: MyService) {
          ChildModule2.myService = sqlite3Service;
        }
      }

      const givenChildModule = ChildModule2;
      const givenOptions: MyModuleOptions = { value: 'non-global-async' };
      appModule = await Test.createTestingModule({
        imports: [
          ChildModule1, // child before
          givenDynamicRootModule.forRootAsync(givenDynamicRootModule, {
            // NOTE: using factory without inject
            useFactory: () =>
              new Promise((resolve) => {
                setTimeout(resolve, 3000, givenOptions);
              }),
          }),
          givenChildModule, // child after
        ],
      }).compile();

      const myService = appModule.get(MyService);
      expect(MyService.instances.length).toBe(1);
      expect(MyService.instances[0]).toBe(myService);
      expect(MyService.instances[0]).toBe(givenChildModule.myService);
    });
  });

  describe('decorated global', () => {
    it('synchronously', async () => {
      const givenDynamicRootModule = MyGlobalDecoratedSyncDynamicRootModule;
      const givenChildModule = MyGlobalChildModule;
      const givenOptions: MyModuleOptions = { value: 'global-decorated-sync' };
      appModule = await Test.createTestingModule({
        imports: [givenDynamicRootModule.forRoot(givenDynamicRootModule, givenOptions), givenChildModule],
      }).compile();

      const myService = appModule.get(MyService);
      expect(MyService.instances.length).toBe(1);
      expect(MyService.instances[0]).toBe(myService);
      expect(MyService.instances[0]).toBe(givenChildModule.myService);
    });

    it('asynchronously', async () => {
      @Injectable()
      class MyModuleOptionsProvider {
        getModuleOptions(): Promise<MyModuleOptions> {
          return new Promise((resolve) => {
            setTimeout(resolve, 3000, givenOptions);
          });
        }
      }

      const givenDynamicRootModule = MyGlobalDecoratedAsyncDynamicRootModule;
      const givenChildModule = MyGlobalChildModule;
      const givenOptions: MyModuleOptions = { value: 'global-decorated-async' };
      appModule = await Test.createTestingModule({
        imports: [
          givenDynamicRootModule.forRootAsync(givenDynamicRootModule, {
            // NOTE: using factory with inject; injected parameter is provided by given providers
            providers: [MyModuleOptionsProvider],
            useFactory: (cfg: MyModuleOptionsProvider) => cfg.getModuleOptions(),
            inject: [MyModuleOptionsProvider],
          }),
          givenChildModule,
        ],
      }).compile();

      const myService = appModule.get(MyService);
      expect(MyService.instances.length).toBe(1);
      expect(MyService.instances[0]).toBe(myService);
      expect(MyService.instances[0]).toBe(givenChildModule.myService);
    });
  });

  describe('global property', () => {
    it('synchronously', async () => {
      const givenDynamicRootModule = MyGlobalPropertySyncDynamicRootModule;
      const givenChildModule = MyGlobalChildModule;
      const givenOptions: MyModuleOptions = { value: 'global-property-sync' };
      appModule = await Test.createTestingModule({
        imports: [givenDynamicRootModule.forRoot(givenDynamicRootModule, givenOptions), givenChildModule],
      }).compile();

      const myService = appModule.get(MyService);
      expect(MyService.instances.length).toBe(1);
      expect(MyService.instances[0]).toBe(myService);
      expect(MyService.instances[0]).toBe(givenChildModule.myService);
    });

    it('asynchronously', async () => {
      @Injectable()
      class MyModuleOptionsProvider {
        getModuleOptions(): Promise<MyModuleOptions> {
          return new Promise((resolve) => {
            setTimeout(resolve, 3000, givenOptions);
          });
        }
      }
      @Module({
        providers: [MyModuleOptionsProvider],
        exports: [MyModuleOptionsProvider],
      })
      class MyModuleOptionsModule {}

      const givenDynamicRootModule = MyGlobalPropertyAsyncDynamicRootModule;
      const givenChildModule = MyGlobalChildModule;
      const givenOptions: MyModuleOptions = { value: 'global-property-async' };
      appModule = await Test.createTestingModule({
        imports: [
          givenDynamicRootModule.forRootAsync(givenDynamicRootModule, {
            // NOTE: using factory with inject; injected parameter is provided by given import
            imports: [MyModuleOptionsModule],
            useFactory: (cfg: MyModuleOptionsProvider) => cfg.getModuleOptions(),
            inject: [MyModuleOptionsProvider],
          }),
          givenChildModule,
        ],
      }).compile();

      const myService = appModule.get(MyService);
      expect(MyService.instances.length).toBe(1);
      expect(MyService.instances[0]).toBe(myService);
      expect(MyService.instances[0]).toBe(givenChildModule.myService);
    });
  });

  describe('more global', () => {
    it('unnecessary forChild', async () => {
      const givenDynamicRootModule = MyGlobalUnnecessaryForChildDynamicRootModule;

      @Module({
        imports: [givenDynamicRootModule.forChild()],
      })
      class ChildModule {
        static myService: MyService;

        constructor(sqlite3Service: MyService) {
          ChildModule.myService = sqlite3Service;
        }
      }

      const givenChildModule = ChildModule;
      const givenOptions: MyModuleOptions = {
        value: 'global-unecessary-forChild',
      };
      appModule = await Test.createTestingModule({
        imports: [givenDynamicRootModule.forRoot(givenDynamicRootModule, givenOptions), givenChildModule],
      }).compile();

      const myService = appModule.get(MyService);
      expect(MyService.instances.length).toBe(1);
      expect(MyService.instances[0]).toBe(myService);
      expect(MyService.instances[0]).toBe(givenChildModule.myService);
    });

    it('duplicate forRoot', async () => {
      const givenDynamicRootModule = MyGlobalDuplicateForRootDynamicRootModule;

      @Module({})
      class ChildModule {
        static myService: MyService;

        constructor(sqlite3Service: MyService) {
          ChildModule.myService = sqlite3Service;
        }
      }

      const givenChildModule = ChildModule;
      const givenOptions1: MyModuleOptions = {
        value: 'global-duplicate-forRoot-options1',
      };
      const givenOptions2: MyModuleOptions = {
        value: 'global-duplicate-forRoot-options2',
      };

      try {
        appModule = await Test.createTestingModule({
          imports: [givenDynamicRootModule.forRoot(givenDynamicRootModule, givenOptions1), givenDynamicRootModule.forRoot(givenDynamicRootModule, givenOptions2), givenChildModule],
        }).compile();
      } catch (e) {
        expect(givenDynamicRootModule.isRegistered).toBe(true);
        return;
      }
      fail('should have thrown');
    });

    it('duplicate forRootAsync', async () => {
      const givenDynamicRootModule = MyGlobalDuplicateForRootAsyncDynamicRootModule;

      @Module({})
      class ChildModule {
        static myService: MyService;

        constructor(sqlite3Service: MyService) {
          ChildModule.myService = sqlite3Service;
        }
      }

      const givenChildModule = ChildModule;
      const givenOptions1: MyModuleOptions = {
        value: 'global-duplicate-forRoot-options1',
      };
      const givenOptions2: MyModuleOptions = {
        value: 'global-duplicate-forRoot-options2',
      };

      try {
        appModule = await Test.createTestingModule({
          imports: [
            givenDynamicRootModule.forRootAsync(givenDynamicRootModule, {
              useFactory: () =>
                new Promise((resolve) => {
                  setTimeout(resolve, 3000, givenOptions1);
                }),
            }),
            givenDynamicRootModule.forRootAsync(givenDynamicRootModule, {
              useFactory: () =>
                new Promise((resolve) => {
                  setTimeout(resolve, 3000, givenOptions2);
                }),
            }),
            givenChildModule,
          ],
        }).compile();
      } catch (e) {
        expect(givenDynamicRootModule.isRegistered).toBe(true);
        return;
      }
      fail('should have thrown');
    });
  });
});

const MY_MODULE_OPTIONS_TOKEN = 'MY_SINGLE_DYNAMIC_MODULE_OPTIONS_TOKEN';

interface MyModuleOptions {
  value: string;
}

@Injectable()
class MyService {
  static instances: MyService[] = [];

  constructor(@Inject(MY_MODULE_OPTIONS_TOKEN) public options: MyModuleOptions) {
    MyService.instances.push(this);
    if (MyService.instances.length > 1) {
      throw new Error(`MyService instantiated multiple times`);
    }
  }

  static reset() {
    MyService.instances.length = 0;
  }
}

@Module({})
class MyGlobalChildModule {
  static myService: MyService;

  constructor(sqlite3Service: MyService) {
    MyGlobalChildModule.myService = sqlite3Service;
  }
}

// NOTE: defining multiple root modules, because otherwise Test.createTestingModule got confused when using the same root module for all tests
// the service singleton was not re-instantiated by the second call even if appModule was closed

@Module({
  providers: [MyService],
  exports: [MyService],
})
class MyNonGlobalSyncDynamicRootModule extends createDynamicRootModule<MyNonGlobalSyncDynamicRootModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN) {}

@Module({
  providers: [MyService],
  exports: [MyService],
})
class MyNonGlobalAsyncDynamicRootModule extends createDynamicRootModule<MyNonGlobalAsyncDynamicRootModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN) {}

@Global()
@Module({
  providers: [MyService],
  exports: [MyService],
})
class MyGlobalDecoratedSyncDynamicRootModule extends createDynamicRootModule<MyGlobalDecoratedSyncDynamicRootModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN) {}

@Global()
@Module({
  providers: [MyService],
  exports: [MyService],
})
class MyGlobalDecoratedAsyncDynamicRootModule extends createDynamicRootModule<MyGlobalDecoratedAsyncDynamicRootModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN) {}

@Module({
  providers: [MyService],
  exports: [MyService],
})
class MyGlobalPropertySyncDynamicRootModule extends createDynamicRootModule<MyGlobalPropertySyncDynamicRootModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN, {
  global: true,
}) {}

@Module({
  providers: [MyService],
  exports: [MyService],
})
class MyGlobalPropertyAsyncDynamicRootModule extends createDynamicRootModule<MyGlobalPropertyAsyncDynamicRootModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN, {
  global: true,
}) {}

@Global()
@Module({
  providers: [MyService],
  exports: [MyService],
})
class MyGlobalUnnecessaryForChildDynamicRootModule extends createDynamicRootModule<MyGlobalUnnecessaryForChildDynamicRootModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN) {}

@Global()
@Module({
  providers: [MyService],
  exports: [MyService],
})
class MyGlobalDuplicateForRootDynamicRootModule extends createDynamicRootModule<MyGlobalDuplicateForRootDynamicRootModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN) {}

@Global()
@Module({
  providers: [MyService],
  exports: [MyService],
})
class MyGlobalDuplicateForRootAsyncDynamicRootModule extends createDynamicRootModule<MyGlobalDuplicateForRootAsyncDynamicRootModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN) {}
