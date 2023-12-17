// see https://github.com/sindresorhus/type-fest for more types
export type { Constructor, JsonValue, Primitive } from 'type-fest';

/**
 * Generic Dictionary
 */
export type GenericDictionary<T> = Record<string, T>;

/**
 * Dictionary: { [property: string]: string; }
 */
export type Dictionary = GenericDictionary<string>;

/**
 * AnyObject with any (unknown) properties
 */
export type AnyObject = GenericDictionary<unknown>;
