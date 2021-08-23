import { Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SQL_MEMORY_DB_SHARED } from 'sqlite3orm';
import { Sqlite3ModuleOptions } from './model';
import { Sqlite3CoreModule } from './sqlite3-core.module';
import { ConnectionManagerService } from './services/connection-manager.service';

describe('Sqlite3CoreModule', function() {
  let appModule: TestingModule;

  @Module({})
  class ChildModule {
    static connectionManager: ConnectionManagerService;

    constructor(connectionManager: ConnectionManagerService) {
      ChildModule.connectionManager = connectionManager;
    }
  }

  const givenOptions: Sqlite3ModuleOptions = {
    file: SQL_MEMORY_DB_SHARED,
  };

  beforeEach(() => {
    ChildModule.connectionManager = undefined;
  });

  afterEach(() => {
    if (appModule) {
      appModule.close();
    }
  });

  it('for sync options', async function() {
    appModule = await Test.createTestingModule({
      imports: [Sqlite3CoreModule.forRoot(Sqlite3CoreModule, givenOptions), ChildModule],
    }).compile();
    appModule.enableShutdownHooks();
    const connectionManager = appModule.get(ConnectionManagerService);
    expect(connectionManager).toBeInstanceOf(ConnectionManagerService);

    expect(ChildModule.connectionManager).toBe(connectionManager);
  });

  it('for async options', async function() {
    appModule = await Test.createTestingModule({
      imports: [
        Sqlite3CoreModule.forRootAsync(Sqlite3CoreModule, {
          useFactory: () =>
            new Promise((resolve, _reject) => {
              setTimeout(resolve, 500, [givenOptions, givenOptions]);
            }),
        }),
        ChildModule,
      ],
    }).compile();

    const connectionManager = appModule.get(ConnectionManagerService);
    expect(connectionManager).toBeInstanceOf(ConnectionManagerService);

    expect(ChildModule.connectionManager).toBe(connectionManager);
  });
});
