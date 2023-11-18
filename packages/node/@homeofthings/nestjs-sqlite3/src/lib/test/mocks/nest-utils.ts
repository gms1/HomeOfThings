/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
export const asyncContext = jest.fn();
export const asyncContextGet = jest.fn();
export const asyncContextSet = jest.fn();

// AsyncContext constructor:
const AsyncContext: any = asyncContext.mockImplementation(() => {
  return { get: asyncContextGet, set: asyncContextSet };
});

jest.mock('@homeofthings/nestjs-utils', () => {
  return {
    AsyncContext,
  };
});

export const mockClear = () => {
  asyncContextGet.mockClear();
  asyncContextSet.mockClear();
};
