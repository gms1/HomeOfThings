/* eslint-disable @typescript-eslint/no-explicit-any */

export function isIterable<T>(i: T | Iterable<T>): i is Iterable<T> {
  return i?.[Symbol.iterator];
}
