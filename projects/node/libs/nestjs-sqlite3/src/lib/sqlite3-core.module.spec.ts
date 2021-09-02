import { Test, TestingModule } from '@nestjs/testing';
import { SqlConnectionPool, SQL_MEMORY_DB_SHARED } from 'sqlite3orm';
import { Sqlite3CoreModule } from './sqlite3-core.module';
import { ConnectionManager } from './services/connection-manager';
import { Sqlite3ConnectionOptions } from './model';
import { getConnectionPoolInjectionToken, getEntityManagerInjectionToken } from './common/sqlite3.utils';
import { EntityManager } from './services/entity-manager';

describe('Sqlite3CoreModule', () => {
  let appModule: TestingModule;

  const givenConnectionOptions: Sqlite3ConnectionOptions = {
    file: SQL_MEMORY_DB_SHARED,
  };

  beforeEach(() => {
    (ConnectionManager as any)._instance = undefined;
  });

  afterEach(() => {
    if (appModule) {
      appModule.close();
    }
    Sqlite3CoreModule.isRegistered = false;
  });

  it('for sync options', async () => {
    appModule = await Test.createTestingModule({
      imports: [Sqlite3CoreModule.register(Sqlite3CoreModule, givenConnectionOptions)],
    }).compile();
    appModule.enableShutdownHooks();

    const connectionManager = appModule.get(ConnectionManager);
    expect(connectionManager).toBeInstanceOf(ConnectionManager);

    const connectionPool = appModule.get<SqlConnectionPool>(getConnectionPoolInjectionToken());
    expect(connectionPool).toBeInstanceOf(SqlConnectionPool);

    const entityManager = appModule.get<EntityManager>(getEntityManagerInjectionToken());
    expect(entityManager).toBeInstanceOf(EntityManager);
  });

  it('for async options', async () => {
    appModule = await Test.createTestingModule({
      imports: [
        Sqlite3CoreModule.registerAsync(Sqlite3CoreModule, {
          useFactory: () =>
            new Promise((resolve, _reject) => {
              setTimeout(resolve, 500, givenConnectionOptions);
            }),
        }),
      ],
    }).compile();
    appModule.enableShutdownHooks();

    const connectionManager = appModule.get(ConnectionManager);
    expect(connectionManager).toBeInstanceOf(ConnectionManager);

    const connectionPool = appModule.get<SqlConnectionPool>(getConnectionPoolInjectionToken());
    expect(connectionPool).toBeInstanceOf(SqlConnectionPool);

    const entityManager = appModule.get<EntityManager>(getEntityManagerInjectionToken());
    expect(entityManager).toBeInstanceOf(EntityManager);
  });
});
