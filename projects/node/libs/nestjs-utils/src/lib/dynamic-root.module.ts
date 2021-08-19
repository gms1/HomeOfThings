import { DynamicModule, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { AsyncModuleOptions, InjectionToken } from './model/module.options';

export interface ConfigurableDynamicRootModule<T, U> {
  new (): Type<T>;

  forRootAsync(moduleCtor: Type<T>, asyncModuleOptions: AsyncModuleOptions<U>): DynamicModule;
  forRoot(moduleCtor: Type<T>, moduleConfig: U): DynamicModule;
  forChild(): Promise<DynamicModule>;
}

export function createDynamicRootModule<T, U>(
  moduleConfigToken: InjectionToken,
  moduleProperties: Partial<Pick<ModuleMetadata, 'imports' | 'exports' | 'providers' | 'controllers'>> = {
    imports: [],
    exports: [],
    providers: [],
  },
) {
  class DynamicRootModule {
    static moduleSubject = new ReplaySubject<DynamicModule>();

    static forRootAsync(moduleCtor: Type<T>, asyncModuleOptions: AsyncModuleOptions<U>): DynamicModule {
      const dynamicModule = {
        module: moduleCtor,
        imports: [...(asyncModuleOptions.imports || []), ...(moduleProperties.imports || [])],
        exports: [...(asyncModuleOptions.exports || []), ...(moduleProperties.exports || [])],
        providers: [
          {
            provide: moduleConfigToken,
            useFactory: asyncModuleOptions.useFactory,
            inject: asyncModuleOptions.inject || [],
          },
          ...(moduleProperties.providers || []),
        ],
      };

      DynamicRootModule.moduleSubject.next(dynamicModule);

      return dynamicModule;
    }

    static forRoot(moduleCtor: Type<T>, moduleConfig: U): DynamicModule {
      const dynamicModule: DynamicModule = {
        module: moduleCtor,
        imports: [...(moduleProperties.imports || [])],
        exports: [...(moduleProperties.exports || [])],
        controllers: [...(moduleProperties.controllers || [])],
        providers: [
          {
            provide: moduleConfigToken,
            useValue: moduleConfig,
          },
          ...(moduleProperties.providers || []),
        ],
      };

      DynamicRootModule.moduleSubject.next(dynamicModule);

      return dynamicModule;
    }

    static forChild(): Promise<DynamicModule> {
      return firstValueFrom(DynamicRootModule.moduleSubject.asObservable());
    }
  }

  return (DynamicRootModule as unknown) as ConfigurableDynamicRootModule<T, U>;
}
