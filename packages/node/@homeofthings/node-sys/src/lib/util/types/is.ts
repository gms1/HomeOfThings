/* eslint-disable @typescript-eslint/no-explicit-any */

export function isIterable(o: any): boolean {
  return o?.[Symbol.iterator];
}
