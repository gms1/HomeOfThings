/* eslint-disable @typescript-eslint/no-explicit-any */

export const asyncContext = jest.fn();
export const asyncContextGet = jest.fn();
export const asyncContextSet = jest.fn();

// AsyncContext constructor:
const AsyncContext: any = asyncContext.mockImplementation(() => {
  return { get: asyncContextGet, set: asyncContextSet };
});

jest.mock('@homeofthings/node-utils', () => {
  return {
    AsyncContext,
  };
});

export const mockClear = () => {
  asyncContextGet.mockClear();
  asyncContextSet.mockClear();
};
