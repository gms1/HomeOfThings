/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/order */

import * as mockedLogger from '../test/mocks/logger';
import * as mockedNestUtils from '../test/mocks/node-sys';
import * as mockedSqlite3Orm from '../test/mocks/sqlite3orm';

import { Test } from '@nestjs/testing';
import { SqlDatabase } from 'sqlite3orm';

import { Sqlite3ConnectionOptions, SQLITE3_DEFAULT_CONNECTION_NAME } from '../model';
import { ConnectionManager } from './connection-manager';

describe('ConnectionManager', () => {
  const givenConnectionName = 'test';
  let connectionManager: ConnectionManager;

  beforeEach(async () => {
    (ConnectionManager as any)._instance = undefined;
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ConnectionManager,
          useValue: ConnectionManager.getInstance(),
        },
      ],
    })
      .setLogger(mockedLogger.logger)
      .compile();
    connectionManager = module.get(ConnectionManager);
    jest.clearAllMocks();
  });

  describe('instantiation', () => {
    it('should throw if instantiated twice', () => {
      try {
        new ConnectionManager();
      } catch (_e) {
        return;
      }
      fail('should have thrown');
    });

    it('should be a singleton', () => {
      expect(ConnectionManager.getInstance()).toBe(connectionManager);
    });
  });

  describe('connection pool', () => {
    it('should fail to open connection having falsy file property', async () => {
      try {
        await connectionManager.openConnectionPool(givenConnectionName, {
          file: '',
        });
      } catch (_e) {
        return;
      }
      fail('should have thrown');
    });

    it('should fail if opening connection pool failed', async () => {
      const givenConnectionOptions: Sqlite3ConnectionOptions = {
        file: 'should not open',
      };
      mockedSqlite3Orm.sqlConnectionPoolOpen.mockReturnValue(Promise.reject('this open should fail'));
      try {
        await connectionManager.openConnectionPool(givenConnectionName, givenConnectionOptions);
      } catch (_e) {
        expect(mockedSqlite3Orm.sqlConnectionPoolOpen).toHaveBeenCalledTimes(1);
        return;
      }
      fail('should have thrown');
    });

    it('should succeed opening connection pool', async () => {
      const givenConnectionOptions: Sqlite3ConnectionOptions = {
        file: 'should open',
      };
      mockedSqlite3Orm.sqlConnectionPoolOpen.mockReturnValue(Promise.resolve('this open should succeed'));
      await connectionManager.openConnectionPool(givenConnectionName, givenConnectionOptions);
      expect(mockedSqlite3Orm.sqlConnectionPoolOpen).toHaveBeenCalledTimes(1);
      expect(connectionManager.getConnectionPool(givenConnectionName)).toBeTruthy();
    });

    it('should fail to open connection pool twice', async () => {
      const givenConnectionOptions: Sqlite3ConnectionOptions = {
        file: 'should open',
      };
      mockedSqlite3Orm.sqlConnectionPoolOpen.mockReturnValue(Promise.resolve('this open should succeed'));
      await connectionManager.openConnectionPool(givenConnectionName, givenConnectionOptions);
      expect(mockedSqlite3Orm.sqlConnectionPoolOpen).toHaveBeenCalledTimes(1);
      try {
        await connectionManager.openConnectionPool(givenConnectionName, givenConnectionOptions);
      } catch (_e) {
        expect(mockedSqlite3Orm.sqlConnectionPoolOpen).toHaveBeenCalledTimes(1);
        return;
      }
      fail('should have thrown');
    });

    it('should fail to get undefined connection pool', () => {
      try {
        connectionManager.getConnectionPool('unknown connection name');
      } catch (_e) {
        return;
      }
      fail('should have thrown');
    });
  });

  describe('connection context', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should open connections context', async () => {
      await connectionManager.createConnectionContext();
      expect(mockedNestUtils.asyncContextGet).toBeCalledTimes(1);
      expect(mockedNestUtils.asyncContextSet).toBeCalledTimes(1);
      expect(mockedNestUtils.asyncContextSet).toHaveBeenCalledWith({});
    });

    it('should open connections context multiple times', async () => {
      await connectionManager.createConnectionContext();
      expect(mockedNestUtils.asyncContextSet).toHaveBeenCalledWith({});
      mockedNestUtils.asyncContextGet.mockReturnValue({ test: true });
      await connectionManager.createConnectionContext();
      expect(mockedNestUtils.asyncContextGet).toBeCalledTimes(2);
      expect(mockedNestUtils.asyncContextSet).toBeCalledTimes(2);
      await connectionManager.createConnectionContext();
      expect(mockedNestUtils.asyncContextGet).toBeCalledTimes(3);
      expect(mockedNestUtils.asyncContextSet).toBeCalledTimes(3);
    });

    it('should close connection context (commit=true)', async () => {
      mockedNestUtils.asyncContextGet.mockReturnValue({
        test: new SqlDatabase(),
      });
      mockedSqlite3Orm.sqlDatabaseClose.mockReturnValue(Promise.resolve());
      await connectionManager.closeConnectionContext(true);
      expect(mockedSqlite3Orm.sqlDatabaseClose).toBeCalledTimes(1);
    });

    it('should close connection context (commit=false)', async () => {
      mockedNestUtils.asyncContextGet.mockReturnValue({
        test: new SqlDatabase(),
      });
      mockedSqlite3Orm.sqlDatabaseClose.mockReturnValue(Promise.resolve());
      await connectionManager.closeConnectionContext(false);
      expect(mockedSqlite3Orm.sqlDatabaseClose).toBeCalledTimes(1);
    });

    it('`getConnection` should fail outside of connection context', async () => {
      mockedNestUtils.asyncContextGet.mockReturnValue(undefined);
      try {
        await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
        fail('should have thrown');
      } catch (_e) {}
    });

    it('`getConnection` should succeed opening connection', async () => {
      const givenConnectionOptions: Sqlite3ConnectionOptions = {
        file: 'should open',
      };
      mockedSqlite3Orm.sqlConnectionPoolOpen.mockReturnValue(Promise.resolve('this open should succeed'));
      mockedSqlite3Orm.sqlConnectionPoolGet.mockReturnValue(Promise.resolve());
      await connectionManager.openConnectionPool(givenConnectionName, givenConnectionOptions);
      expect(mockedSqlite3Orm.sqlConnectionPoolOpen).toHaveBeenCalledTimes(1);
      mockedNestUtils.asyncContextGet.mockReturnValue({});
      try {
        await connectionManager.getConnection(givenConnectionName);
      } catch (_e) {
        console.log(_e.message, _e);
        fail('should not throw');
      }
    });

    it('`getConnection` should succeed inside of connection context if connection already open', async () => {
      const givenConnection = new SqlDatabase();
      mockedNestUtils.asyncContextGet.mockReturnValue({
        test: givenConnection,
      });
      let conn: SqlDatabase | undefined;
      try {
        conn = await connectionManager.getConnection(givenConnectionName);
      } catch (_e) {
        fail('should not throw');
      }
      expect(conn).toBe(givenConnection);
    });

    it('`getConnection` should fail for undefined connection name', async () => {
      const givenConnection = new SqlDatabase();
      mockedNestUtils.asyncContextGet.mockReturnValue({
        test: givenConnection,
      });
      try {
        await connectionManager.getConnection('undefined connection name');
      } catch (_e) {
        return;
      }
      fail('should have thrown');
    });
  });
});
