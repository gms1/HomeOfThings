import { Test, TestingModule } from '@nestjs/testing';
import { SqlConnectionPool, SQL_MEMORY_DB_SHARED } from 'sqlite3orm';
import { Sqlite3Module } from './sqlite3.module';
import { ConnectionManager } from './services/connection-manager';
import { Sqlite3ConnectionOptions } from './model';
import { getConnectionPoolInjectionToken } from './common/sqlite3.utils';

describe('Sqlite3Module', () => {
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
  });

  it('for sync options', async () => {
    appModule = await Test.createTestingModule({
      imports: [Sqlite3Module.register(givenConnectionOptions)],
    }).compile();
    appModule.enableShutdownHooks();

    const connectionManager = appModule.get(ConnectionManager);
    expect(connectionManager).toBeInstanceOf(ConnectionManager);

    const connectionPool = appModule.get<SqlConnectionPool>(getConnectionPoolInjectionToken());
    expect(connectionPool).toBeInstanceOf(SqlConnectionPool);
  });

  it('for async options', async () => {
    expect((ConnectionManager as any)._instance).toBeUndefined();
    appModule = await Test.createTestingModule({
      imports: [
        Sqlite3Module.registerAsync({
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
  });
});
