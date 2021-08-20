import { DynamicModule, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { Constructor } from './model/common-types';
import { AsyncModuleOptions, InjectionToken } from './model/module.options';

export class DynamicRootBaseModule {}

export type DynamicRootBaseModuleExtended<T, U> = Constructor<DynamicRootBaseModule> & {
  forRootAsync(moduleCtor: Type<T>, asyncModuleOptions: AsyncModuleOptions<U>): DynamicModule;
  forRoot(moduleCtor: Type<T>, moduleConfig: U): DynamicModule;
  forChild(): Promise<DynamicModule>;
};

export interface DynamicRootModuleProperties extends Partial<Pick<ModuleMetadata, 'imports' | 'exports' | 'providers' | 'controllers'>> {
  global?: boolean;
}

export function createDynamicRootModule<T, U>(
  moduleOptionsInjectionToken: InjectionToken,
  moduleProperties: DynamicRootModuleProperties = {},
): DynamicRootBaseModuleExtended<T, U> {
  class DynamicRootModule extends DynamicRootBaseModule {
    static dynamicModule$ = new ReplaySubject<DynamicModule>(1);

    static forRootAsync(moduleCtor: Type<T>, asyncModuleOptions: AsyncModuleOptions<U>): DynamicModule {
      const dynamicModule: DynamicModule = {
        module: moduleCtor,
        global: !!moduleProperties.global,
        imports: [...(asyncModuleOptions.imports || []), ...(moduleProperties.imports || [])],
        exports: [...(asyncModuleOptions.exports || []), ...(moduleProperties.exports || [])],
        controllers: [...(moduleProperties.controllers || [])],
        providers: [
          ...(asyncModuleOptions.providers || []),
          {
            provide: moduleOptionsInjectionToken,
            useFactory: asyncModuleOptions.useFactory,
            inject: asyncModuleOptions.inject || [],
          },
          ...(moduleProperties.providers || []),
        ],
      };

      DynamicRootModule.dynamicModule$.next(dynamicModule);

      return dynamicModule;
    }

    static forRoot(moduleCtor: Type<T>, moduleOptions: U): DynamicModule {
      const dynamicModule: DynamicModule = {
        module: moduleCtor,
        global: !!moduleProperties.global,
        imports: [...(moduleProperties.imports || [])],
        exports: [...(moduleProperties.exports || [])],
        controllers: [...(moduleProperties.controllers || [])],
        providers: [
          {
            provide: moduleOptionsInjectionToken,
            useValue: moduleOptions,
          },
          ...(moduleProperties.providers || []),
        ],
      };

      DynamicRootModule.dynamicModule$.next(dynamicModule);

      return dynamicModule;
    }

    static forChild(): Promise<DynamicModule> {
      return firstValueFrom(DynamicRootModule.dynamicModule$.asObservable());
    }
  }
  return DynamicRootModule;
}
