export class LruCache<T> {
  private _map: Map<string, T> = new Map<string, T>();

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

  get(key: string): T {
    let item: T;
    if (this._map.has(key)) {
      // mark item as least recently used
      item = this._map.get(key);
      this._map.delete(key);
      this._map.set(key, item);
    }

    return item;
  }

  set(key: string, value: T) {
    if (!this._map.delete(key)) {
      this.resize(this._maxEntries - 1);
    }
    this._map.set(key, value);
  }

  has(key: string): boolean {
    return this._map.has(key);
  }

  delete(key: string): boolean {
    return this._map.delete(key);
  }

  private resize(newSize: number): void {
    while (this._map.size > newSize) {
      this._map.delete(this._map.keys().next().value);
    }
  }
}
