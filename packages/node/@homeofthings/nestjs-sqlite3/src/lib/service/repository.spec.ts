/* eslint-disable simple-import-sort/imports */
import { jest } from '@jest/globals';

import * as mockedLogger from '../test/mocks/logger';
/* eslint-enable simple-import-sort/imports */

import { Test } from '@nestjs/testing';

import { Column, Entity, PrimaryKeyColumn } from '../common/sqlite3.decorators';
import { getEntityManagerInjectionToken } from '../common/sqlite3.utils';
import { SQLITE3_DEFAULT_CONNECTION_NAME } from '../model';

// Dynamic imports for modules that depend on mocked modules
const { ConnectionManager } = await import('./connection-manager');
const { EntityManager } = await import('./entity-manager');
const { Repository } = await import('./repository');

// NOTE: make sure all branches are covered by unit tests and all methods are covered by integration tests (see test/integration folder)
// so that there is no need to fully unit-test all branches/methods here

@Entity()
class TestEntity {
  @PrimaryKeyColumn()
  id: number;

  @Column()
  data?: string;
}

describe('Repository', () => {
  let repository: InstanceType<typeof Repository<TestEntity>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: ConnectionManager, useValue: new ConnectionManager() },
        {
          provide: getEntityManagerInjectionToken(),
          useFactory: (connectionManager: InstanceType<typeof ConnectionManager>) => new EntityManager(connectionManager, SQLITE3_DEFAULT_CONNECTION_NAME),
          inject: [ConnectionManager],
        },
      ],
    })
      .setLogger(mockedLogger.logger)
      .compile();

    const entityManager = module.get<InstanceType<typeof EntityManager>>(getEntityManagerInjectionToken());
    expect(entityManager).toBeInstanceOf(EntityManager);
    repository = await entityManager.getRepository(TestEntity);
    jest.clearAllMocks();
  });

  afterEach(() => {
    repository = undefined;
  });

  it('should be instance of Repository', async () => {
    expect(repository).toBeInstanceOf(Repository);
  });
});
