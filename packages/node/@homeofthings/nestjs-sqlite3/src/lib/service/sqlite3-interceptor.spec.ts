/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/order */
import * as mockedConnectionManager from '../test/mocks/connection-manager';

import { Test, TestingModule } from '@nestjs/testing';
import { lastValueFrom, of, throwError } from 'rxjs';

import { ConnectionManager } from './connection-manager';
import { Sqlite3Interceptor } from './sqlite3-interceptor';

describe('Sqlite3Interceptor', () => {
  let appModule: TestingModule;

  beforeEach(async () => {
    mockedConnectionManager.closeConnectionContext.mockReturnValue(Promise.resolve());
    appModule = await Test.createTestingModule({
      providers: [{ provide: ConnectionManager, useValue: new ConnectionManager() }, Sqlite3Interceptor],
    }).compile();
    appModule.enableShutdownHooks();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (appModule) {
      appModule.close();
    }
  });

  it('should open and close context on success', async () => {
    const interceptor = appModule.get(Sqlite3Interceptor);
    expect(interceptor).toBeInstanceOf(Sqlite3Interceptor);

    expect(mockedConnectionManager.createConnectionContext).toHaveBeenCalledTimes(0);
    expect(mockedConnectionManager.closeConnectionContext).toHaveBeenCalledTimes(0);
    const observable$ = await interceptor.intercept({} as any, {
      handle: () => of<any>({}),
    });
    await lastValueFrom(observable$);
    expect(mockedConnectionManager.createConnectionContext).toHaveBeenCalledTimes(1);
    expect(mockedConnectionManager.closeConnectionContext).toHaveBeenCalledTimes(1);
    expect(mockedConnectionManager.closeConnectionContext).toHaveBeenCalledWith(true);
  });

  it('should open and close context on failure', async () => {
    const interceptor = appModule.get(Sqlite3Interceptor);
    expect(interceptor).toBeInstanceOf(Sqlite3Interceptor);

    expect(mockedConnectionManager.createConnectionContext).toHaveBeenCalledTimes(0);
    expect(mockedConnectionManager.closeConnectionContext).toHaveBeenCalledTimes(0);
    const observable$ = await interceptor.intercept({} as any, {
      handle: () => throwError(() => new Error('This is an error!')),
    });
    try {
      await lastValueFrom(observable$);
    } catch (_e) {
      //
    }
    expect(mockedConnectionManager.createConnectionContext).toHaveBeenCalledTimes(1);
    expect(mockedConnectionManager.closeConnectionContext).toHaveBeenCalledTimes(1);
    expect(mockedConnectionManager.closeConnectionContext).toHaveBeenCalledWith(false);
  });
});
