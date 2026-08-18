/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';

export const sqlConnectionPool = jest.fn();
export const sqlConnectionPoolOpen = jest.fn();
export const sqlConnectionPoolClose = jest.fn();
export const sqlConnectionPoolGet = jest.fn();
export const sqlDatabase = jest.fn();
export const sqlDatabaseEndTransaction = jest.fn();
export const sqlDatabaseClose = jest.fn();

// SqlConnectionPool constructor:
const SqlConnectionPool: any = sqlConnectionPool.mockImplementation(() => {
  return {
    open: sqlConnectionPoolOpen,
    close: sqlConnectionPoolClose,
    get: sqlConnectionPoolGet,
  };
});

// SqlDatabase constructor:
const SqlDatabase: any = sqlDatabase.mockImplementation(() => {
  return { close: sqlDatabaseClose, endTransaction: sqlDatabaseEndTransaction };
});

// Mock BaseDAO class
const BaseDAO: any = jest.fn().mockImplementation(() => {
  return {};
});
BaseDAO.options = {};

// Mock Table decorator and helper
const Table: any = jest.fn();

// Mock SQL_OPEN_DEFAULT_URI constant
const SQL_OPEN_DEFAULT_URI = 68;

jest.unstable_mockModule('sqlite3orm', () => {
  return {
    SqlConnectionPool,
    SqlDatabase,
    BaseDAO,
    BaseDAOInsertMode: { ForceAutoGeneration: 0, EmptyIsNull: 1 },
    Table,
    SQL_OPEN_DEFAULT_URI,
    METADATA_MODEL_KEY: '__metadata_model__',
    MetaModel: jest.fn(),
    Where: jest.fn(),
    Filter: jest.fn(),
  };
});

export const mockClear = () => {
  sqlConnectionPoolOpen.mockClear();
  sqlConnectionPoolClose.mockClear();
  sqlConnectionPoolGet.mockClear();
  sqlDatabaseEndTransaction.mockClear();
  sqlDatabaseClose.mockClear();
};
