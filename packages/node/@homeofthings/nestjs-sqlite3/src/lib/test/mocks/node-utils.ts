/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';

export const asyncContext = jest.fn();
export const asyncContextGet = jest.fn();
export const asyncContextSet = jest.fn();

// AsyncContext constructor:
const AsyncContext: any = asyncContext.mockImplementation(() => {
  return { get: asyncContextGet, set: asyncContextSet };
});

jest.unstable_mockModule('@homeofthings/node-utils', () => {
  return {
    AsyncContext,
  };
});

export const mockClear = () => {
  asyncContextGet.mockClear();
  asyncContextSet.mockClear();
};
