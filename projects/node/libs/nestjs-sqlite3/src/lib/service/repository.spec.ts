import * as mockedConnectionManager from '../test/mocks/connection-manager';
import * as mockedLogger from '../test/mocks/logger';

import { getEntityManagerInjectionToken } from '../common/sqlite3.utils';
import { SQLITE3_DEFAULT_CONNECTION_NAME } from '../model';
import { ConnectionManager } from './connection-manager';
import { EntityManager } from './entity-manager';
import { Test } from '@nestjs/testing';
import { field, id, table } from 'sqlite3orm';
import { Repository } from './repository';

// NOTE: make sure all branches are covered by these unit tests and all methods are covered by integration tests (see test/integration folder)
// so that there is no need to fully unit-test all methods here

@table()
class TestEntity {
  @id()
  id: number;

  @field()
  data?: string;
}

describe('Repository', () => {
  let repository: Repository<TestEntity>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: ConnectionManager, useValue: new ConnectionManager() },
        {
          provide: getEntityManagerInjectionToken(),
          useFactory: (connectionManager: ConnectionManager) => new EntityManager(connectionManager, SQLITE3_DEFAULT_CONNECTION_NAME),
          inject: [ConnectionManager],
        },
      ],
    })
      .setLogger(mockedLogger.logger)
      .compile();

    const entityManager = module.get<EntityManager>(getEntityManagerInjectionToken());
    expect(entityManager).toBeInstanceOf(EntityManager);
    repository = await entityManager.getRepository(TestEntity);
  });

  afterEach(() => {
    repository = undefined;
    mockedConnectionManager.mockReset();
  });

  it('should be instance of Repository', async () => {
    expect(repository).toBeInstanceOf(Repository);
  });
});
