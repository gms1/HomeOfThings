import { FactoryProvider, Global, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { APP_INTERCEPTOR, ModuleRef } from '@nestjs/core';
import { Sqlite3AsyncModuleOptions, Sqlite3ConnectionOptions, Sqlite3SyncModuleOptions, SQLITE3_MODULE_OPTIONS_TOKEN } from './model';
import { ConnectionManager } from './services/connection-manager';
import { createDynamicRootModule, DynamicRootModuleProperties } from '@homeofthings/nestjs-utils';
import { Sqlite3Interceptor } from './services/sqlite3-interceptor';
import { SqlConnectionPool } from 'sqlite3orm';
import { getConnectionPoolInjectionToken, getEntityManagerInjectionToken } from './common/sqlite3.utils';
import { EntityManager } from './services/entity-manager';

function getSqlite3DynamicRootModuleProperties(modulOptions: Sqlite3SyncModuleOptions | Sqlite3AsyncModuleOptions): DynamicRootModuleProperties {
  // provide connection pool for connection name
  const connectionPoolInjectionToken = getConnectionPoolInjectionToken(modulOptions.name);
  const connectionPoolProvider: FactoryProvider<Promise<SqlConnectionPool>> = {
    provide: connectionPoolInjectionToken,
    useFactory: (connectionManager: ConnectionManager, connectOptions: Sqlite3ConnectionOptions) => connectionManager.openConnectionPool(modulOptions.name, connectOptions),
    inject: [ConnectionManager, SQLITE3_MODULE_OPTIONS_TOKEN],
  };

  // provide entity manager for connection name
  const entityManagerInjectionToken = getEntityManagerInjectionToken(modulOptions.name);
  const entityManagerProvider: FactoryProvider<Promise<EntityManager>> = {
    provide: entityManagerInjectionToken,
    useFactory: (connectionManager: ConnectionManager) => connectionManager.getEntityManager(modulOptions.name),
    inject: [ConnectionManager],
  };

  return {
    providers: [connectionPoolProvider, entityManagerProvider],
    exports: [connectionPoolProvider, entityManagerProvider],
  };
}

@Global()
@Module({
  providers: [
    {
      provide: ConnectionManager,
      // NOTE: forceing ConnectionManager to be a singleton; otherwise DI may create multiple instances
      useValue: ConnectionManager.getInstance(),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: Sqlite3Interceptor,
    },
  ],
  exports: [ConnectionManager],
})
export class Sqlite3CoreModule
  extends createDynamicRootModule<Sqlite3CoreModule, Sqlite3SyncModuleOptions, Sqlite3AsyncModuleOptions>(SQLITE3_MODULE_OPTIONS_TOKEN, getSqlite3DynamicRootModuleProperties)
  implements OnApplicationShutdown {
  private readonly logger = new Logger('Sqlite3CoreModule');

  constructor(private readonly moduleRef: ModuleRef) {
    super();
    this.logger.debug('instantiated');
  }

  async onApplicationShutdown(_signal?: string) {
    this.logger.debug('shutdown');
    const connectionManager = this.moduleRef.get(ConnectionManager);
    await connectionManager.closeAllConnectionPools();
    Sqlite3CoreModule.isRegistered = false;
  }
}
