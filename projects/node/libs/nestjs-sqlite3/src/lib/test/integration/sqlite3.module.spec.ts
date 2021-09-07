/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import * as mockedLogger from '../mocks/logger';

import { Test, TestingModule } from '@nestjs/testing';
import { field, id, SqlConnectionPool, table } from 'sqlite3orm';
import {
  ConnectionManager,
  EntityManager,
  getConnectionPoolInjectionToken,
  getCustomRepositoryInjectionToken,
  getEntityManagerInjectionToken,
  getRepositoryInjectionToken,
  InjectConnectionPool,
  InjectCustomRepository,
  InjectEntityManager,
  InjectRepository,
  Repository,
  Sqlite3ConnectionOptions,
  Sqlite3Module,
} from '@homeofthings/nestjs-sqlite3';

@table()
class TestEntity1 {
  @id()
  id: number;

  @field()
  data?: string;
}

@table()
class TestEntity2 {
  @id()
  id: number;

  @field()
  data?: string;
}

class TestCustomRepository extends Repository<TestEntity1> {
  constructor(connectionManager: ConnectionManager, private connectionName: string) {
    super(TestEntity1, connectionManager, connectionName);
  }
}

class TestStandardRepositoryService {
  constructor(
    @InjectConnectionPool() public connectionPool: SqlConnectionPool,
    @InjectEntityManager() public entityManager,
    @InjectRepository(TestEntity1) public repository: TestEntity1,
  ) {}
}

class TestCustomRepositoryService {
  constructor(
    @InjectConnectionPool() public connectionPool: SqlConnectionPool,
    @InjectEntityManager() public entityManager,
    @InjectCustomRepository(TestCustomRepository) public repository: TestCustomRepository,
  ) {}
}

describe('Sqlite3Module', () => {
  let appModule: TestingModule;

  const givenDbUrl = 'file:sqlite3.module.spec.db?mode=memory&cache=shared';
  const givenConnectionOptions: Sqlite3ConnectionOptions = {
    file: givenDbUrl,
  };

  afterEach(async () => {
    if (appModule) {
      appModule.close();
    }
    appModule = undefined;
    (ConnectionManager as any)._instance = undefined;
    (ConnectionManager as any).tablesPerConnection = undefined;
  });

  it('for sync options', async () => {
    expect(ConnectionManager.getTables().length).toBe(0);
    appModule = await Test.createTestingModule({
      imports: [Sqlite3Module.register(givenConnectionOptions), Sqlite3Module.forFeature([TestEntity1, TestEntity2])],
      providers: [TestStandardRepositoryService],
    })
      .setLogger(mockedLogger.logger)
      .compile();
    appModule.enableShutdownHooks();

    const connectionManager = appModule.get(ConnectionManager);
    expect(connectionManager).toBeInstanceOf(ConnectionManager);
    expect(connectionManager.getConnectionPool()).toBeInstanceOf(SqlConnectionPool);

    const connectionPool = appModule.get<SqlConnectionPool>(getConnectionPoolInjectionToken());
    expect(connectionPool).toBeInstanceOf(SqlConnectionPool);

    const entityManager = appModule.get<EntityManager>(getEntityManagerInjectionToken());
    expect(entityManager).toBeInstanceOf(EntityManager);

    const repository = appModule.get<Repository<TestEntity1>>(getRepositoryInjectionToken(TestEntity1.name));
    expect(repository).toBeInstanceOf(Repository);

    const service = appModule.get<TestStandardRepositoryService>(TestStandardRepositoryService);
    expect(service).toBeInstanceOf(TestStandardRepositoryService);
    expect(service.connectionPool).toBeInstanceOf(SqlConnectionPool);
    expect(service.entityManager).toBeInstanceOf(EntityManager);
    expect(service.repository).toBeInstanceOf(Repository);

    expect(ConnectionManager.getTables().length).toBe(2);
  });

  it('for async options', async () => {
    expect(ConnectionManager.getTables().length).toBe(0);
    appModule = await Test.createTestingModule({
      imports: [
        Sqlite3Module.registerAsync({
          useFactory: () =>
            new Promise((resolve, _reject) => {
              setTimeout(resolve, 500, givenConnectionOptions);
            }),
        }),
        Sqlite3Module.forFeature([TestCustomRepository, TestEntity2]),
      ],
      providers: [TestCustomRepositoryService],
    })
      .setLogger(mockedLogger.logger)
      .compile();
    appModule.enableShutdownHooks();

    const connectionManager = appModule.get(ConnectionManager);
    expect(connectionManager).toBeInstanceOf(ConnectionManager);
    expect(connectionManager.getConnectionPool()).toBeInstanceOf(SqlConnectionPool);

    const connectionPool = appModule.get<SqlConnectionPool>(getConnectionPoolInjectionToken());
    expect(connectionPool).toBeInstanceOf(SqlConnectionPool);

    const entityManager = appModule.get<EntityManager>(getEntityManagerInjectionToken());
    expect(entityManager).toBeInstanceOf(EntityManager);

    const repository = appModule.get<TestCustomRepository>(getCustomRepositoryInjectionToken(TestCustomRepository.name));
    expect(repository).toBeInstanceOf(TestCustomRepository);

    const service = appModule.get<TestCustomRepositoryService>(TestCustomRepositoryService);
    expect(service).toBeInstanceOf(TestCustomRepositoryService);
    expect(service.connectionPool).toBeInstanceOf(SqlConnectionPool);
    expect(service.entityManager).toBeInstanceOf(EntityManager);
    expect(service.repository).toBeInstanceOf(TestCustomRepository);

    expect(ConnectionManager.getTables().length).toBe(2);
  });
});
