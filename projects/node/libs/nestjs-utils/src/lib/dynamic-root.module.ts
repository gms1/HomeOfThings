import { DynamicModule, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { Constructor } from './model/common-types';
import { AsyncModuleOptions, InjectionToken } from './model/module.options';

export class DynamicRootBaseModule {}

export type DynamicRootBaseModuleExtended<T, U> = Constructor<DynamicRootBaseModule> & {
  isRegistered: boolean;
  forRoot(moduleCtor: Type<T>, moduleConfig: U): DynamicModule;
  forRootAsync(moduleCtor: Type<T>, asyncModuleOptions: AsyncModuleOptions<U>): DynamicModule;
  register(moduleCtor: Type<T>, moduleConfig: U): DynamicModule;
  registerAsync(moduleCtor: Type<T>, asyncModuleOptions: AsyncModuleOptions<U>): DynamicModule;
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
    static readonly dynamicModule$ = new ReplaySubject<DynamicModule>(1);
    private static _isRegistered: boolean;
    static get isRegistered(): boolean {
      return DynamicRootModule._isRegistered;
    }
    static set isRegistered(registered: boolean) {
      DynamicRootModule._isRegistered = registered;
    }

    static registerAsync(moduleCtor: Type<T>, asyncModuleOptions: AsyncModuleOptions<U>): DynamicModule {
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

      DynamicRootModule.isRegistered = true;
      DynamicRootModule.dynamicModule$.next(dynamicModule);

      return dynamicModule;
    }

    static forRootAsync(moduleCtor: Type<T>, asyncModuleOptions: AsyncModuleOptions<U>): DynamicModule {
      if (DynamicRootModule._isRegistered) {
        throw new Error(`${moduleCtor.name} registered called more than once`);
      }
      return DynamicRootModule.registerAsync(moduleCtor, asyncModuleOptions);
    }

    static register(moduleCtor: Type<T>, moduleOptions: U): DynamicModule {
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

      DynamicRootModule.isRegistered = true;
      DynamicRootModule.dynamicModule$.next(dynamicModule);

      return dynamicModule;
    }

    static forRoot(moduleCtor: Type<T>, moduleOptions: U): DynamicModule {
      if (DynamicRootModule._isRegistered) {
        throw new Error(`${moduleCtor.name} registered called more than once`);
      }
      return DynamicRootModule.register(moduleCtor, moduleOptions);
    }

    static forChild(): Promise<DynamicModule> {
      return firstValueFrom(DynamicRootModule.dynamicModule$.asObservable());
    }
  }
  return DynamicRootModule;
}
