/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
export const sqlConnectionPool = jest.fn();
export const sqlConnectionPoolOpen = jest.fn();
export const sqlConnectionPoolClose = jest.fn();
export const sqlConnectionPoolGet = jest.fn();
export const sqlDatabase = jest.fn();
export const sqlDatabaseEndTransaction = jest.fn();
export const sqlDatabaseClose = jest.fn();

// SqlConnectionPool constructor:
const SqlConnectionPool: any = sqlConnectionPool.mockImplementation(() => {
  return { open: sqlConnectionPoolOpen, close: sqlConnectionPoolClose, get: sqlConnectionPoolGet };
});

// SqlDatabase constructor:
const SqlDatabase: any = sqlDatabase.mockImplementation(() => {
  return { close: sqlDatabaseClose, endTransaction: sqlDatabaseEndTransaction };
});

jest.mock('sqlite3orm', () => {
  return {
    SqlConnectionPool,
    SqlDatabase,
  };
});

export const mockClear = () => {
  sqlConnectionPoolOpen.mockClear();
  sqlConnectionPoolClose.mockClear();
  sqlConnectionPoolGet.mockClear();
  sqlDatabaseEndTransaction.mockClear();
  sqlDatabaseClose.mockClear();
};
