import { Type } from '@homeofthings/nestjs-utils';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';

import { getEntityManagerInjectionToken, getCustomRepositoryInjectionToken, getRepositoryInjectionToken } from './common/sqlite3.utils';
import { Sqlite3AsyncModuleOptions, Sqlite3SyncModuleOptions } from './model';
import { EntityManager } from './service/entity-manager';
import { Repository } from './service/repository';
import { Sqlite3CoreModule } from './sqlite3-core.module';
@Global()
@Module({})
export class Sqlite3Module {
  static register(moduleOptions: Sqlite3SyncModuleOptions): DynamicModule {
    return {
      module: Sqlite3Module,
      imports: [Sqlite3CoreModule.register(Sqlite3CoreModule, moduleOptions)],
    };
  }

  static registerAsync(asyncModuleOptions: Sqlite3AsyncModuleOptions): DynamicModule {
    return {
      module: Sqlite3Module,
      imports: [Sqlite3CoreModule.registerAsync(Sqlite3CoreModule, asyncModuleOptions)],
    };
  }

  static forFeature(entitiesOrRepository: Type[], connectionName?: string): DynamicModule {
    const entityManagerInjectionToken = getEntityManagerInjectionToken(connectionName);

    const providers: Provider[] = entitiesOrRepository.map((entityOrReository) => {
      if (entityOrReository.prototype instanceof Repository) {
        return {
          provide: getCustomRepositoryInjectionToken(entityOrReository.name, connectionName),
          useFactory: (entityManager: EntityManager) => entityManager.getCustomRepository(entityOrReository),
          inject: [entityManagerInjectionToken],
          // TODO: add extra property similar to the `target` property below
        };
      } else {
        return {
          provide: getRepositoryInjectionToken(entityOrReository.name, connectionName),
          useFactory: (entityManager: EntityManager) => entityManager.getRepository(entityOrReository),
          inject: [entityManagerInjectionToken],
          /**
           * Extra property to workaround dynamic modules caching issue caused by metadata serialization
           * if different entities are using the same class name (having different namespace/module)
           */
          target: EntityManager.getEntityTarget(entityOrReository),
        };
      }
    });
    return {
      module: Sqlite3Module,
      providers: providers,
      exports: providers,
    };
  }
}
