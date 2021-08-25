/* eslint-disable @typescript-eslint/naming-convention */
const mockedConstructor = jest.fn();
const mockedGetStore = jest.fn();
const mockedEnterWith = jest.fn();
const mockedRun = jest.fn();

jest.mock('async_hooks', () => {
  return {
    AsyncLocalStorage: mockedConstructor.mockImplementation(() => {
      return { getStore: mockedGetStore, enterWith: mockedEnterWith, run: mockedRun };
    }),
  };
});

import { AsyncContext } from './async-context';

describe('AsyncContext', () => {
  const givenDefault = 42;
  let asyncContext: AsyncContext<number>;

  beforeEach(() => {
    asyncContext = new AsyncContext(givenDefault);
    mockedGetStore.mockReset();
    mockedEnterWith.mockReset();
    mockedRun.mockReset();
  });

  it('should get the default value', () => {
    expect(asyncContext.defaultValue).toBe(givenDefault);
  });

  it('should set the default value', () => {
    const givenNewDefaultValue = 99;
    asyncContext.defaultValue = givenNewDefaultValue;
    expect(asyncContext.defaultValue).toBe(givenNewDefaultValue);
  });

  it('should get stored value', () => {
    const givenStoreValue = 3;
    mockedGetStore.mockReturnValue(givenStoreValue);
    const value = asyncContext.get();
    expect(value).toBe(givenStoreValue);
  });

  it('should get default value if store is undefined', () => {
    mockedGetStore.mockReturnValue(undefined);
    const value = asyncContext.get();
    expect(value).toBe(givenDefault);
  });

  it('should store value', () => {
    const givenStoreValue = 7;
    expect(mockedEnterWith).toHaveBeenCalledTimes(0);
    asyncContext.set(givenStoreValue);
    expect(mockedEnterWith).toHaveBeenCalledTimes(1);
    expect(mockedEnterWith).toHaveBeenCalledWith(givenStoreValue);
  });

  it('should run callback', () => {
    const givenStoreValue = 9;
    const givenCallback = () => ({});
    expect(mockedRun).toHaveBeenCalledTimes(0);
    asyncContext.run(givenStoreValue, givenCallback);
    expect(mockedRun).toHaveBeenCalledTimes(1);
    expect(mockedRun).toHaveBeenCalledWith(givenStoreValue, givenCallback);
  });
});
