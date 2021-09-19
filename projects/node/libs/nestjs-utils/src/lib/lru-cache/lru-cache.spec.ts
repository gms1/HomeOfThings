import { LruCache } from './lru-cache';

describe('LruCache', () => {
  const givenMaxEntries = 3;
  let lruCache: LruCache<number>;

  beforeEach(() => {
    lruCache = new LruCache(givenMaxEntries);
    lruCache.set('1', 1);
    lruCache.set('2', 2);
    lruCache.set('3', 3);
  });

  it('should have stored the given values', () => {
    expect(lruCache.get('1')).toBe(1);
    expect(lruCache.get('2')).toBe(2);
    expect(lruCache.get('3')).toBe(3);
    expect(lruCache.size).toBe(lruCache.maxEntries);

    expect(lruCache.has('1')).toBe(true);
    expect(lruCache.has('4')).toBe(false);
  });

  it('should delete a given key', () => {
    lruCache.delete('2');

    expect(lruCache.has('2')).toBe(false);
    expect(lruCache.get('1')).toBe(1);
    expect(lruCache.get('2')).toBeUndefined();
    expect(lruCache.get('3')).toBe(3);
    expect(lruCache.size).toBe(lruCache.maxEntries - 1);
  });

  it('should store only maxEntries by removing the least recently used item', () => {
    lruCache.get('3');
    lruCache.get('2');
    lruCache.get('1'); // '3' is least recently used item

    lruCache.set('4', 4);

    expect(lruCache.get('1')).toBe(1);
    expect(lruCache.get('2')).toBe(2);
    expect(lruCache.get('3')).toBe(undefined);
    expect(lruCache.get('4')).toBe(4);
    expect(lruCache.size).toBe(lruCache.maxEntries);
  });

  it('should store only maxEntries by removing an existing item', () => {
    lruCache.get('3');
    lruCache.get('2');
    lruCache.get('1'); // '3' is least recently used item

    lruCache.set('2', 5); // '2' is an existing item

    expect(lruCache.get('1')).toBe(1);
    expect(lruCache.get('2')).toBe(5);
    expect(lruCache.get('3')).toBe(3);
    expect(lruCache.size).toBe(lruCache.maxEntries);
  });

  it('should apply new positive maxEntries', () => {
    lruCache.get('3');
    lruCache.get('2');
    lruCache.get('1'); // '3' is least recently used item

    lruCache.maxEntries = 2;
    expect(lruCache.size).toBe(lruCache.maxEntries);
    expect(lruCache.get('1')).toBe(1);
    expect(lruCache.get('2')).toBe(2);
    expect(lruCache.get('3')).toBe(undefined);
  });

  it('maxEntries not apply negative maxEntries', () => {
    lruCache.maxEntries = -5;
    expect(lruCache.maxEntries).toBe(0);
    expect(lruCache.size).toBe(0);
    expect(lruCache.get('1')).toBe(undefined);
    expect(lruCache.get('2')).toBe(undefined);
    expect(lruCache.get('3')).toBe(undefined);
  });

  it('should have default maxEntries defined', () => {
    const cache = new LruCache();
    expect(cache.maxEntries).toBeDefined();
  });
});
