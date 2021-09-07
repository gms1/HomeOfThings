/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
export const connectionManager = jest.fn();
export const openConnectionPool = jest.fn();
export const getEntityManager = jest.fn();
export const createConnectionContext = jest.fn();
export const closeConnectionContext = jest.fn();
export const registerTable = jest.fn();

// ConnectionManager constructor:
const ConnectionManager: any = connectionManager.mockImplementation(() => {
  return {
    openConnectionPool,
    getEntityManager,
    createConnectionContext,
    closeConnectionContext,
  };
});

// ConnectionManager static methods:
ConnectionManager.registerTable = registerTable;

jest.mock('../service/connection-manager', () => {
  return {
    ConnectionManager,
  };
});

export const mockReset = () => {
  openConnectionPool.mockReset();
  getEntityManager.mockReset();
  createConnectionContext.mockReset();
  closeConnectionContext.mockReset();
  registerTable.mockReset();
};
