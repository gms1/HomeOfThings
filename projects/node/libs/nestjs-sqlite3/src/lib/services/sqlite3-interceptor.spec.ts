/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
const mockConstructor = jest.fn();
const mockOpenConnectionsContext = jest.fn();
const mockCloseConnectionsContext = jest.fn();

jest.mock('./connection-manager', () => {
  return {
    ConnectionManager: mockConstructor.mockImplementation(() => {
      return { openConnectionsContext: mockOpenConnectionsContext, closeConnectionsContext: mockCloseConnectionsContext };
    }),
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionManager } from './connection-manager';
import { Sqlite3Interceptor } from './sqlite3-interceptor';
import { lastValueFrom, of, throwError } from 'rxjs';

describe('Sqlite3Interceptor', () => {
  let appModule: TestingModule;

  beforeEach(async () => {
    mockOpenConnectionsContext.mockReset();
    mockCloseConnectionsContext.mockReset();
    appModule = await Test.createTestingModule({ providers: [{ provide: ConnectionManager, useValue: new ConnectionManager() }, Sqlite3Interceptor] }).compile();
  });

  afterEach(() => {
    if (appModule) {
      appModule.close();
    }
  });

  it('should open and close context on success', async () => {
    const interceptor = appModule.get(Sqlite3Interceptor);
    expect(interceptor).toBeInstanceOf(Sqlite3Interceptor);

    expect(mockOpenConnectionsContext).toHaveBeenCalledTimes(0);
    expect(mockCloseConnectionsContext).toHaveBeenCalledTimes(0);
    const observable$ = await interceptor.intercept({} as any, { handle: () => of<any>({}) });
    await lastValueFrom(observable$);
    expect(mockOpenConnectionsContext).toHaveBeenCalledTimes(1);
    expect(mockCloseConnectionsContext).toHaveBeenCalledTimes(1);
    expect(mockCloseConnectionsContext).toHaveBeenCalledWith(true);
  });

  it('should open and close context on failure', async () => {
    const interceptor = appModule.get(Sqlite3Interceptor);
    expect(interceptor).toBeInstanceOf(Sqlite3Interceptor);

    expect(mockOpenConnectionsContext).toHaveBeenCalledTimes(0);
    expect(mockCloseConnectionsContext).toHaveBeenCalledTimes(0);
    const observable$ = await interceptor.intercept({} as any, { handle: () => throwError(() => new Error('This is an error!')) });
    try {
      await lastValueFrom(observable$);
    } catch (_e) {
      //
    }
    expect(mockOpenConnectionsContext).toHaveBeenCalledTimes(1);
    expect(mockCloseConnectionsContext).toHaveBeenCalledTimes(1);
    expect(mockCloseConnectionsContext).toHaveBeenCalledWith(false);
  });
});
