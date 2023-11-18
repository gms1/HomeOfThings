/* eslint-disable @typescript-eslint/no-explicit-any */

export { Type } from '@nestjs/common';

// see https://github.com/sindresorhus/type-fest for more types
export type { Constructor, JsonValue, Primitive } from 'type-fest';

export type GenericDictionary<T> = Record<string, T>;

export type Dictionary = GenericDictionary<string>;
export type AnyObject = GenericDictionary<unknown>;
