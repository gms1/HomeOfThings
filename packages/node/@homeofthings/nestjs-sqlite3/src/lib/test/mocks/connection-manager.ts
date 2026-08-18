/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';

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

jest.unstable_mockModule('../../service/connection-manager', () => {
  return {
    ConnectionManager,
  };
});

export const mockClear = () => {
  openConnectionPool.mockClear();
  getEntityManager.mockClear();
  createConnectionContext.mockClear();
  closeConnectionContext.mockClear();
  registerTable.mockClear();
};
