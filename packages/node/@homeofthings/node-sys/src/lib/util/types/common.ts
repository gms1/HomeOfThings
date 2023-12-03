/**
 * Object with any (unknown) properties
 */
export interface AnyObject {
  [property: string]: unknown;
}

/**
 * Generic Dictionary
 */
export interface GenericDictionary<T> {
  [property: string]: T;
}

/**
 * Dictionary: { [property: string]: string; }
 */
export interface Dictionary extends GenericDictionary<string> {}
