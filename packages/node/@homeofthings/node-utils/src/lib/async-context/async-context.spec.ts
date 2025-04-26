const mockConstructor = jest.fn();
const mockGetStore = jest.fn();
const mockEnterWith = jest.fn();
const mockRun = jest.fn();

jest.mock('async_hooks', () => {
  return {
    AsyncLocalStorage: mockConstructor.mockImplementation(() => {
      return { getStore: mockGetStore, enterWith: mockEnterWith, run: mockRun };
    }),
  };
});

import { AsyncContext } from './async-context';

describe('AsyncContext', () => {
  const givenDefault = 42;
  let asyncContext: AsyncContext<number>;

  beforeEach(() => {
    asyncContext = new AsyncContext(givenDefault);
    mockGetStore.mockClear();
    mockEnterWith.mockClear();
    mockRun.mockClear();
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
    mockGetStore.mockReturnValue(givenStoreValue);
    const value = asyncContext.get();
    expect(value).toBe(givenStoreValue);
  });

  it('should get default value if store is undefined', () => {
    mockGetStore.mockReturnValue(undefined);
    const value = asyncContext.get();
    expect(value).toBe(givenDefault);
  });

  it('should store value', () => {
    const givenStoreValue = 7;
    expect(mockEnterWith).toHaveBeenCalledTimes(0);
    asyncContext.set(givenStoreValue);
    expect(mockEnterWith).toHaveBeenCalledTimes(1);
    expect(mockEnterWith).toHaveBeenCalledWith(givenStoreValue);
  });

  it('should run callback', () => {
    const givenStoreValue = 9;
    const givenCallback = () => ({});
    expect(mockRun).toHaveBeenCalledTimes(0);
    asyncContext.run(givenStoreValue, givenCallback);
    expect(mockRun).toHaveBeenCalledTimes(1);
    expect(mockRun).toHaveBeenCalledWith(givenStoreValue, givenCallback);
  });
});
