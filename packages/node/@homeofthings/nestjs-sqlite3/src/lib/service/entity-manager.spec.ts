/* eslint-disable import/order */
import * as mockedLogger from '../test/mocks/logger';

import { Test } from '@nestjs/testing';
import { Column, Entity, PrimaryKeyColumn } from '../common/sqlite3.decorators';
import { getEntityManagerInjectionToken } from '../common/sqlite3.utils';
import { SQLITE3_DEFAULT_CONNECTION_NAME } from '../model';

import { ConnectionManager } from './connection-manager';
import { EntityManager } from './entity-manager';
import { Repository } from './repository';

// NOTE: make sure all branches are covered by these unit tests and all methods are covered by integration tests (see test/integration folder)
// so that there is no need to fully unit-test all methods here

@Entity()
class TestEntity {
  @PrimaryKeyColumn()
  id: number;

  @Column()
  data?: string;
}
class TestNoEntity {
  data?: string;
}

describe('EntityManager', () => {
  let entityManager: EntityManager;

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

    entityManager = module.get<EntityManager>(getEntityManagerInjectionToken());
    expect(entityManager).toBeInstanceOf(EntityManager);
    jest.clearAllMocks();
  });

  afterEach(() => {
    entityManager = undefined;
  });

  it('`getRepository` should throw if prototype of given entity has no table-definition', async () => {
    try {
      await entityManager.getRepository(TestNoEntity);
    } catch (_e) {
      expect(_e.message).toContain('prototype of TestNoEntity');
      return;
    }
    fail('should have thrown');
  });

  it('`getRepository` should succeed if prototype of given entity has table-definition', async () => {
    let repository: Repository<TestEntity>;
    try {
      repository = await entityManager.getRepository(TestEntity);
    } catch (_e) {
      fail('should not thrown');
    }
    expect(repository).toBeInstanceOf(Repository);
  });
});
