import { DynamicModule, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { Constructor } from '../model/common-types';
import { AsyncModuleBasicOptions, AsyncModuleOptions, InjectionToken } from '../model/module.options';

export class DynamicRootBaseModule {}

export type DynamicRootBaseModuleExtended<T, Os, Oa extends AsyncModuleBasicOptions = AsyncModuleOptions<Os>> = Constructor<DynamicRootBaseModule> & {
  isRegistered: boolean;
  forRoot(moduleCtor: Type<T>, moduleOptions: Os): DynamicModule;
  forRootAsync(moduleCtor: Type<T>, asyncModuleOptions: Oa): DynamicModule;
  register(moduleCtor: Type<T>, moduleOptions: Os): DynamicModule;
  registerAsync(moduleCtor: Type<T>, asyncModuleOptions: Oa): DynamicModule;
  forChild(): Promise<DynamicModule>;
};

export interface DynamicRootModuleProperties extends Partial<Pick<ModuleMetadata, 'imports' | 'exports' | 'providers' | 'controllers'>> {
  global?: boolean;
}

/**
 * @description create a dynamic root module
 * @export
 * @template T the type of the module
 * @template Os synchronouse module options
 * @template Oa asynchronouse module options (default: AsyncModuleOptions<Os>)
 * @param moduleOptionsInjectionToken
 * @param [moduleProperties={} additional modul properties (imports, exports, providers,...)]
 * @return {*}
 */
export function createDynamicRootModule<T, Os, Oa extends AsyncModuleBasicOptions = AsyncModuleOptions<Os>>(
  moduleOptionsInjectionToken: InjectionToken,
  moduleProperties: DynamicRootModuleProperties | ((options: Os | Oa) => DynamicRootModuleProperties) = {},
): DynamicRootBaseModuleExtended<T, Os, Oa> {
  class DynamicRootModule extends DynamicRootBaseModule {
    static readonly dynamicModule$ = new ReplaySubject<DynamicModule>(1);
    private static _isRegistered: boolean;
    static get isRegistered(): boolean {
      return DynamicRootModule._isRegistered;
    }
    static set isRegistered(registered: boolean) {
      DynamicRootModule._isRegistered = registered;
    }

    static registerAsync(moduleCtor: Type<T>, asyncModuleOptions: Oa): DynamicModule {
      const props = typeof moduleProperties === 'function' ? moduleProperties(asyncModuleOptions) : moduleProperties;

      const dynamicModule: DynamicModule = {
        module: moduleCtor,
        global: !!props.global,
        imports: [...(asyncModuleOptions.imports || []), ...(props.imports || [])],
        exports: [...(asyncModuleOptions.exports || []), ...(props.exports || [])],
        controllers: [...(props.controllers || [])],
        providers: [
          ...(asyncModuleOptions.providers || []),
          {
            provide: moduleOptionsInjectionToken,
            useFactory: asyncModuleOptions.useFactory,
            inject: asyncModuleOptions.inject || [],
          },
          ...(props.providers || []),
        ],
      };

      DynamicRootModule.isRegistered = true;
      DynamicRootModule.dynamicModule$.next(dynamicModule);

      return dynamicModule;
    }

    static forRootAsync(moduleCtor: Type<T>, asyncModuleOptions: Oa): DynamicModule {
      if (DynamicRootModule._isRegistered) {
        throw new Error(`${moduleCtor.name}: forRoot/forRootAsync called more than once`);
      }
      return DynamicRootModule.registerAsync(moduleCtor, asyncModuleOptions);
    }

    static register(moduleCtor: Type<T>, moduleOptions: Os): DynamicModule {
      const props = typeof moduleProperties === 'function' ? moduleProperties(moduleOptions) : moduleProperties;

      const dynamicModule: DynamicModule = {
        module: moduleCtor,
        global: !!props.global,
        imports: [...(props.imports || [])],
        exports: [...(props.exports || [])],
        controllers: [...(props.controllers || [])],
        providers: [
          {
            provide: moduleOptionsInjectionToken,
            useValue: moduleOptions,
          },
          ...(props.providers || []),
        ],
      };

      DynamicRootModule.isRegistered = true;
      DynamicRootModule.dynamicModule$.next(dynamicModule);

      return dynamicModule;
    }

    static forRoot(moduleCtor: Type<T>, moduleOptions: Os): DynamicModule {
      if (DynamicRootModule._isRegistered) {
        throw new Error(`${moduleCtor.name}: forRoot/forRootAsync called more than once`);
      }
      return DynamicRootModule.register(moduleCtor, moduleOptions);
    }

    static forChild(): Promise<DynamicModule> {
      return firstValueFrom(DynamicRootModule.dynamicModule$.asObservable());
    }
  }
  return DynamicRootModule;
}
