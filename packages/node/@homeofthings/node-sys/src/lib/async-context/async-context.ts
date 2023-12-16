import { AsyncLocalStorage } from 'async_hooks';

/*
 * Probably the only reason for this little wrapper around AsyncLocalStorage is its experimental status,
 * so that any necessary adjustments can be made more easily
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

  constructor(defaultValue?: T) {
    this._default = defaultValue as T;
  }

  set(value: T) {
    this._storage.enterWith(value);
  }

  get(): T {
    return this._storage.getStore() || this._default;
  }

  run<R, A extends unknown[]>(value: T, callback: (...args: A) => R, ...args: A): R {
    return this._storage.run(value, callback, ...args);
  }
}
