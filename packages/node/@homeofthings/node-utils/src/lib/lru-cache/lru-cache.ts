/* eslint-disable @typescript-eslint/no-unused-vars */

export class LruCache<T, K = string> {
  // NOTE: javascript Map remembers the original insertion order
  private _map: Map<K, T> = new Map<K, T>();

  get maxEntries(): number {
    return this._maxEntries;
  }

  set maxEntries(newMaxEntries: number) {
    this._maxEntries = Math.max(newMaxEntries, 0);
    this.resize(this._maxEntries);
  }

  get size(): number {
    return this._map.size;
  }

  constructor(private _maxEntries = 20) {}

  get(key: K): T {
    let item: T = undefined as T;
    if (this._map.has(key)) {
      // mark item as least recently used
      item = this._map.get(key) as T;
      this._map.delete(key);
      this._map.set(key, item);
    }

    return item;
  }

  set(key: K, item: T) {
    if (!this.delete(key)) {
      this.resize(this._maxEntries - 1);
    }
    this.onInsert(item);
    this._map.set(key, item);
  }

  has(key: K): boolean {
    return this._map.has(key);
  }

  delete(key: K): boolean {
    const item: T = this._map.get(key) as T;
    if (item) {
      this.onDelete(item);
    }
    return this._map.delete(key);
  }

  protected onInsert(_item: T) {}
  protected onDelete(_item: T) {}

  private resize(newSize: number): void {
    while (this._map.size > newSize) {
      this.delete(this._map.keys().next().value as K);
    }
  }
}
