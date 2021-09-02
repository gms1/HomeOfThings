/* eslint-disable @typescript-eslint/naming-convention */

const mockAsyncContextConstructor = jest.fn();
const mockAsyncContextGet = jest.fn();
const mockAsyncContextSet = jest.fn();

jest.mock('@homeofthings/nestjs-utils', () => {
  return {
    AsyncContext: mockAsyncContextConstructor.mockImplementation(() => {
      return { get: mockAsyncContextGet, set: mockAsyncContextSet };
    }),
  };
});

const mockSqlConnectionPoolConstructor = jest.fn();
const mockSqlConnectionPoolOpen = jest.fn();
const mockSqlConnectionPoolClose = jest.fn();
const mockSqlDatabaseConstructor = jest.fn();
const mockSqlDatabaseClose = jest.fn();

jest.mock('sqlite3orm', () => {
  return {
    SqlConnectionPool: mockSqlConnectionPoolConstructor.mockImplementation(() => {
      return { open: mockSqlConnectionPoolOpen, close: mockSqlConnectionPoolClose };
    }),

    SqlDatabase: mockSqlDatabaseConstructor.mockImplementation(() => {
      return { close: mockSqlDatabaseClose };
    }),
  };
});

import { ConnectionManager } from './connection-manager';
import { SqlDatabase } from 'sqlite3orm';
import { Test } from '@nestjs/testing';
import { Sqlite3ConnectionOptions } from '../model';

describe('ConnectionManager', () => {
  const givenConnectionName = 'test';
  let connectionManager: ConnectionManager;

  beforeEach(async () => {
    (ConnectionManager as any)._instance = undefined;
    const module = await Test.createTestingModule({ providers: [{ provide: ConnectionManager, useValue: ConnectionManager.getInstance() }] })
      .setLogger({ log: jest.fn(), warn: jest.fn(), error: jest.fn() })
      .compile();
    connectionManager = module.get(ConnectionManager);
  });

  afterEach(() => {
    mockAsyncContextGet.mockReset();
    mockAsyncContextSet.mockReset();
    mockSqlConnectionPoolOpen.mockReset();
    mockSqlConnectionPoolClose.mockReset();
    mockSqlDatabaseClose.mockReset();
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
        await connectionManager.openConnectionPool(givenConnectionName, { file: '' });
      } catch (_e) {
        return;
      }
      fail('should have thrown');
    });

    it('should fail if opening connection pool failed', async () => {
      const givenConnectionOptions: Sqlite3ConnectionOptions = { file: 'should not open' };
      mockSqlConnectionPoolOpen.mockReturnValue(Promise.reject('this open should fail'));
      try {
        await connectionManager.openConnectionPool(givenConnectionName, givenConnectionOptions);
      } catch (_e) {
        expect(mockSqlConnectionPoolOpen).toHaveBeenCalledTimes(1);
        return;
      }
      fail('should have thrown');
    });

    it('should succeed if open connection pool succeeded', async () => {
      const givenConnectionOptions: Sqlite3ConnectionOptions = { file: 'should open' };
      mockSqlConnectionPoolOpen.mockReturnValue(Promise.resolve('this open should succeed'));
      await connectionManager.openConnectionPool(givenConnectionName, givenConnectionOptions);
      expect(mockSqlConnectionPoolOpen).toHaveBeenCalledTimes(1);
    });

    it('should fail to open connection twice', async () => {
      const givenConnectionOptions: Sqlite3ConnectionOptions = { file: 'should open' };
      mockSqlConnectionPoolOpen.mockReturnValue(Promise.resolve('this open should succeed'));
      await connectionManager.openConnectionPool(givenConnectionName, givenConnectionOptions);
      expect(mockSqlConnectionPoolOpen).toHaveBeenCalledTimes(1);
      try {
        await connectionManager.openConnectionPool(givenConnectionName, givenConnectionOptions);
      } catch (_e) {
        expect(mockSqlConnectionPoolOpen).toHaveBeenCalledTimes(1);
        return;
      }
      fail('should have thrown');
    });
  });

  describe('connection context', () => {
    it('should open connections context', () => {
      connectionManager.openConnectionsContext();
      expect(mockAsyncContextGet).toBeCalledTimes(1);
      expect(mockAsyncContextSet).toBeCalledTimes(1);
      expect(mockAsyncContextSet).toHaveBeenCalledWith({});
    });

    it('should open connections context multiple times', () => {
      connectionManager.openConnectionsContext();
      expect(mockAsyncContextSet).toHaveBeenCalledWith({});
      mockAsyncContextGet.mockReturnValue({ test: true });
      connectionManager.openConnectionsContext();
      expect(mockAsyncContextGet).toBeCalledTimes(2);
      expect(mockAsyncContextSet).toBeCalledTimes(2);
      connectionManager.openConnectionsContext();
      expect(mockAsyncContextGet).toBeCalledTimes(3);
      expect(mockAsyncContextSet).toBeCalledTimes(3);
    });

    it('should close connection context', () => {
      mockAsyncContextGet.mockReturnValue({ test: new SqlDatabase() });
      mockSqlDatabaseClose.mockReturnValue(Promise.resolve());
      connectionManager.closeConnectionsContext(true);
      expect(mockSqlDatabaseClose).toBeCalledTimes(1);
    });
  });
});
