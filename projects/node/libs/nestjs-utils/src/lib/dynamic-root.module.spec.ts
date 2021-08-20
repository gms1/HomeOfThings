import { Global, Inject, Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createDynamicRootModule } from './dynamic-root.module';

const MY_MODULE_OPTIONS_TOKEN = 'MY_MODULE_OPTIONS_TOKEN';

interface MyModuleOptions {
  value: string;
}

@Injectable()
class MyService {
  constructor(@Inject(MY_MODULE_OPTIONS_TOKEN) public options: MyModuleOptions) {}
}

@Module({
  providers: [MyService],
  exports: [MyService],
})
export class MyNonGlobalSyncDynamicRootModule extends createDynamicRootModule<MyNonGlobalSyncDynamicRootModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN) {}

@Module({
  providers: [MyService],
  exports: [MyService],
})
export class MyNonGlobalAsyncDynamicRootModule extends createDynamicRootModule<MyNonGlobalAsyncDynamicRootModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN) {}

@Global()
@Module({
  providers: [MyService],
  exports: [MyService],
})
export class MyGlobalDecoratedSyncDynamicRootModule extends createDynamicRootModule<MyGlobalDecoratedSyncDynamicRootModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN) {}

@Global()
@Module({
  providers: [MyService],
  exports: [MyService],
})
export class MyGlobalDecoratedAsyncDynamicRootModule extends createDynamicRootModule<MyGlobalDecoratedAsyncDynamicRootModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN) {}

@Module({
  providers: [MyService],
  exports: [MyService],
})
export class MyGlobalPropertySyncDynamicRootModule extends createDynamicRootModule<MyGlobalPropertySyncDynamicRootModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN, {
  global: true,
}) {}

@Module({
  providers: [MyService],
  exports: [MyService],
})
export class MyGlobalPropertyAsyncDynamicRootModule extends createDynamicRootModule<MyGlobalPropertyAsyncDynamicRootModule, MyModuleOptions>(MY_MODULE_OPTIONS_TOKEN, {
  global: true,
}) {}

describe('createDynamicRootModule', function() {
  describe('non global', function() {
    it('synchronously', async function() {
      @Module({
        imports: [MyNonGlobalSyncDynamicRootModule.forChild()],
      })
      class ChildModule {
        static myService: MyService;

        constructor(sqlite3Service: MyService) {
          ChildModule.myService = sqlite3Service;
        }
      }

      const givenOptions: MyModuleOptions = { value: 'non-global-sync' };
      const appModule = await Test.createTestingModule({
        imports: [MyNonGlobalSyncDynamicRootModule.forRoot(MyNonGlobalSyncDynamicRootModule, givenOptions), ChildModule],
      }).compile();
      expect(appModule.get(MyService).options).toBe(givenOptions);
      expect(ChildModule.myService.options).toBe(givenOptions);
    });

    it('asynchronously', async function() {
      @Module({
        imports: [MyNonGlobalAsyncDynamicRootModule.forChild()],
      })
      class ChildModule {
        static myService: MyService;

        constructor(sqlite3Service: MyService) {
          ChildModule.myService = sqlite3Service;
        }
      }

      const givenOptions: MyModuleOptions = { value: 'non-global-async' };
      @Injectable()
      class MyModuleOptionsProvider {
        getModuleOptions(): Promise<MyModuleOptions> {
          return new Promise((resolve, _reject) => {
            setTimeout(resolve, 3000, givenOptions);
          });
        }
      }

      const appModule = await Test.createTestingModule({
        imports: [
          MyNonGlobalAsyncDynamicRootModule.forRootAsync(MyNonGlobalAsyncDynamicRootModule, {
            // NOTE: using factory with inject; injected parameter is provided by given providers
            providers: [MyModuleOptionsProvider],
            useFactory: (cfg: MyModuleOptionsProvider) => cfg.getModuleOptions(),
            inject: [MyModuleOptionsProvider],
          }),
          ChildModule,
        ],
      }).compile();
      expect(appModule.get(MyService).options).toBe(givenOptions);
      expect(ChildModule.myService.options).toBe(givenOptions);
    });
  });

  describe('decorated global', function() {
    it('synchronously', async function() {
      @Module({})
      class ChildModule {
        static myService: MyService;

        constructor(sqlite3Service: MyService) {
          ChildModule.myService = sqlite3Service;
        }
      }

      const givenOptions: MyModuleOptions = { value: 'global-decorated-sync' };
      const appModule = await Test.createTestingModule({
        imports: [MyGlobalDecoratedSyncDynamicRootModule.forRoot(MyGlobalDecoratedSyncDynamicRootModule, givenOptions), ChildModule],
      }).compile();
      expect(appModule.get(MyService).options).toBe(givenOptions);
      expect(ChildModule.myService.options).toBe(givenOptions);
    });

    it('asynchronously', async function() {
      @Module({})
      class ChildModule {
        static myService: MyService;

        constructor(sqlite3Service: MyService) {
          ChildModule.myService = sqlite3Service;
        }
      }

      const givenOptions: MyModuleOptions = { value: 'global-decorated-async' };
      const appModule = await Test.createTestingModule({
        imports: [
          MyGlobalDecoratedAsyncDynamicRootModule.forRootAsync(MyGlobalDecoratedAsyncDynamicRootModule, {
            // NOTE: using factory without inject
            useFactory: () =>
              new Promise((resolve, _reject) => {
                setTimeout(resolve, 3000, givenOptions);
              }),
          }),
          ChildModule,
        ],
      }).compile();
      expect(appModule.get(MyService).options).toBe(givenOptions);
      expect(ChildModule.myService.options).toBe(givenOptions);
    });
  });

  describe('global property', function() {
    it('synchronously', async function() {
      @Module({})
      class ChildModule {
        static myService: MyService;

        constructor(sqlite3Service: MyService) {
          ChildModule.myService = sqlite3Service;
        }
      }

      const givenOptions: MyModuleOptions = { value: 'global-property-sync' };
      const appModule = await Test.createTestingModule({
        imports: [MyGlobalPropertySyncDynamicRootModule.forRoot(MyGlobalPropertySyncDynamicRootModule, givenOptions), ChildModule],
      }).compile();
      expect(appModule.get(MyService).options).toBe(givenOptions);
      expect(ChildModule.myService.options).toBe(givenOptions);
    });

    it('asynchronously', async function() {
      @Module({})
      class ChildModule {
        static myService: MyService;

        constructor(sqlite3Service: MyService) {
          ChildModule.myService = sqlite3Service;
        }
      }

      const givenOptions: MyModuleOptions = { value: 'global-property-async' };
      @Injectable()
      class MyModuleOptionsProvider {
        getModuleOptions(): Promise<MyModuleOptions> {
          return new Promise((resolve, _reject) => {
            setTimeout(resolve, 3000, givenOptions);
          });
        }
      }

      @Module({
        providers: [MyModuleOptionsProvider],
        exports: [MyModuleOptionsProvider],
      })
      class MyModuleOptionsModule {}

      const appModule = await Test.createTestingModule({
        imports: [
          MyGlobalPropertyAsyncDynamicRootModule.forRootAsync(MyGlobalPropertyAsyncDynamicRootModule, {
            // NOTE: using factory with inject; injected parameter is provided by given import
            imports: [MyModuleOptionsModule],
            useFactory: (cfg: MyModuleOptionsProvider) => cfg.getModuleOptions(),
            inject: [MyModuleOptionsProvider],
          }),
          ChildModule,
        ],
      }).compile();
      expect(appModule.get(MyService).options).toBe(givenOptions);
      expect(ChildModule.myService.options).toBe(givenOptions);
    });
  });
});
