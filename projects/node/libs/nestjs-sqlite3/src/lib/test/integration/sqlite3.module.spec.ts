/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import * as mockedLogger from '../mocks/logger';

import { Test, TestingModule } from '@nestjs/testing';
import { SqlConnectionPool } from 'sqlite3orm';
import {
  ConnectionManager,
  EntityManager,
  getConnectionPoolInjectionToken,
  getCustomRepositoryInjectionToken,
  getEntityManagerInjectionToken,
  getRepositoryInjectionToken,
  InjectConnectionPool,
  InjectCustomRepository,
  InjectRepository,
  Repository,
  Sqlite3ConnectionOptions,
  Sqlite3Module,
} from '@homeofthings/nestjs-sqlite3';
import { User } from './fixtures/entity/user';
import { Contact } from './fixtures/entity/contact';
import { UserRepository } from './fixtures/repository/user.repository';
import { ContactRepositoryService } from './fixtures/service/contact.repository.service';
import { UserRepositoryService } from './fixtures/service/user.repository.service';

class ExtendedContactRepositoryService extends ContactRepositoryService {
  constructor(@InjectConnectionPool() public sqlConnectionPool: SqlConnectionPool, @InjectRepository(Contact) repository: Repository<Contact>) {
    super(repository);
  }
}

class ExtendedUserRepositoryService extends UserRepositoryService {
  constructor(@InjectConnectionPool() public sqlConnectionPool: SqlConnectionPool, @InjectCustomRepository(UserRepository) repository: UserRepository) {
    super(repository);
  }
}

describe('Sqlite3Module-Integration', () => {
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
      imports: [Sqlite3Module.register(givenConnectionOptions), Sqlite3Module.forFeature([User, Contact])],
      providers: [ExtendedContactRepositoryService],
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

    const repository = appModule.get<Repository<User>>(getRepositoryInjectionToken(User.name));
    expect(repository).toBeInstanceOf(Repository);

    const service = appModule.get<ExtendedContactRepositoryService>(ExtendedContactRepositoryService);
    expect(service).toBeInstanceOf(ExtendedContactRepositoryService);
    expect(service.sqlConnectionPool).toBeInstanceOf(SqlConnectionPool);
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
        Sqlite3Module.forFeature([UserRepository, Contact]),
      ],
      providers: [ExtendedUserRepositoryService],
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

    const repository = appModule.get<UserRepository>(getCustomRepositoryInjectionToken(UserRepository.name));
    expect(repository).toBeInstanceOf(UserRepository);

    const service = appModule.get<ExtendedUserRepositoryService>(ExtendedUserRepositoryService);
    expect(service).toBeInstanceOf(ExtendedUserRepositoryService);
    expect(service.sqlConnectionPool).toBeInstanceOf(SqlConnectionPool);
    expect(service.repository).toBeInstanceOf(UserRepository);

    expect(ConnectionManager.getTables().length).toBe(2);
  });
});
