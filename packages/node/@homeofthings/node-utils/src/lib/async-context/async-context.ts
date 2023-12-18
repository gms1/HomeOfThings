import { AsyncLocalStorage } from 'async_hooks';

/*
 * little wrapper around AsyncLocalStorage which currently has an experimental status
 * adds a default value
 */

export class AsyncContext<T> {
  private readonly _storage = new AsyncLocalStorage<T>();

  private _default: T;

  get defaultValue(): T {
    return this._default;
  }

  set defaultValue(value: T) {
    this._default = value;
  }

  constructor(defaultValue: T) {
    this._default = defaultValue;
  }

  set(value: T) {
    this._storage.enterWith(value);
  }

  get(): T {
    return this._storage.getStore() ?? this._default;
  }

  run<R, A extends unknown[]>(value: T, callback: (...args: A) => R, ...args: A): R {
    return this._storage.run(value, callback, ...args);
  }
}
